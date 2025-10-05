/**
 * SERVIÇO DE PERFIL DO USUÁRIO
 * 
 * Gerencia dados pessoais do usuário com segurança e validação
 */

import { 
  doc, 
  getDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { UserProfile } from '../types/profile';

const USERS_COLLECTION = 'users';

/**
 * Buscar perfil do usuário
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
    
    if (!userDoc.exists()) {
      console.warn('Perfil de usuário não encontrado:', userId);
      return null;
    }

    const data = userDoc.data();
    
    return {
      uid: userDoc.id,
      email: data.email,
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      phone: data.phone || '',
      photoURL: data.photoURL,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    throw new Error('Não foi possível carregar o perfil');
  }
};

/**
 * Atualizar perfil do usuário
 * 
 * VALIDAÇÕES:
 * - Nome e sobrenome: mínimo 2 caracteres
 * - Telefone: formato brasileiro (11 dígitos)
 */
export const updateUserProfile = async (
  userId: string,
  data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    photoURL?: string;
  }
): Promise<void> => {
  try {
    // Validações
    if (data.firstName && data.firstName.trim().length < 2) {
      throw new Error('Nome deve ter pelo menos 2 caracteres');
    }

    if (data.lastName && data.lastName.trim().length < 2) {
      throw new Error('Sobrenome deve ter pelo menos 2 caracteres');
    }

    if (data.phone) {
      // Remove caracteres não numéricos
      const cleanPhone = data.phone.replace(/\D/g, '');
      
      if (cleanPhone.length < 10 || cleanPhone.length > 11) {
        throw new Error('Telefone inválido. Use formato (XX) XXXXX-XXXX');
      }
      
      data.phone = cleanPhone;
    }

    // Atualizar no Firestore
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });

    console.log('✅ Perfil atualizado com sucesso:', userId);
  } catch (error: any) {
    console.error('❌ Erro ao atualizar perfil:', error);
    throw error;
  }
};

/**
 * Formatar telefone para exibição
 * Converte 11987654321 para (11) 98765-4321
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  
  return phone;
};

/**
 * Validar formato de telefone enquanto digita
 */
export const maskPhoneNumber = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  const limited = cleaned.substring(0, 11);
  
  if (limited.length <= 2) {
    return limited;
  } else if (limited.length <= 7) {
    return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
  } else {
    return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`;
  }
};

