import { useState, useEffect } from 'react';
import { Order } from '../types/shared';
import { 
  subscribeToCustomerOrders,
  subscribeToOrder,
  getActiveOrders,
  createOrder as createOrderService
} from '../services/orderService';

/**
 * Hook para buscar pedidos do cliente em tempo real
 */
export const useCustomerOrders = (customerId: string | null) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!customerId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = subscribeToCustomerOrders(customerId, (ordersData) => {
      setOrders(ordersData);
      setError(null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [customerId]);

  return { orders, loading, error };
};

/**
 * Hook para acompanhar um pedido específico em tempo real
 */
export const useOrder = (orderId: string | null) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = subscribeToOrder(orderId, (orderData) => {
      setOrder(orderData);
      setError(null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [orderId]);

  return { order, loading, error };
};

/**
 * Hook para buscar pedidos ativos do cliente
 */
export const useActiveCustomerOrders = (customerId: string | null) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!customerId) {
      setLoading(false);
      return;
    }

    const fetchActiveOrders = async () => {
      try {
        setLoading(true);
        const activeOrders = await getActiveOrders(customerId);
        setOrders(activeOrders);
        setError(null);
      } catch (err) {
        setError('Erro ao carregar pedidos ativos');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveOrders();
  }, [customerId]);

  return { orders, loading, error };
};

/**
 * Hook para criar pedidos
 */
export const useCreateOrder = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrder = async (orderData: any) => {
    try {
      setLoading(true);
      setError(null);
      const orderId = await createOrderService(orderData);
      return orderId;
    } catch (err) {
      setError('Erro ao criar pedido');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createOrder, loading, error };
}; 