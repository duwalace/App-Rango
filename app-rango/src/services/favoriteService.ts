/**
 * SERVIÇO DE LOJAS FAVORITAS
 * 
 * Gerencia marcação e listagem de lojas favoritas do cliente
 */

import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { Store } from '../types/shared';

export interface FavoriteStore {
  id: string; // ID do documento favorites
  userId: string;
  storeId: string;
  createdAt: Date;
}

/**
 * Adicionar loja aos favoritos
 */
export const addFavorite = async (userId: string, storeId: string): Promise<void> => {
  try {
    const favoriteId = `${userId}_${storeId}`;
    const favoriteRef = doc(db, 'favorites', favoriteId);

    await setDoc(favoriteRef, {
      userId,
      storeId,
      createdAt: serverTimestamp(),
    });

    console.log('✅ Loja adicionada aos favoritos:', storeId);
  } catch (error: any) {
    console.error('❌ Erro ao adicionar favorito:', error);
    throw error;
  }
};

/**
 * Remover loja dos favoritos
 */
export const removeFavorite = async (userId: string, storeId: string): Promise<void> => {
  try {
    const favoriteId = `${userId}_${storeId}`;
    await deleteDoc(doc(db, 'favorites', favoriteId));

    console.log('✅ Loja removida dos favoritos:', storeId);
  } catch (error: any) {
    console.error('❌ Erro ao remover favorito:', error);
    throw error;
  }
};

/**
 * Verificar se loja está nos favoritos
 */
export const isFavorite = async (userId: string, storeId: string): Promise<boolean> => {
  try {
    const favoriteId = `${userId}_${storeId}`;
    const favoriteDoc = await getDoc(doc(db, 'favorites', favoriteId));
    return favoriteDoc.exists();
  } catch (error) {
    console.error('Erro ao verificar favorito:', error);
    return false;
  }
};

/**
 * Buscar IDs das lojas favoritas do usuário
 */
export const getFavoriteStoreIds = async (userId: string): Promise<string[]> => {
  try {
    const q = query(
      collection(db, 'favorites'),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    const storeIds: string[] = [];

    querySnapshot.forEach((doc) => {
      storeIds.push(doc.data().storeId);
    });

    return storeIds;
  } catch (error) {
    console.error('Erro ao buscar favoritos:', error);
    return [];
  }
};

/**
 * Buscar lojas favoritas completas do usuário
 */
export const getFavoriteStores = async (userId: string): Promise<Store[]> => {
  try {
    const storeIds = await getFavoriteStoreIds(userId);

    if (storeIds.length === 0) {
      return [];
    }

    // Buscar dados completos das lojas
    const stores: Store[] = [];
    
    for (const storeId of storeIds) {
      const storeDoc = await getDoc(doc(db, 'stores', storeId));
      if (storeDoc.exists()) {
        const storeData = storeDoc.data();
        stores.push({
          id: storeDoc.id,
          ...storeData,
          createdAt: storeData.createdAt?.toDate() || new Date(),
          updatedAt: storeData.updatedAt?.toDate() || new Date(),
        } as Store);
      }
    }

    return stores;
  } catch (error) {
    console.error('Erro ao buscar lojas favoritas:', error);
    return [];
  }
};

/**
 * Inscrever-se em tempo real nas lojas favoritas
 */
export const subscribeToFavorites = (
  userId: string,
  callback: (storeIds: string[]) => void
): Unsubscribe => {
  const q = query(
    collection(db, 'favorites'),
    where('userId', '==', userId)
  );

  return onSnapshot(q, (snapshot) => {
    const storeIds: string[] = [];
    snapshot.forEach((doc) => {
      storeIds.push(doc.data().storeId);
    });
    callback(storeIds);
  });
};

/**
 * Toggle favorito (adicionar ou remover)
 */
export const toggleFavorite = async (
  userId: string,
  storeId: string
): Promise<boolean> => {
  try {
    const isFav = await isFavorite(userId, storeId);

    if (isFav) {
      await removeFavorite(userId, storeId);
      return false;
    } else {
      await addFavorite(userId, storeId);
      return true;
    }
  } catch (error: any) {
    console.error('❌ Erro ao alternar favorito:', error);
    throw error;
  }
};

/**
 * Contar total de favoritos do usuário
 */
export const getFavoritesCount = async (userId: string): Promise<number> => {
  try {
    const storeIds = await getFavoriteStoreIds(userId);
    return storeIds.length;
  } catch (error) {
    console.error('Erro ao contar favoritos:', error);
    return 0;
  }
};

