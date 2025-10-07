/**
 * SERVIÇO DE CORRIDAS/VIAGENS
 * 
 * Gerencia corridas de entrega, atribuição de entregadores e acompanhamento
 */

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Unsubscribe,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { updateOrderStatus } from './orderService';
import { updateDeliveryStats } from './deliveryService';

export type TripStatus = 
  | 'pending'        // Aguardando entregador
  | 'assigned'       // Atribuído a um entregador
  | 'accepted'       // Entregador aceitou
  | 'picking_up'     // Indo buscar pedido
  | 'picked_up'      // Pedido coletado
  | 'delivering'     // A caminho do cliente
  | 'delivered'      // Entregue
  | 'canceled';      // Cancelado

export interface Trip {
  id: string;
  orderId: string;
  storeId: string;
  storeName: string;
  customerId: string;
  customerName: string;
  
  // Endereços
  pickupAddress: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    latitude?: number;
    longitude?: number;
  };
  
  deliveryAddress: {
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
  
  // Entregador
  deliveryPersonId?: string;
  deliveryPersonName?: string;
  
  // Status e timestamps
  status: TripStatus;
  assignedAt?: Date | Timestamp;
  acceptedAt?: Date | Timestamp;
  pickedUpAt?: Date | Timestamp;
  deliveredAt?: Date | Timestamp;
  canceledAt?: Date | Timestamp;
  
  // Valores
  deliveryFee: number;
  distance?: number; // em km
  estimatedTime?: number; // em minutos
  
  // Observações
  customerNotes?: string;
  deliveryNotes?: string;
  cancelReason?: string;
  
  // Metadados
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

export interface CreateTripData {
  orderId: string;
  storeId: string;
  storeName: string;
  customerId: string;
  customerName: string;
  pickupAddress: Trip['pickupAddress'];
  deliveryAddress: Trip['deliveryAddress'];
  deliveryFee: number;
  customerNotes?: string;
}

/**
 * Criar uma corrida
 */
export const createTrip = async (data: CreateTripData): Promise<string> => {
  try {
    const tripRef = await addDoc(collection(db, 'trips'), {
      ...data,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log('✅ Corrida criada:', tripRef.id);
    
    // Atualizar status do pedido
    await updateOrderStatus(data.orderId, 'out_for_delivery');
    
    return tripRef.id;
  } catch (error: any) {
    console.error('❌ Erro ao criar corrida:', error);
    throw error;
  }
};

/**
 * Buscar corrida por ID
 */
export const getTrip = async (id: string): Promise<Trip | null> => {
  try {
    const tripDoc = await getDoc(doc(db, 'trips', id));

    if (!tripDoc.exists()) {
      return null;
    }

    const data = tripDoc.data();
    return {
      id: tripDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      assignedAt: data.assignedAt?.toDate(),
      acceptedAt: data.acceptedAt?.toDate(),
      pickedUpAt: data.pickedUpAt?.toDate(),
      deliveredAt: data.deliveredAt?.toDate(),
      canceledAt: data.canceledAt?.toDate(),
    } as Trip;
  } catch (error) {
    console.error('Erro ao buscar corrida:', error);
    return null;
  }
};

/**
 * Buscar corrida por ID do pedido
 */
export const getTripByOrderId = async (orderId: string): Promise<Trip | null> => {
  try {
    const q = query(
      collection(db, 'trips'),
      where('orderId', '==', orderId)
    );

    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();
    
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Trip;
  } catch (error) {
    console.error('Erro ao buscar corrida por pedido:', error);
    return null;
  }
};

/**
 * Buscar corridas pendentes (sem entregador)
 */
export const getPendingTrips = async (): Promise<Trip[]> => {
  try {
    const q = query(
      collection(db, 'trips'),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'asc')
    );

    const snapshot = await getDocs(q);
    const trips: Trip[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      trips.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Trip);
    });

    return trips;
  } catch (error) {
    console.error('Erro ao buscar corridas pendentes:', error);
    return [];
  }
};

/**
 * Buscar corridas do entregador
 */
export const getDeliveryPersonTrips = async (
  deliveryPersonId: string,
  status?: TripStatus
): Promise<Trip[]> => {
  try {
    let q;
    
    if (status) {
      q = query(
        collection(db, 'trips'),
        where('deliveryPersonId', '==', deliveryPersonId),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(
        collection(db, 'trips'),
        where('deliveryPersonId', '==', deliveryPersonId),
        orderBy('createdAt', 'desc')
      );
    }

    const snapshot = await getDocs(q);
    const trips: Trip[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      trips.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Trip);
    });

    return trips;
  } catch (error) {
    console.error('Erro ao buscar corridas do entregador:', error);
    return [];
  }
};

