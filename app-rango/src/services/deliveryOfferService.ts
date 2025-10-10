/**
 * SERVIÇO DE OFERTAS DE ENTREGA
 * 
 * Gerencia ofertas de entrega em tempo real (integração com Fase 1)
 * Conecta com as collections criadas no web-rango:
 * - delivery_offers (ofertas)
 * - delivery_partners (entregadores)
 * - orders (pedidos)
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Unsubscribe,
  serverTimestamp,
  Timestamp,
  writeBatch,
  GeoPoint,
} from 'firebase/firestore';
import { db } from './firebaseConfig';

/**
 * TIPOS (alinhados com web-rango/src/types/delivery.ts)
 */

export type OfferStatus = 'open' | 'accepted' | 'expired' | 'cancelled' | 'failed';
export type DeliveryStatus = 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';

export interface DeliveryOffer {
  id: string;
  order_id: string;
  store_id: string;
  store_name: string;
  store_address?: string;
  
  // Localização
  pickup_location: GeoPoint;
  delivery_location: GeoPoint;
  pickup_address: string;
  delivery_address: string;
  
  // Valores
  distance_km: number;
  delivery_fee: number;
  partner_earning: number;
  platform_commission: number;
  
  // Status e visibilidade
  status: OfferStatus;
  visible_to_partners: string[]; // IDs dos entregadores que podem ver
  accepted_by?: string; // ID do entregador que aceitou
  
  // Timestamps
  created_at: Timestamp;
  expires_at: Timestamp;
  accepted_at?: Timestamp;
  
  // Metadata
  attempt_number: number;
  search_radius_km: number;
}

export interface DeliveryInfo {
  partner_id?: string;
  partner_name?: string;
  partner_phone?: string;
  partner_photo_url?: string;
  partner_vehicle_type?: string;
  
  status: DeliveryStatus;
  
  pickup_location: GeoPoint;
  delivery_location: GeoPoint;
  partner_current_location?: GeoPoint;
  
  assigned_at?: Timestamp;
  picked_up_at?: Timestamp;
  delivered_at?: Timestamp;
  
  delivery_fee: number;
  partner_earning: number;
  platform_commission: number;
  
  rating?: {
    score: number;
    comment?: string;
    created_at: Timestamp;
  };
}

/**
 * FUNÇÕES - OFERTAS
 */

/**
 * Buscar ofertas disponíveis para o entregador
 */
export const getAvailableOffers = async (partnerId: string): Promise<DeliveryOffer[]> => {
  try {
    // Consulta simplificada - sem orderBy para evitar necessidade de índice composto
    const q = query(
      collection(db, 'delivery_offers'),
      where('visible_to_partners', 'array-contains', partnerId),
      where('status', '==', 'open')
    );

    const snapshot = await getDocs(q);
    const offers: DeliveryOffer[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      
      // Verificar se a oferta não expirou
      const now = new Date();
      const expiresAt = data.expires_at?.toDate();
      
      if (!expiresAt || expiresAt > now) {
        offers.push({
          id: doc.id,
          ...data,
        } as DeliveryOffer);
      }
    });

    // Ordenar manualmente por created_at (mais recente primeiro)
    offers.sort((a, b) => {
      const timeA = a.created_at?.toDate().getTime() || 0;
      const timeB = b.created_at?.toDate().getTime() || 0;
      return timeB - timeA;
    });

    // Limitar a 10 resultados
    const limitedOffers = offers.slice(0, 10);

    console.log(`✅ Ofertas disponíveis para ${partnerId}:`, limitedOffers.length);
    return limitedOffers;
  } catch (error) {
    console.error('❌ Erro ao buscar ofertas:', error);
    return [];
  }
};

/**
 * Escutar ofertas em tempo real
 */
