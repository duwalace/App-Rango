/**
 * SERVIÇO DE OFERTAS DE ENTREGA
 * 
 * Gerencia criação e gestão de ofertas de entrega para delivery partners
 */

import { 
  collection, 
  doc, 
  addDoc,
  updateDoc,
  serverTimestamp,
  GeoPoint,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order } from '@/types/shared';

interface DeliveryOfferData {
  order_id: string;
  store_id: string;
  store_name: string;
  customer_name: string;
  pickup_address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    latitude?: number;
    longitude?: number;
  };
  delivery_address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    latitude?: number;
    longitude?: number;
  };
  distance_km: number;
  partner_earning: number;
  estimated_time_minutes: number;
  items_summary: string;
  payment_method: string;
  total_value: number;
}

/**
 * Criar oferta de entrega para um pedido
 */
export const createDeliveryOffer = async (order: Order): Promise<string> => {
  try {
    console.log('🚀 Criando oferta de entrega para pedido:', order.id);

    // Validar se já existe uma oferta para este pedido
    const existingOfferQuery = query(
      collection(db, 'delivery_offers'),
      where('order_id', '==', order.id),
      where('status', 'in', ['available', 'pending', 'accepted'])
    );
    
    const existingOffers = await getDocs(existingOfferQuery);
    
    if (!existingOffers.empty) {
      throw new Error('Já existe uma oferta ativa para este pedido');
    }

    // Calcular distância estimada (simplificado - 2km por padrão)
    const estimatedDistance = 2.5;

    // Calcular ganho do entregador (R$ 5 base + R$ 1 por km)
    const partnerEarning = 5 + (estimatedDistance * 1);

    // Resumo dos itens
    const itemsSummary = order.items
      .map(item => `${item.quantity}x ${item.name}`)
      .join(', ')
      .substring(0, 100);

    const offerData: DeliveryOfferData = {
      order_id: order.id!,
      store_id: order.storeId,
      store_name: order.storeName || 'Loja',
      customer_name: order.customerName || 'Cliente',
      pickup_address: {
        street: 'Rua da Loja',
        number: '123',
        neighborhood: 'Centro',
        city: order.address?.city || 'São José dos Campos',
        state: order.address?.state || 'SP',
        zipCode: '12345-678',
      },
      delivery_address: {
        street: order.address?.street || 'Rua do Cliente',
        number: order.address?.number || '0',
        complement: order.address?.complement,
        neighborhood: order.address?.neighborhood || 'Bairro',
        city: order.address?.city || 'São José dos Campos',
        state: order.address?.state || 'SP',
        zipCode: order.address?.zipCode || '12345-000',
      },
      distance_km: estimatedDistance,
      partner_earning: partnerEarning,
      estimated_time_minutes: Math.round(estimatedDistance * 10), // ~10 min por km
      items_summary: itemsSummary,
      payment_method: order.paymentMethod || 'Pix',
      total_value: order.total || 0,
    };

    // Criar oferta no Firestore
    const offerRef = await addDoc(collection(db, 'delivery_offers'), {
      ...offerData,
      status: 'available',
      created_at: serverTimestamp(),
      expires_at: new Date(Date.now() + 10 * 60 * 1000), // Expira em 10 minutos
      assigned_partner_id: null,
      accepted_at: null,
      pickup_location: order.address?.latitude && order.address?.longitude 
        ? new GeoPoint(order.address.latitude, order.address.longitude)
        : null,
    });

    // Atualizar pedido com status de entrega
    if (order.id) {
      await updateDoc(doc(db, 'orders', order.id), {
        deliveryStatus: 'searching_partner',
        deliveryOfferId: offerRef.id,
        updatedAt: serverTimestamp(),
      });
    }

    console.log('✅ Oferta criada com sucesso:', offerRef.id);
    return offerRef.id;

  } catch (error: any) {
    console.error('❌ Erro ao criar oferta de entrega:', error);
    throw error;
  }
};

/**
 * Cancelar oferta de entrega
 */
export const cancelDeliveryOffer = async (offerId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'delivery_offers', offerId), {
      status: 'cancelled',
      cancelled_at: serverTimestamp(),
    });

    console.log('✅ Oferta cancelada:', offerId);
  } catch (error) {
    console.error('❌ Erro ao cancelar oferta:', error);
    throw error;
  }
};

/**
 * Calcular valor de entrega baseado na distância
 */
export const calculateDeliveryFee = (distanceKm: number): number => {
  const baseFee = 5; // R$ 5 taxa base
  const perKmFee = 1; // R$ 1 por km
  return baseFee + (distanceKm * perKmFee);
};

