import { useState, useEffect } from 'react';
import { Order, OrderStatus } from '@/types/shared';
import { 
  subscribeToStoreOrders, 
  updateOrderStatus as updateOrderStatusService,
  getOrderById
} from '@/services/orderService';

export const useOrders = (storeId: string) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!storeId) {
      setLoading(false);
      return;
    }

    console.log('🔵 Inscrevendo-se nos pedidos da loja:', storeId);

    const unsubscribe = subscribeToStoreOrders(storeId, (ordersData) => {
      console.log('✅ Pedidos recebidos:', ordersData.length);
      setOrders(ordersData);
      setLoading(false);
    });

    return () => {
      console.log('🔴 Cancelando inscrição nos pedidos');
      unsubscribe();
    };
  }, [storeId]);

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      console.log('🔵 Atualizando status do pedido:', orderId, 'para', status);
      await updateOrderStatusService(orderId, status);
      console.log('✅ Status atualizado com sucesso');
      return true;
    } catch (err) {
      console.error('❌ Erro ao atualizar status:', err);
      setError('Erro ao atualizar status do pedido');
      return false;
    }
  };

  const getOrdersByStatus = (status: OrderStatus | 'all') => {
    if (status === 'all') return orders;
    return orders.filter(order => order.status === status);
  };

  const getTodayOrders = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return orders.filter(order => {
      const orderDate = order.createdAt instanceof Date 
        ? order.createdAt 
        : new Date(order.createdAt);
      return orderDate >= today;
    });
  };

  const getPendingOrders = () => {
    return orders.filter(order => order.status === 'pending');
  };

  const getActiveOrders = () => {
    return orders.filter(order => 
      ['pending', 'confirmed', 'preparing', 'ready', 'in_delivery'].includes(order.status)
    );
  };

  const getCompletedOrders = () => {
    return orders.filter(order => order.status === 'delivered');
  };

  const getCancelledOrders = () => {
    return orders.filter(order => order.status === 'cancelled');
  };

  const getOrderDetails = async (orderId: string) => {
    try {
      const order = await getOrderById(orderId);
      return order;
    } catch (err) {
      console.error('Erro ao buscar detalhes do pedido:', err);
      return null;
    }
  };

  return {
    orders,
    loading,
    error,
    updateOrderStatus,
    getOrdersByStatus,
    getTodayOrders,
    getPendingOrders,
    getActiveOrders,
    getCompletedOrders,
    getCancelledOrders,
    getOrderDetails
  };
};