export const subscribeToOffers = (
  partnerId: string,
  callback: (offers: DeliveryOffer[]) => void
): Unsubscribe => {
  console.log(`🔔 Inscrevendo em ofertas para: ${partnerId}`);
  
  // Consulta simplificada - sem orderBy para evitar necessidade de índice composto
  const q = query(
    collection(db, 'delivery_offers'),
    where('visible_to_partners', 'array-contains', partnerId),
    where('status', '==', 'open')
  );

  return onSnapshot(q, 
    (snapshot) => {
      const offers: DeliveryOffer[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        
        // Verificar se a oferta não expirou
        const now = new Date();
        const expiresAt = data.expires_at?.toDate();
        
        if (expiresAt && expiresAt > now) {
          offers.push({
            id: doc.id,
            ...data,
          } as DeliveryOffer);
        }
      });
      
      // Ordenar manualmente por created_at (mais recente primeiro)
      offers.sort((a, b) => {
        const timeA = a.created_at?.toDate().getTime() || 0;
        const timeB = b.created_at?.toDate().getTime() || 0;
        return timeB - timeA;
      });
      
      console.log(`🔄 Ofertas atualizadas:`, offers.length);
      callback(offers);
    },
    (error) => {
      console.error('❌ Erro ao escutar ofertas:', error);
      callback([]);
    }
  );
};

/**
 * Aceitar oferta
 */
export const acceptOffer = async (
  offerId: string,
  partnerId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log(`✅ Aceitando oferta ${offerId} para entregador ${partnerId}`);
    
    // 1. Verificar se a oferta ainda está disponível
    const offerDoc = await getDoc(doc(db, 'delivery_offers', offerId));
    
    if (!offerDoc.exists()) {
      return { success: false, error: 'Oferta não encontrada' };
    }
    
    const offerData = offerDoc.data() as DeliveryOffer;
    
    if (offerData.status !== 'open') {
      return { success: false, error: 'Oferta não está mais disponível' };
    }
    
    // Verificar expiração
    const now = new Date();
    const expiresAt = offerData.expires_at?.toDate();
    
    if (expiresAt && expiresAt < now) {
      return { success: false, error: 'Oferta expirada' };
    }
    
    // 2. Atualizar a oferta para aceita
    // A Cloud Function "assignDeliveryPartner" será disparada e fará o resto
    await updateDoc(doc(db, 'delivery_offers', offerId), {
      status: 'accepted',
      accepted_by: partnerId,
      accepted_at: serverTimestamp(),
    });
    
    console.log(`✅ Oferta aceita com sucesso!`);
    return { success: true };
    
  } catch (error: any) {
    console.error('❌ Erro ao aceitar oferta:', error);
    return { success: false, error: error.message || 'Erro ao aceitar oferta' };
  }
};

/**
 * Recusar oferta (remove da lista de visíveis)
 */
export const declineOffer = async (
  offerId: string,
  partnerId: string
): Promise<void> => {
  try {
    const offerDoc = await getDoc(doc(db, 'delivery_offers', offerId));
    
    if (!offerDoc.exists()) {
      console.warn('Oferta não encontrada');
      return;
    }
    
    const offerData = offerDoc.data();
    const visiblePartners = offerData.visible_to_partners || [];
    
    // Remover entregador da lista de visíveis
    const updatedVisible = visiblePartners.filter((id: string) => id !== partnerId);
    
    await updateDoc(doc(db, 'delivery_offers', offerId), {
      visible_to_partners: updatedVisible,
    });
    
    console.log(`✅ Oferta ${offerId} recusada pelo entregador ${partnerId}`);
  } catch (error) {
    console.error('❌ Erro ao recusar oferta:', error);
  }
};

/**
 * FUNÇÕES - ENTREGA ATIVA
 */

/**
 * Buscar entrega ativa do entregador
 */
