import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  updateDoc, 
  doc 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order } from '@/types/store';

export const useOrders = (storeId: string) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!storeId) return;

    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('storeId', '==', storeId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      
      setOrders(ordersData);
      setError(null);
      setLoading(false);
    }, (error) => {
      console.error('Erro ao buscar pedidos:', error);
      setError('Erro ao carregar pedidos');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [storeId]);

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Erro ao atualizar status do pedido:', error);
      throw error;
    }
  };

  const getOrdersByStatus = (status: Order['status']) => {
    return orders.filter(order => order.status === status);
  };

  const getTodayOrders = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= today;
    });
  };

  return { 
    orders, 
    loading, 
    error, 
    updateOrderStatus, 
    getOrdersByStatus, 
    getTodayOrders 
  };
};
