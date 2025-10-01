import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query,
  where,
  orderBy,
  onSnapshot,
  Unsubscribe,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { 
  Order, 
  OrderStatus,
  CreateOrderData, 
  UpdateOrderData 
} from '../types/shared';

// Coleção de pedidos
const ORDERS_COLLECTION = 'orders';

/**
 * Criar um novo pedido
 */
export const createOrder = async (orderData: CreateOrderData): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, ORDERS_COLLECTION), {
      ...orderData,
      status: 'pending' as OrderStatus,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('✅ Pedido criado com sucesso:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Erro ao criar pedido:', error);
    throw error;
  }
};

/**
 * Buscar um pedido por ID
 */
export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    const orderDoc = await getDoc(doc(db, ORDERS_COLLECTION, orderId));
    
    if (orderDoc.exists()) {
      return { id: orderDoc.id, ...orderDoc.data() } as Order;
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao buscar pedido:', error);
    throw error;
  }
};

/**
 * Buscar pedidos de um cliente específico
 */
export const getCustomerOrders = async (customerId: string): Promise<Order[]> => {
  try {
    const q = query(
      collection(db, ORDERS_COLLECTION),
      where('customerId', '==', customerId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const orders: Order[] = [];
    
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() } as Order);
    });
    
    return orders;
  } catch (error) {
    console.error('Erro ao buscar pedidos do cliente:', error);
    throw error;
  }
};

/**
 * Buscar pedidos de uma loja específica
 */
export const getStoreOrders = async (storeId: string): Promise<Order[]> => {
  try {
    const q = query(
      collection(db, ORDERS_COLLECTION),
      where('storeId', '==', storeId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const orders: Order[] = [];
    
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() } as Order);
    });
    
    return orders;
  } catch (error) {
    console.error('Erro ao buscar pedidos da loja:', error);
    throw error;
  }
};

/**
 * Buscar pedidos por status
 */
export const getOrdersByStatus = async (
  storeId: string, 
  status: OrderStatus
): Promise<Order[]> => {
  try {
    const q = query(
      collection(db, ORDERS_COLLECTION),
      where('storeId', '==', storeId),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const orders: Order[] = [];
    
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() } as Order);
    });
    
    return orders;
  } catch (error) {
    console.error('Erro ao buscar pedidos por status:', error);
    throw error;
  }
};

/**
 * Buscar pedidos ativos (pending, confirmed, preparing, ready, in_delivery)
 */
export const getActiveOrders = async (
  customerId?: string, 
  storeId?: string
): Promise<Order[]> => {
  try {
    const activeStatuses: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'in_delivery'];
    
    let q;
    if (customerId) {
      q = query(
        collection(db, ORDERS_COLLECTION),
        where('customerId', '==', customerId),
        where('status', 'in', activeStatuses),
        orderBy('createdAt', 'desc')
      );
    } else if (storeId) {
      q = query(
        collection(db, ORDERS_COLLECTION),
        where('storeId', '==', storeId),
        where('status', 'in', activeStatuses),
        orderBy('createdAt', 'desc')
      );
    } else {
      throw new Error('customerId ou storeId deve ser fornecido');
    }
    
    const querySnapshot = await getDocs(q);
    const orders: Order[] = [];
    
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() } as Order);
    });
    
    return orders;
  } catch (error) {
    console.error('Erro ao buscar pedidos ativos:', error);
    throw error;
  }
};

/**
 * Atualizar status do pedido
 */
export const updateOrderStatus = async (
  orderId: string, 
  status: OrderStatus
): Promise<void> => {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    
    await updateDoc(orderRef, {
      status,
      updatedAt: new Date()
    });
    
    console.log(`✅ Status do pedido ${orderId} atualizado para: ${status}`);
  } catch (error) {
    console.error('❌ Erro ao atualizar status do pedido:', error);
    throw error;
  }
};

/**
 * Atualizar dados do pedido
 */