export const getActiveDelivery = async (
  partnerId: string
): Promise<{ orderId: string; delivery: DeliveryInfo } | null> => {
  try {
    // Buscar pedido onde o entregador está atribuído e status não é delivered/cancelled
    const q = query(
      collection(db, 'orders'),
      where('delivery.partner_id', '==', partnerId),
      where('delivery.status', 'in', ['assigned', 'picked_up', 'in_transit']),
      limit(1)
    );

    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }

    const orderDoc = snapshot.docs[0];
    const orderData = orderDoc.data();

    return {
      orderId: orderDoc.id,
      delivery: orderData.delivery as DeliveryInfo,
    };
  } catch (error) {
    console.error('❌ Erro ao buscar entrega ativa:', error);
    return null;
  }
};

/**
 * Escutar entrega ativa em tempo real
 */
export const subscribeToActiveDelivery = (
  partnerId: string,
  callback: (delivery: { orderId: string; delivery: DeliveryInfo; orderData: any } | null) => void
): Unsubscribe => {
  console.log(`🔔 Inscrevendo em entrega ativa para: ${partnerId}`);
  
  const q = query(
    collection(db, 'orders'),
    where('delivery.partner_id', '==', partnerId),
    where('delivery.status', 'in', ['assigned', 'picked_up', 'in_transit']),
    limit(1)
  );

  return onSnapshot(q,
    (snapshot) => {
      if (snapshot.empty) {
        callback(null);
        return;
      }

      const orderDoc = snapshot.docs[0];
      const orderData = orderDoc.data();

      callback({
        orderId: orderDoc.id,
        delivery: orderData.delivery as DeliveryInfo,
        orderData: orderData,
      });
    },
    (error) => {
      console.error('❌ Erro ao escutar entrega ativa:', error);
      callback(null);
    }
  );
};

/**
 * Atualizar status da entrega
 */
export const updateDeliveryStatus = async (
  orderId: string,
  status: DeliveryStatus,
  partnerId: string,
  currentLocation?: { latitude: number; longitude: number }
): Promise<void> => {
  try {
    const updateData: any = {
      'delivery.status': status,
    };

    // Adicionar timestamp específico
    if (status === 'picked_up') {
      updateData['delivery.picked_up_at'] = serverTimestamp();
    } else if (status === 'delivered') {
      updateData['delivery.delivered_at'] = serverTimestamp();
    }

    // Atualizar localização se fornecida
    if (currentLocation) {
      updateData['delivery.partner_current_location'] = new GeoPoint(
        currentLocation.latitude,
        currentLocation.longitude
      );
    }

    await updateDoc(doc(db, 'orders', orderId), updateData);
    
    console.log(`✅ Status da entrega atualizado: ${orderId} → ${status}`);
    
    // A Cloud Function "completeDelivery" será disparada se status = delivered
  } catch (error) {
    console.error('❌ Erro ao atualizar status da entrega:', error);
    throw error;
  }
};

/**
 * Atualizar localização do entregador durante a entrega
 */
export const updateDeliveryLocation = async (
  orderId: string,
  latitude: number,
  longitude: number
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'orders', orderId), {
      'delivery.partner_current_location': new GeoPoint(latitude, longitude),
    });
    
    // Também atualizar no delivery_partners
    const orderDoc = await getDoc(doc(db, 'orders', orderId));
    if (orderDoc.exists()) {
      const partnerId = orderDoc.data().delivery?.partner_id;
      if (partnerId) {
        await updateDoc(doc(db, 'delivery_partners', partnerId), {
          current_location: new GeoPoint(latitude, longitude),
          last_location_update: serverTimestamp(),
        });
      }
    }
  } catch (error) {
    console.error('❌ Erro ao atualizar localização:', error);
  }
};

/**
 * FUNÇÕES - HISTÓRICO E GANHOS
 */

/**
 * Buscar ganhos do entregador
 */
