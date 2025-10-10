/**
 * Cloud Functions para Firebase - Módulo de Entregadores
 * 
 * Este arquivo exporta todas as Cloud Functions do sistema
 */

import * as admin from 'firebase-admin';

// Inicializar Firebase Admin SDK
admin.initializeApp();

// ==========================================
// DELIVERY FUNCTIONS
// ==========================================

// Criar oferta de entrega quando pedido é criado
export { createDeliveryOffer } from './delivery/createDeliveryOffer';

// Retry de ofertas expiradas (expandir raio)
export { retryDeliveryOffer } from './delivery/retryDeliveryOffer';

// Atribuir entregador quando oferta é aceita
export { assignDeliveryPartner } from './delivery/assignDeliveryPartner';

// Completar entrega e processar pagamento
export { completeDelivery } from './delivery/completeDelivery';

// ==========================================
// HELPER FUNCTIONS (futuras)
// ==========================================

// TODO: updateDeliveryETAs - Atualizar ETAs periodicamente
// TODO: sendDeliveryNotifications - Enviar notificações push
// TODO: updatePartnerRating - Atualizar rating quando avaliado
// TODO: processWithdrawal - Processar saques automaticamente

console.log('🔥 Cloud Functions carregadas com sucesso');