/**
 * Atribuir corrida a um entregador
 */
export const assignTrip = async (
  tripId: string,
  deliveryPersonId: string,
  deliveryPersonName: string
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'trips', tripId), {
      deliveryPersonId,
      deliveryPersonName,
      status: 'assigned',
      assignedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log('✅ Corrida atribuída:', tripId, '→', deliveryPersonName);
  } catch (error: any) {
    console.error('❌ Erro ao atribuir corrida:', error);
    throw error;
  }
};

/**
 * Entregador aceitar corrida
 */
export const acceptTrip = async (tripId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'trips', tripId), {
      status: 'accepted',
      acceptedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log('✅ Corrida aceita:', tripId);
  } catch (error: any) {
    console.error('❌ Erro ao aceitar corrida:', error);
    throw error;
  }
};

/**
 * Entregador rejeitar corrida
 */
export const rejectTrip = async (tripId: string, reason: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'trips', tripId), {
      status: 'pending',
      deliveryPersonId: null,
      deliveryPersonName: null,
      cancelReason: reason,
      updatedAt: serverTimestamp(),
    });

    console.log('✅ Corrida rejeitada:', tripId);
  } catch (error: any) {
    console.error('❌ Erro ao rejeitar corrida:', error);
    throw error;
  }
};

/**
 * Atualizar status da corrida
 */
export const updateTripStatus = async (
  tripId: string,
  status: TripStatus,
  notes?: string
): Promise<void> => {
  try {
    const updateData: any = {
      status,
      updatedAt: serverTimestamp(),
    };

    // Adicionar timestamp específico baseado no status
    if (status === 'picked_up') {
      updateData.pickedUpAt = serverTimestamp();
    } else if (status === 'delivered') {
      updateData.deliveredAt = serverTimestamp();
    } else if (status === 'canceled') {
      updateData.canceledAt = serverTimestamp();
    }

    if (notes) {
      updateData.deliveryNotes = notes;
    }

    await updateDoc(doc(db, 'trips', tripId), updateData);

    // Atualizar status do pedido correspondente
    const trip = await getTrip(tripId);
    if (trip) {
      if (status === 'delivered') {
        await updateOrderStatus(trip.orderId, 'delivered');
        
        // Atualizar estatísticas do entregador
        if (trip.deliveryPersonId) {
          const deliveryPerson = await import('./deliveryService').then(m => 
            m.getDeliveryPerson(trip.deliveryPersonId!)
          );
          
          if (deliveryPerson) {
            await updateDeliveryStats(trip.deliveryPersonId, {
              totalDeliveries: deliveryPerson.stats.totalDeliveries + 1,
              completedDeliveries: deliveryPerson.stats.completedDeliveries + 1,
              totalEarnings: deliveryPerson.stats.totalEarnings + trip.deliveryFee,
            });
          }
        }
      } else if (status === 'canceled') {
        await updateOrderStatus(trip.orderId, 'canceled');
        
        // Atualizar estatísticas de cancelamento
        if (trip.deliveryPersonId) {
          const deliveryPerson = await import('./deliveryService').then(m =>
            m.getDeliveryPerson(trip.deliveryPersonId!)
          );
          
          if (deliveryPerson) {
            await updateDeliveryStats(trip.deliveryPersonId, {
              canceledDeliveries: deliveryPerson.stats.canceledDeliveries + 1,
            });
          }
        }
      }
    }

    console.log('✅ Status da corrida atualizado:', tripId, status);
  } catch (error: any) {
    console.error('❌ Erro ao atualizar status da corrida:', error);
    throw error;
  }
};

/**
 * Inscrever-se em corridas pendentes (para entregadores)
 */
export const subscribeToPendingTrips = (
  callback: (trips: Trip[]) => void
): Unsubscribe => {
  const q = query(
    collection(db, 'trips'),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const trips: Trip[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      trips.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Trip);
    });
    callback(trips);
  });
};

/**
 * Inscrever-se em corridas do entregador
 */
export const subscribeToDeliveryPersonTrips = (
  deliveryPersonId: string,
  callback: (trips: Trip[]) => void
): Unsubscribe => {
  const q = query(
    collection(db, 'trips'),
    where('deliveryPersonId', '==', deliveryPersonId),
    where('status', 'in', ['accepted', 'picking_up', 'picked_up', 'delivering']),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const trips: Trip[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      trips.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Trip);
    });
    callback(trips);
  });
};

/**
 * Inscrever-se em uma corrida específica
 */
export const subscribeToTrip = (
  tripId: string,
  callback: (trip: Trip | null) => void
): Unsubscribe => {
  return onSnapshot(doc(db, 'trips', tripId), (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }

    const data = snapshot.data();
    callback({
      id: snapshot.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Trip);
  });
};