export const getPartnerEarnings = async (
  partnerId: string,
  status?: 'pending' | 'paid' | 'processing'
): Promise<any[]> => {
  try {
    let q;
    
    if (status) {
      q = query(
        collection(db, 'delivery_earnings'),
        where('partner_id', '==', partnerId),
        where('status', '==', status),
        orderBy('created_at', 'desc'),
        limit(50)
      );
    } else {
      q = query(
        collection(db, 'delivery_earnings'),
        where('partner_id', '==', partnerId),
        orderBy('created_at', 'desc'),
        limit(50)
      );
    }

    const snapshot = await getDocs(q);
    const earnings: any[] = [];

    snapshot.forEach((doc) => {
      earnings.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return earnings;
  } catch (error) {
    console.error('❌ Erro ao buscar ganhos:', error);
    return [];
  }
};

/**
 * Buscar histórico de entregas
 */
export const getDeliveryHistory = async (
  partnerId: string,
  limitCount: number = 20
): Promise<any[]> => {
  try {
    const q = query(
      collection(db, 'orders'),
      where('delivery.partner_id', '==', partnerId),
      where('delivery.status', '==', 'delivered'),
      orderBy('delivery.delivered_at', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    const history: any[] = [];

    snapshot.forEach((doc) => {
      history.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return history;
  } catch (error) {
    console.error('❌ Erro ao buscar histórico:', error);
    return [];
  }
};

/**
 * FUNÇÕES - PERFIL
 */

/**
 * Atualizar status operacional do entregador
 */
export const updateOperationalStatus = async (
  partnerId: string,
  status: 'offline' | 'online_idle' | 'on_delivery' | 'unavailable',
  currentLocation?: { latitude: number; longitude: number }
): Promise<void> => {
  try {
    const updateData: any = {
      operational_status: status,
      updated_at: serverTimestamp(),
    };

    if (currentLocation) {
      updateData.current_location = new GeoPoint(
        currentLocation.latitude,
        currentLocation.longitude
      );
      updateData.last_location_update = serverTimestamp();
    }

    if (status === 'offline') {
      updateData.current_order_id = null;
    }

    // Usar setDoc com merge para criar se não existir
    await setDoc(
      doc(db, 'delivery_partners', partnerId), 
      updateData,
      { merge: true } // Cria se não existir, atualiza se existir
    );
    
    console.log(`✅ Status operacional atualizado: ${partnerId} → ${status}`);
  } catch (error) {
    console.error('❌ Erro ao atualizar status operacional:', error);
    throw error;
  }
};

/**
 * Buscar dados do perfil do entregador
 */
export const getPartnerProfile = async (partnerId: string): Promise<any | null> => {
  try {
    const partnerDoc = await getDoc(doc(db, 'delivery_partners', partnerId));
    
    if (!partnerDoc.exists()) {
      return null;
    }

    return {
      id: partnerDoc.id,
      ...partnerDoc.data(),
    };
  } catch (error) {
    console.error('❌ Erro ao buscar perfil:', error);
    return null;
  }
};

/**
 * Escutar perfil do entregador em tempo real
 */
export const subscribeToPartnerProfile = (
  partnerId: string,
  callback: (profile: any | null) => void
): Unsubscribe => {
  return onSnapshot(
    doc(db, 'delivery_partners', partnerId),
    (snapshot) => {
      if (!snapshot.exists()) {
        callback(null);
        return;
      }

      callback({
        id: snapshot.id,
        ...snapshot.data(),
      });
    },
    (error) => {
      console.error('❌ Erro ao escutar perfil:', error);
      callback(null);
    }
  );
};

/**
 * HELPERS
 */

/**
 * Calcular tempo estimado de expiração
 */
export const getOfferTimeRemaining = (expiresAt: Timestamp): number => {
  const now = new Date().getTime();
  const expiry = expiresAt.toDate().getTime();
  const remaining = Math.max(0, expiry - now);
  return Math.floor(remaining / 1000); // segundos
};

/**
 * Formatar valor monetário
 */
export const formatCurrency = (value: number): string => {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
};

/**
 * Calcular distância entre dois pontos (aproximado)
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

