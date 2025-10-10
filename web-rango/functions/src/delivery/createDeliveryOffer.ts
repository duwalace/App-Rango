/**
 * Cloud Function: Criar Oferta de Entrega
 * 
 * Trigger: onCreate em 'orders'
 * 
 * Quando um pedido é criado e confirmado pela loja:
 * 1. Busca entregadores disponíveis em raio de 5km
 * 2. Cria oferta de entrega
 * 3. Envia notificação push para entregadores
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

interface GeoPoint {
  latitude: number;
  longitude: number;
}

/**
 * Calcular distância entre dois pontos (Haversine)
 */
const calculateDistance = (
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
  return R * c;
};

const toRad = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};

/**
 * Calcular taxa de entrega baseada na distância
 */
const calculateDeliveryFee = (distanceKm: number): number => {
  const baseRate = 1.50; // R$ 1,50 por km
  const minFee = 5.00; // Fee mínimo
  
  const fee = distanceKm * baseRate;
  return Math.max(fee, minFee);
};

/**
 * Calcular quanto o entregador ganhará (80% do fee)
 */
const calculatePartnerEarning = (deliveryFee: number): number => {
  return deliveryFee * 0.8; // 80% para o entregador
};

/**
 * Buscar entregadores disponíveis em raio específico
 */
const findNearbyPartners = async (
  storeLocation: GeoPoint,
  radiusKm: number
): Promise<string[]> => {
  try {
    // Buscar entregadores online e ativos
    const partnersSnapshot = await db
      .collection('delivery_partners')
      .where('status', '==', 'active')
      .where('operational_status', '==', 'online_idle')
      .get();
    
    const nearbyPartners: string[] = [];
    
    // Filtrar por distância
    partnersSnapshot.forEach((doc) => {
      const partner = doc.data();
      
      if (partner.current_location) {
        const distance = calculateDistance(
          storeLocation,
          {
            latitude: partner.current_location.latitude,
            longitude: partner.current_location.longitude
          }
        );
        
        if (distance <= radiusKm) {
          nearbyPartners.push(doc.id);
        }
      }
    });
    
    return nearbyPartners;
  } catch (error) {
    console.error('Erro ao buscar entregadores próximos:', error);
    return [];
  }
};

/**
 * Função principal
 */
export const createDeliveryOffer = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snap, context) => {
    const order = snap.data();
    const orderId = context.params.orderId;
    
    console.log(`📦 Novo pedido criado: ${orderId}`);
    
    // Verificar se pedido precisa de entrega
    if (!order.delivery || order.delivery.status !== 'waiting_partner') {
      console.log('Pedido não precisa de entregador no momento');
      return null;
    }
    
    try {
      // Extrair localizações
      const storeLocation: GeoPoint = {
        latitude: order.delivery.pickup_location.latitude,
        longitude: order.delivery.pickup_location.longitude
      };
      
      const customerLocation: GeoPoint = {
        latitude: order.delivery.delivery_location.latitude,
        longitude: order.delivery.delivery_location.longitude
      };
      
      // Calcular distância
      const distanceKm = calculateDistance(storeLocation, customerLocation);
      
      // Calcular valores
      const deliveryFee = calculateDeliveryFee(distanceKm);
      const partnerEarning = calculatePartnerEarning(deliveryFee);
      
      // Buscar entregadores disponíveis (raio inicial: 5km)
      const initialRadius = 5;
      const nearbyPartners = await findNearbyPartners(storeLocation, initialRadius);
      
      if (nearbyPartners.length === 0) {
        console.log('⚠️ Nenhum entregador disponível em raio de 5km');
        // Função de retry expandirá o raio automaticamente
      }
      
      // Criar oferta de entrega
      const now = admin.firestore.Timestamp.now();
      const expiresAt = admin.firestore.Timestamp.fromMillis(
        now.toMillis() + 60000 // Expira em 60 segundos
      );
      
      const offerData = {
        order_id: orderId,
        store_id: order.storeId,
        store_name: order.storeName || 'Loja',
        
        pickup_location: new admin.firestore.GeoPoint(
          storeLocation.latitude,
          storeLocation.longitude
        ),
        delivery_location: new admin.firestore.GeoPoint(
          customerLocation.latitude,
          customerLocation.longitude
        ),
        distance_km: Math.round(distanceKm * 10) / 10, // Arredondar 1 casa decimal
        
        earning_amount: Math.round(partnerEarning * 100) / 100, // 2 casas decimais
        
        status: 'open',
        visible_to_partners: nearbyPartners,
        
        created_at: now,
        expires_at: expiresAt,
        
        attempt_number: 1,
        search_radius_km: initialRadius
      };
      
      const offerRef = await db.collection('delivery_offers').add(offerData);
      
      console.log(`✅ Oferta criada: ${offerRef.id}`);
      console.log(`📍 Distância: ${distanceKm.toFixed(1)}km`);
      console.log(`💰 Ganho entregador: R$ ${partnerEarning.toFixed(2)}`);
      console.log(`👥 ${nearbyPartners.length} entregadores notificados`);
      
      // TODO: Enviar notificação push para entregadores
      // Será implementado na função de notificações
      
      // Atualizar pedido com ID da oferta
      await snap.ref.update({
        'delivery.offer_id': offerRef.id,
        'delivery.delivery_fee': deliveryFee,
        'delivery.partner_earning': partnerEarning,
        'delivery.platform_commission': deliveryFee - partnerEarning,
        'delivery.distance_km': distanceKm,
        'delivery.pickup_eta_minutes': Math.ceil(distanceKm * 3) // Estimativa: 3min/km
      });
      
      return { success: true, offerId: offerRef.id, partnersNotified: nearbyPartners.length };
      
    } catch (error) {
      console.error('❌ Erro ao criar oferta de entrega:', error);
      
      // Atualizar pedido com erro
      await snap.ref.update({
        'delivery.status': 'failed',
        'delivery.error': 'Falha ao criar oferta de entrega'
      });
      
      throw error;
    }
  });

