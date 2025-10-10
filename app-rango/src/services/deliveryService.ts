/**
 * SERVIÇO DE ENTREGADORES
 * 
 * Gerencia cadastro, autenticação e perfil de entregadores
 */

import {
  collection,
  doc,
  setDoc,
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

export type DeliveryStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
export type DeliveryAvailability = 'online' | 'offline' | 'busy';

export interface DeliveryPerson {
  id: string;
  userId: string; // ID do usuário no Auth
  name: string;
  email: string;
  phone: string;
  cpf: string;
  
  // Endereço
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  
  // Documentos
  documents: {
    cnh: {
      number: string;
      category: string;
      expirationDate: Date | Timestamp;
      imageUrl?: string;
    };
    rg: {
      number: string;
      imageUrl?: string;
    };
    proofOfAddress?: {
      imageUrl?: string;
    };
  };
  
  // Veículo
  vehicle: {
    type: 'bike' | 'motorcycle' | 'car';
    brand?: string;
    model?: string;
    plate?: string;
    year?: number;
  };
  
  // Dados bancários
  bankAccount?: {
    bankName: string;
    accountType: 'checking' | 'savings';
    agency: string;
    accountNumber: string;
    cpf: string;
  };
  
  // Status e disponibilidade
  status: DeliveryStatus;
  availability: DeliveryAvailability;
  isActive: boolean;
  
  // Localização atual
  currentLocation?: {
    latitude: number;
    longitude: number;
    lastUpdated: Date | Timestamp;
  };
  
  // Estatísticas
  stats: {
    totalDeliveries: number;
    completedDeliveries: number;
    canceledDeliveries: number;
    rating: number;
    reviewCount: number;
    totalEarnings: number;
  };
  
  // Metadados
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  approvedAt?: Date | Timestamp;
  rejectedAt?: Date | Timestamp;
  rejectionReason?: string;
}

export interface CreateDeliveryPersonData {
  userId: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  address: DeliveryPerson['address'];
  documents: DeliveryPerson['documents'];
  vehicle: DeliveryPerson['vehicle'];
  bankAccount?: DeliveryPerson['bankAccount'];
}

/**
 * Criar perfil de entregador
 */
export const createDeliveryPerson = async (
  data: CreateDeliveryPersonData
): Promise<string> => {
  try {
    const deliveryRef = doc(db, 'deliveryPersons', data.userId);

    await setDoc(deliveryRef, {
      ...data,
      status: 'pending',
      availability: 'offline',
      isActive: false,
      stats: {
        totalDeliveries: 0,
        completedDeliveries: 0,
        canceledDeliveries: 0,
        rating: 0,
        reviewCount: 0,
        totalEarnings: 0,
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log('✅ Entregador criado:', data.userId);
    return data.userId;
  } catch (error: any) {
    console.error('❌ Erro ao criar entregador:', error);
    throw error;
  }
};

/**
 * Buscar entregador por ID
 */
export const getDeliveryPerson = async (id: string): Promise<DeliveryPerson | null> => {
  try {
    const deliveryDoc = await getDoc(doc(db, 'deliveryPersons', id));

    if (!deliveryDoc.exists()) {
      return null;
    }

    const data = deliveryDoc.data();
    return {
      id: deliveryDoc.id,
      ...data,
      documents: {
        ...data.documents,
        cnh: {
          ...data.documents.cnh,
          expirationDate: data.documents.cnh.expirationDate?.toDate() || new Date(),
        },
      },
      currentLocation: data.currentLocation ? {
        ...data.currentLocation,
        lastUpdated: data.currentLocation.lastUpdated?.toDate() || new Date(),
      } : undefined,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      approvedAt: data.approvedAt?.toDate(),
      rejectedAt: data.rejectedAt?.toDate(),
    } as DeliveryPerson;
  } catch (error) {
    console.error('Erro ao buscar entregador:', error);
    return null;
  }
};

/**
 * Listar todos os entregadores (admin)
 */
export const getAllDeliveryPersons = async (): Promise<DeliveryPerson[]> => {
  try {
    const q = query(
      collection(db, 'deliveryPersons'),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const deliveryPersons: DeliveryPerson[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      deliveryPersons.push({
        id: doc.id,
        ...data,
        documents: {
          ...data.documents,
          cnh: {
            ...data.documents.cnh,
            expirationDate: data.documents.cnh.expirationDate?.toDate() || new Date(),
          },
        },
        currentLocation: data.currentLocation ? {
          ...data.currentLocation,
          lastUpdated: data.currentLocation.lastUpdated?.toDate() || new Date(),
        } : undefined,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        approvedAt: data.approvedAt?.toDate(),
        rejectedAt: data.rejectedAt?.toDate(),
      } as DeliveryPerson);
    });

    return deliveryPersons;
  } catch (error) {
    console.error('Erro ao listar entregadores:', error);
    return [];
  }
};

/**
 * Listar entregadores por status
 */
export const getDeliveryPersonsByStatus = async (
  status: DeliveryStatus
): Promise<DeliveryPerson[]> => {
  try {
    const q = query(
      collection(db, 'deliveryPersons'),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const deliveryPersons: DeliveryPerson[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      deliveryPersons.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as DeliveryPerson);
    });

    return deliveryPersons;
  } catch (error) {
    console.error('Erro ao buscar entregadores por status:', error);
    return [];
  }
};

/**
 * Buscar entregadores online disponíveis
 */
export const getAvailableDeliveryPersons = async (): Promise<DeliveryPerson[]> => {
  try {
    const q = query(
      collection(db, 'deliveryPersons'),
      where('status', '==', 'approved'),
      where('availability', '==', 'online'),
      where('isActive', '==', true)
    );

    const snapshot = await getDocs(q);
    const deliveryPersons: DeliveryPerson[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      deliveryPersons.push({
        id: doc.id,
        ...data,
      } as DeliveryPerson);
    });

    return deliveryPersons;
  } catch (error) {
    console.error('Erro ao buscar entregadores disponíveis:', error);
    return [];
  }
};

/**
 * Atualizar status do entregador
 */
export const updateDeliveryStatus = async (
  id: string,
  status: DeliveryStatus,
  rejectionReason?: string
): Promise<void> => {
  try {
    const deliveryRef = doc(db, 'deliveryPersons', id);
    const updateData: any = {
      status,
      updatedAt: serverTimestamp(),
    };

    if (status === 'approved') {
      updateData.approvedAt = serverTimestamp();
      updateData.isActive = true;
    }

    if (status === 'rejected' && rejectionReason) {
      updateData.rejectedAt = serverTimestamp();
      updateData.rejectionReason = rejectionReason;
    }

    await updateDoc(deliveryRef, updateData);
    console.log('✅ Status do entregador atualizado:', id, status);
  } catch (error: any) {
    console.error('❌ Erro ao atualizar status:', error);
    throw error;
  }
};

/**
 * Atualizar disponibilidade do entregador
 */
export const updateAvailability = async (
  id: string,
  availability: DeliveryAvailability
): Promise<void> => {
  try {
    // Usar setDoc com merge para criar se não existir
    await setDoc(
      doc(db, 'deliveryPersons', id), 
      {
        availability,
        updatedAt: serverTimestamp(),
      },
      { merge: true } // Cria se não existir, atualiza se existir
    );

    console.log('✅ Disponibilidade atualizada:', id, availability);
  } catch (error: any) {
    console.error('❌ Erro ao atualizar disponibilidade:', error);
    throw error;
  }
};

/**
 * Atualizar localização do entregador
 */
export const updateLocation = async (
  id: string,
  latitude: number,
  longitude: number
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'deliveryPersons', id), {
      currentLocation: {
        latitude,
        longitude,
        lastUpdated: serverTimestamp(),
      },
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Erro ao atualizar localização:', error);
  }
};

/**
 * Atualizar perfil do entregador
 */
export const updateDeliveryProfile = async (
  id: string,
  data: Partial<DeliveryPerson>
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'deliveryPersons', id), {
      ...data,
      updatedAt: serverTimestamp(),
    });

    console.log('✅ Perfil do entregador atualizado:', id);
  } catch (error: any) {
    console.error('❌ Erro ao atualizar perfil:', error);
    throw error;
  }
};

// Alias para compatibilidade
export const updateDeliveryPerson = updateDeliveryProfile;

/**
 * Inscrever-se em mudanças do perfil do entregador
 */
export const subscribeToDeliveryPerson = (
  id: string,
  callback: (deliveryPerson: DeliveryPerson | null) => void
): Unsubscribe => {
  return onSnapshot(doc(db, 'deliveryPersons', id), (snapshot) => {
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
    } as DeliveryPerson);
  });
};

/**
 * Atualizar estatísticas do entregador
 */
export const updateDeliveryStats = async (
  id: string,
  stats: Partial<DeliveryPerson['stats']>
): Promise<void> => {
  try {
    const deliveryDoc = await getDoc(doc(db, 'deliveryPersons', id));
    if (!deliveryDoc.exists()) {
      throw new Error('Entregador não encontrado');
    }

    const currentStats = deliveryDoc.data().stats || {};
    
    await updateDoc(doc(db, 'deliveryPersons', id), {
      stats: {
        ...currentStats,
        ...stats,
      },
      updatedAt: serverTimestamp(),
    });

    console.log('✅ Estatísticas atualizadas:', id);
  } catch (error: any) {
    console.error('❌ Erro ao atualizar estatísticas:', error);
    throw error;
  }
};

