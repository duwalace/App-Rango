/**
 * Cloud Function: Retry de Oferta de Entrega
 * 
 * Trigger: Scheduled (cada 30 segundos)
 * 
 * Verifica ofertas expiradas e expande o raio de busca:
 * - Tentativa 1: 5km
 * - Tentativa 2: 10km
 * - Tentativa 3: 15km
 * - Tentativa 4+: 20km (máximo)
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

interface GeoPoint {
  latitude: number;
  longitude: number;
}

/**
 * Calcular distância entre dois pontos
 */
const calculateDistance = (
  point1: GeoPoint,
  point2: GeoPoint
): number => {
  const R = 6371;
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
 * Buscar entregadores próximos
 */
const findNearbyPartners = async (
  location: GeoPoint,
  radiusKm: number
): Promise<string[]> => {
  try {
    const partnersSnapshot = await db
      .collection('delivery_partners')
      .where('status', '==', 'active')
      .where('operational_status', '==', 'online_idle')
      .get();
    
    const nearbyPartners: string[] = [];
    
    partnersSnapshot.forEach((doc) => {
      const partner = doc.data();
      
      if (partner.current_location) {
        const distance = calculateDistance(
          location,
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
    console.error('Erro ao buscar entregadores:', error);
    return [];
  }
};

/**
 * Função principal executada a cada 30 segundos
 */
export const retryDeliveryOffer = functions.pubsub
  .schedule('every 30 seconds')
  .onRun(async (context) => {
    console.log('🔄 Verificando ofertas expiradas...');
    
    try {
      const now = admin.firestore.Timestamp.now();
      
      // Buscar ofertas abertas que expiraram
      const expiredOffersSnapshot = await db
        .collection('delivery_offers')
        .where('status', '==', 'open')
        .where('expires_at', '<=', now)
        .limit(10) // Processar até 10 por vez
        .get();
      
      if (expiredOffersSnapshot.empty) {
        console.log('✅ Nenhuma oferta expirada');
        return null;
      }
      
      console.log(`⚠️ ${expiredOffersSnapshot.size} oferta(s) expirada(s)`);
      
      const batch = db.batch();
      let processedCount = 0;
      
      for (const offerDoc of expiredOffersSnapshot.docs) {
        const offer = offerDoc.data();
        const currentAttempt = offer.attempt_number || 1;
        const maxAttempts = 4;
        
        // Se já tentou muitas vezes, marcar como expirado
        if (currentAttempt >= maxAttempts) {
          console.log(`❌ Oferta ${offerDoc.id} excedeu máximo de tentativas`);
          
          batch.update(offerDoc.ref, {
            status: 'expired'
          });
          
          // Atualizar pedido como falho
          const orderRef = db.collection('orders').doc(offer.order_id);
          batch.update(orderRef, {
            'delivery.status': 'failed',
            'delivery.error': 'Nenhum entregador disponível'
          });
          
          processedCount++;
          continue;
        }
        
        // Expandir raio de busca
        const newRadius = Math.min(currentAttempt * 5 + 5, 20); // 10km, 15km, 20km...
        
        console.log(`🔍 Tentativa ${currentAttempt + 1}: expandindo raio para ${newRadius}km`);
        
        // Buscar novos entregadores no raio expandido
        const storeLocation: GeoPoint = {
          latitude: offer.pickup_location.latitude,
          longitude: offer.pickup_location.longitude
        };
        
        const nearbyPartners = await findNearbyPartners(storeLocation, newRadius);
        
        // Criar nova expiração (mais 60 segundos)
        const newExpiresAt = admin.firestore.Timestamp.fromMillis(
          now.toMillis() + 60000
        );
        
        // Atualizar oferta
        batch.update(offerDoc.ref, {
          visible_to_partners: nearbyPartners,
          search_radius_km: newRadius,
          attempt_number: currentAttempt + 1,
          expires_at: newExpiresAt,
          status: 'open' // Manter aberta
        });
        
        console.log(`✅ Oferta ${offerDoc.id} atualizada: ${nearbyPartners.length} entregadores em ${newRadius}km`);
        
        // TODO: Enviar notificação push para novos entregadores
        
        processedCount++;
      }
      
      // Commitar todas as atualizações
      await batch.commit();
      
      console.log(`✅ ${processedCount} oferta(s) processada(s)`);
      
      return { processed: processedCount };
      
    } catch (error) {
      console.error('❌ Erro ao processar ofertas expiradas:', error);
      throw error;
    }
  });

