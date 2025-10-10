/**
 * Cloud Function: Completar Entrega
 * 
 * Trigger: onUpdate em 'orders'
 * 
 * Quando status da entrega muda para 'delivered':
 * 1. Cria registro em delivery_earnings
 * 2. Atualiza métricas do entregador
 * 3. Libera entregador (operational_status = online_idle)
 * 4. Atualiza saldo do entregador
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

/**
 * Função principal
 */
export const completeDelivery = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const orderBefore = change.before.data();
    const orderAfter = change.after.data();
    const orderId = context.params.orderId;
    
    // Verificar se entrega foi completada
    const deliveryBefore = orderBefore.delivery;
    const deliveryAfter = orderAfter.delivery;
    
    if (!deliveryBefore || !deliveryAfter) {
      return null;
    }
    
    if (deliveryBefore.status !== 'delivered' && deliveryAfter.status === 'delivered') {
      console.log(`✅ Entrega completada: ${orderId}`);
      
      const partnerId = deliveryAfter.partner_id;
      
      if (!partnerId) {
        console.error('❌ Pedido sem entregador atribuído');
        return null;
      }
      
      try {
        const now = admin.firestore.Timestamp.now();
        const batch = db.batch();
        
        // 1. Criar registro de earning
        const earningData = {
          partner_id: partnerId,
          order_id: orderId,
          
          gross_amount: deliveryAfter.delivery_fee,
          platform_fee: deliveryAfter.platform_commission,
          net_amount: deliveryAfter.partner_earning,
          
          status: 'available', // Disponível para saque
          
          payment_method: null,
          withdrawal_id: null,
          paid_at: null,
          
          created_at: now,
          completed_at: deliveryAfter.delivered_at || now
        };
        
        const earningRef = db.collection('delivery_earnings').doc();
        batch.set(earningRef, earningData);
        
        console.log(`💰 Earning criado: R$ ${deliveryAfter.partner_earning.toFixed(2)}`);
        
        // 2. Buscar dados atuais do entregador
        const partnerRef = db.collection('delivery_partners').doc(partnerId);
        const partnerDoc = await partnerRef.get();
        
        if (!partnerDoc.exists) {
          throw new Error(`Entregador ${partnerId} não encontrado`);
        }
        
        const partner = partnerDoc.data();
        
        if (!partner) {
          throw new Error('Dados do entregador inválidos');
        }
        
        // 3. Calcular novas métricas
        const completedDeliveries = (partner.metrics?.completed_deliveries || 0) + 1;
        const totalDeliveries = partner.metrics?.total_deliveries || 0;
        const totalEarnings = (partner.metrics?.total_earnings || 0) + deliveryAfter.partner_earning;
        const currentBalance = (partner.metrics?.current_balance || 0) + deliveryAfter.partner_earning;
        
        // Calcular se foi no prazo (SLA)
        const assignedAt = deliveryAfter.assigned_at;
        const deliveredAt = deliveryAfter.delivered_at || now;
        const expectedMinutes = (deliveryAfter.pickup_eta_minutes || 15) + 
                                (deliveryAfter.delivery_eta_minutes || 15);
        
        let onTime = true;
        if (assignedAt) {
          const actualMinutes = (deliveredAt.toMillis() - assignedAt.toMillis()) / 60000;
          onTime = actualMinutes <= (expectedMinutes * 1.2); // Tolerância de 20%
        }
        
        const onTimeDeliveries = (partner.metrics?.on_time_deliveries || 0) + (onTime ? 1 : 0);
        const onTimeRate = (onTimeDeliveries / completedDeliveries) * 100;
        
        // 4. Atualizar entregador
        batch.update(partnerRef, {
          operational_status: 'online_idle', // Liberar para novas entregas
          current_order_id: null,
          
          'metrics.total_deliveries': totalDeliveries,
          'metrics.completed_deliveries': completedDeliveries,
          'metrics.total_earnings': totalEarnings,
          'metrics.current_balance': currentBalance,
          'metrics.on_time_rate': onTimeRate,
          
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log(`📊 Métricas atualizadas - Total: ${completedDeliveries} entregas, Saldo: R$ ${currentBalance.toFixed(2)}`);
        
        // 5. Commitar tudo
        await batch.commit();
        
        console.log(`✅ Entrega finalizada com sucesso`);
        
        return {
          success: true,
          earning: deliveryAfter.partner_earning,
          partnerId
        };
        
      } catch (error) {
        console.error('❌ Erro ao completar entrega:', error);
        throw error;
      }
    }
    
    return null;
  });