export const updateOrder = async (
  orderId: string, 
  updates: UpdateOrderData
): Promise<void> => {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    
    await updateDoc(orderRef, {
      ...updates,
      updatedAt: new Date()
    });
    
    console.log(`✅ Pedido ${orderId} atualizado com sucesso`);
  } catch (error) {
    console.error('❌ Erro ao atualizar pedido:', error);
    throw error;
  }
};

/**
 * Cancelar um pedido
 */
export const cancelOrder = async (
  orderId: string, 
  reason?: string
): Promise<void> => {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    
    await updateDoc(orderRef, {
      status: 'cancelled' as OrderStatus,
      cancellationReason: reason || 'Cancelado pelo usuário',
      updatedAt: new Date()
    });
    
    console.log(`✅ Pedido ${orderId} cancelado`);
  } catch (error) {
    console.error('❌ Erro ao cancelar pedido:', error);
    throw error;
  }
};

/**
 * Listener em tempo real para pedidos de um cliente
 */
export const subscribeToCustomerOrders = (
  customerId: string,
  callback: (orders: Order[]) => void
): Unsubscribe => {
  const q = query(
    collection(db, ORDERS_COLLECTION),
    where('customerId', '==', customerId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const orders: Order[] = [];
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() } as Order);
    });
    callback(orders);
  }, (error) => {
    console.error('Erro no listener de pedidos do cliente:', error);
    callback([]);
  });
};

/**
 * Listener em tempo real para pedidos de uma loja
 */
export const subscribeToStoreOrders = (
  storeId: string,
  callback: (orders: Order[]) => void
): Unsubscribe => {
  const q = query(
    collection(db, ORDERS_COLLECTION),
    where('storeId', '==', storeId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const orders: Order[] = [];
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() } as Order);
    });
    callback(orders);
  }, (error) => {
    console.error('Erro no listener de pedidos da loja:', error);
    callback([]);
  });
};

/**
 * Listener em tempo real para pedidos ativos de uma loja
 */
export const subscribeToActiveStoreOrders = (
  storeId: string,
  callback: (orders: Order[]) => void
): Unsubscribe => {
  const activeStatuses: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'in_delivery'];
  
  const q = query(
    collection(db, ORDERS_COLLECTION),
    where('storeId', '==', storeId),
    where('status', 'in', activeStatuses),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const orders: Order[] = [];
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() } as Order);
    });
    callback(orders);
  }, (error) => {
    console.error('Erro no listener de pedidos ativos:', error);
    callback([]);
  });
};

/**
 * Listener em tempo real para um pedido específico
 */
export const subscribeToOrder = (
  orderId: string,
  callback: (order: Order | null) => void
): Unsubscribe => {
  const orderRef = doc(db, ORDERS_COLLECTION, orderId);
  
  return onSnapshot(orderRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() } as Order);
    } else {
      callback(null);
    }
  }, (error) => {
    console.error('Erro no listener do pedido:', error);
    callback(null);
  });
};

/**
 * Calcular estatísticas de pedidos para dashboard
 */
export const getOrderStatistics = async (storeId: string) => {
  try {
    const orders = await getStoreOrders(storeId);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= today;
    });
    
    const totalRevenue = orders
      .filter(order => order.status === 'delivered')
      .reduce((sum, order) => sum + order.total, 0);
    
    const todayRevenue = todayOrders
      .filter(order => order.status === 'delivered')
      .reduce((sum, order) => sum + order.total, 0);
    
    return {
      totalOrders: orders.length,
      todayOrders: todayOrders.length,
      totalRevenue,
      todayRevenue,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      preparingOrders: orders.filter(o => o.status === 'preparing').length,
      deliveredOrders: orders.filter(o => o.status === 'delivered').length,
      cancelledOrders: orders.filter(o => o.status === 'cancelled').length
    };
  } catch (error) {
    console.error('Erro ao calcular estatísticas:', error);
    throw error;
  }
}; 