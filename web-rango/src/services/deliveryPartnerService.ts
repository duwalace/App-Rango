// Serviço para gerenciar Entregadores
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  updateDoc,
  serverTimestamp,
  Timestamp,
  writeBatch,
  GeoPoint
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  DeliveryPartner, 
  DeliveryPartnerFilters, 
  DeliveryPartnerStats,
  DeliveryPartnerStatus,
  OperationalStatus,
  WithdrawalRequest,
  DeliveryEarning
} from '@/types/delivery';

const COLLECTION_NAME = 'delivery_partners';

// ==========================================
// BUSCAR ENTREGADORES
// ==========================================

/**
 * Buscar todos os entregadores com filtros
 */
export const getDeliveryPartners = async (
  filters?: DeliveryPartnerFilters
): Promise<DeliveryPartner[]> => {
  try {
    let q = query(collection(db, COLLECTION_NAME));
    
    // Aplicar filtros
    if (filters?.status) {
      q = query(q, where('status', '==', filters.status));
    }
    
    if (filters?.operational_status) {
      q = query(q, where('operational_status', '==', filters.operational_status));
    }
    
    if (filters?.approval_status) {
      q = query(q, where('approval_status.status', '==', filters.approval_status));
    }
    
    if (filters?.vehicle_type) {
      q = query(q, where('vehicle.type', '==', filters.vehicle_type));
    }
    
    if (filters?.zone) {
      q = query(q, where('operating_zones', 'array-contains', filters.zone));
    }
    
    if (filters?.min_rating) {
      q = query(q, where('metrics.average_rating', '>=', filters.min_rating));
    }
    
    // Ordenar por data de criação (mais recentes primeiro)
    q = query(q, orderBy('created_at', 'desc'));
    
    const snapshot = await getDocs(q);
    const partners = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as DeliveryPartner));
    
    // Filtro de busca por texto (cliente-side)
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      return partners.filter(p => 
        p.full_name.toLowerCase().includes(searchLower) ||
        p.email.toLowerCase().includes(searchLower) ||
        p.phone.includes(searchLower)
      );
    }
    
    return partners;
  } catch (error) {
    console.error('Erro ao buscar entregadores:', error);
    throw new Error('Falha ao buscar entregadores');
  }
};

/**
 * Buscar entregador por ID
 */
export const getDeliveryPartnerById = async (
  partnerId: string
): Promise<DeliveryPartner | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, partnerId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return {
      id: docSnap.id,
      ...docSnap.data()
    } as DeliveryPartner;
  } catch (error) {
    console.error('Erro ao buscar entregador:', error);
    throw new Error('Falha ao buscar entregador');
  }
};

/**
 * Buscar entregadores online em uma zona específica
 */
export const getOnlinePartnersInZone = async (
  zoneId: string
): Promise<DeliveryPartner[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('operational_status', '==', 'online_idle'),
      where('operating_zones', 'array-contains', zoneId),
      where('status', '==', 'active')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as DeliveryPartner));
  } catch (error) {
    console.error('Erro ao buscar entregadores online:', error);
    throw new Error('Falha ao buscar entregadores online');
  }
};

// ==========================================
// ESTATÍSTICAS
// ==========================================

/**
 * Obter estatísticas gerais dos entregadores
 */
export const getDeliveryPartnerStats = async (): Promise<DeliveryPartnerStats> => {
  try {
    const allPartners = await getDeliveryPartners();
    
    return {
      total_partners: allPartners.length,
      active_partners: allPartners.filter(p => p.status === 'active').length,
      online_partners: allPartners.filter(p => p.operational_status === 'online_idle').length,
      on_delivery_partners: allPartners.filter(p => p.operational_status === 'on_delivery').length,
      pending_approval: allPartners.filter(p => p.approval_status.status === 'pending').length,
    };
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    throw new Error('Falha ao buscar estatísticas');
  }
};

// ==========================================
// APROVAÇÃO E GESTÃO
// ==========================================

/**
 * Aprovar entregador
 */
export const approveDeliveryPartner = async (
  partnerId: string,
  adminId: string
): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, partnerId);
    
    await updateDoc(docRef, {
      status: 'active',
      'approval_status.status': 'approved',
      'approval_status.reviewed_by': adminId,
      'approval_status.reviewed_at': serverTimestamp(),
      updated_at: serverTimestamp()
    });
    
    console.log(`Entregador ${partnerId} aprovado com sucesso`);
  } catch (error) {
    console.error('Erro ao aprovar entregador:', error);
    throw new Error('Falha ao aprovar entregador');
  }
};

/**
 * Rejeitar entregador
 */
export const rejectDeliveryPartner = async (
  partnerId: string,
  reason: string,
  adminId: string
): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, partnerId);
    
    await updateDoc(docRef, {
      status: 'inactive',
      'approval_status.status': 'rejected',
      'approval_status.rejection_reason': reason,
      'approval_status.reviewed_by': adminId,
      'approval_status.reviewed_at': serverTimestamp(),
      updated_at: serverTimestamp()
    });
    
    console.log(`Entregador ${partnerId} rejeitado: ${reason}`);
  } catch (error) {
    console.error('Erro ao rejeitar entregador:', error);
    throw new Error('Falha ao rejeitar entregador');
  }
};

/**
 * Suspender entregador
 */
export const suspendDeliveryPartner = async (
  partnerId: string,
  reason: string,
  adminId: string
): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, partnerId);
    
    await updateDoc(docRef, {
      status: 'suspended',
      operational_status: 'unavailable',
      'approval_status.rejection_reason': reason,
      updated_at: serverTimestamp()
    });
    
    console.log(`Entregador ${partnerId} suspenso: ${reason}`);
  } catch (error) {
    console.error('Erro ao suspender entregador:', error);
    throw new Error('Falha ao suspender entregador');
  }
};

/**
 * Reativar entregador
 */
export const reactivateDeliveryPartner = async (
  partnerId: string,
  adminId: string
): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, partnerId);
    
    await updateDoc(docRef, {
      status: 'active',
      operational_status: 'offline',
      updated_at: serverTimestamp()
    });
    
    console.log(`Entregador ${partnerId} reativado`);
  } catch (error) {
    console.error('Erro ao reativar entregador:', error);
    throw new Error('Falha ao reativar entregador');
  }
};

/**
 * Atualizar dados do entregador (admin)
 */
export const updateDeliveryPartner = async (
  partnerId: string,
  data: Partial<DeliveryPartner>
): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, partnerId);
    
    await updateDoc(docRef, {
      ...data,
      updated_at: serverTimestamp()
    });
    
    console.log(`Entregador ${partnerId} atualizado`);
  } catch (error) {
    console.error('Erro ao atualizar entregador:', error);
    throw new Error('Falha ao atualizar entregador');
  }
};

// ==========================================
// SAQUES E FINANÇAS
// ==========================================

/**
 * Buscar solicitações de saque
 */
export const getWithdrawalRequests = async (
  status?: 'pending' | 'approved' | 'rejected' | 'completed'
): Promise<WithdrawalRequest[]> => {
  try {
    let q = query(collection(db, 'withdrawal_requests'));
    
    if (status) {
      q = query(q, where('status', '==', status));
    }
    
    q = query(q, orderBy('requested_at', 'desc'), limit(100));
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as WithdrawalRequest));
  } catch (error) {
    console.error('Erro ao buscar solicitações de saque:', error);
    throw new Error('Falha ao buscar solicitações de saque');
  }
};

/**
 * Aprovar saque
 */
export const approveWithdrawal = async (
  requestId: string,
  adminId: string,
  transactionId?: string
): Promise<void> => {
  try {
    const batch = writeBatch(db);
    const requestRef = doc(db, 'withdrawal_requests', requestId);
    
    // Atualizar request
    batch.update(requestRef, {
      status: 'completed',
      processed_by: adminId,
      processed_at: serverTimestamp(),
      transaction_id: transactionId
    });
    
    // Buscar request para pegar earnings_ids
    const requestSnap = await getDoc(requestRef);
    const requestData = requestSnap.data() as WithdrawalRequest;
    
    // Atualizar earnings para withdrawn
    for (const earningId of requestData.earnings_ids) {
      const earningRef = doc(db, 'delivery_earnings', earningId);
      batch.update(earningRef, {
        status: 'withdrawn',
        withdrawal_id: requestId,
        paid_at: serverTimestamp()
      });
    }
    
    // Atualizar balance do entregador
    const partnerRef = doc(db, COLLECTION_NAME, requestData.partner_id);
    const partnerSnap = await getDoc(partnerRef);
    const partnerData = partnerSnap.data() as DeliveryPartner;
    
    batch.update(partnerRef, {
      'metrics.current_balance': partnerData.metrics.current_balance - requestData.amount,
      updated_at: serverTimestamp()
    });
    
    await batch.commit();
    console.log(`Saque ${requestId} aprovado e processado`);
  } catch (error) {
    console.error('Erro ao aprovar saque:', error);
    throw new Error('Falha ao aprovar saque');
  }
};

/**
 * Rejeitar saque
 */
export const rejectWithdrawal = async (
  requestId: string,
  reason: string,
  adminId: string
): Promise<void> => {
  try {
    const requestRef = doc(db, 'withdrawal_requests', requestId);
    
    await updateDoc(requestRef, {
      status: 'rejected',
      rejection_reason: reason,
      processed_by: adminId,
      processed_at: serverTimestamp()
    });
    
    console.log(`Saque ${requestId} rejeitado: ${reason}`);
  } catch (error) {
    console.error('Erro ao rejeitar saque:', error);
    throw new Error('Falha ao rejeitar saque');
  }
};

/**
 * Buscar ganhos de um entregador
 */
export const getPartnerEarnings = async (
  partnerId: string,
  status?: 'pending' | 'available' | 'withdrawn'
): Promise<DeliveryEarning[]> => {
  try {
    let q = query(
      collection(db, 'delivery_earnings'),
      where('partner_id', '==', partnerId)
    );
    
    if (status) {
      q = query(q, where('status', '==', status));
    }
    
    q = query(q, orderBy('created_at', 'desc'), limit(100));
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as DeliveryEarning));
  } catch (error) {
    console.error('Erro ao buscar ganhos:', error);
    throw new Error('Falha ao buscar ganhos');
  }
};

// ==========================================
// HELPERS
// ==========================================

/**
 * Calcular distância entre dois pontos (fórmula de Haversine)
 */
export const calculateDistance = (
  point1: GeoPoint,
  point2: GeoPoint
): number => {
  const R = 6371; // Raio da Terra em km
  const dLat = toRad(point2.latitude - point1.latitude);
  const dLon = toRad(point2.longitude - point1.longitude);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.latitude)) *
    Math.cos(toRad(point2.latitude)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distância em km
};

const toRad = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};

/**
 * Calcular taxa de entrega baseada na distância
 */
export const calculateDeliveryFee = (
  distanceKm: number,
  baseRate: number = 1.50 // R$ 1,50 por km
): number => {
  const baseFee = distanceKm * baseRate;
  const minFee = 5.00; // Fee mínimo R$ 5,00
  
  return Math.max(baseFee, minFee);
};

