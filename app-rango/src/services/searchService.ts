/**
 * SERVIÇO DE BUSCA E FILTROS
 * 
 * Implementa busca avançada de lojas e produtos com filtros
 */

import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit as firestoreLimit,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { Store, MenuItem } from '../types/shared';

export interface SearchFilters {
  category?: string;
  minRating?: number;
  maxDeliveryFee?: number;
  maxDeliveryTime?: number;
  freeDelivery?: boolean;
  isOpen?: boolean;
}

export interface SearchResults {
  stores: Store[];
  items: MenuItem[];
}

/**
 * Buscar lojas por nome (case-insensitive usando array de tags)
 */
export const searchStoresByName = async (
  searchTerm: string,
  limit: number = 20
): Promise<Store[]> => {
  try {
    const normalizedTerm = searchTerm.toLowerCase().trim();

    if (!normalizedTerm) {
      return [];
    }

    // Buscar lojas ativas que contêm o termo no nome
    const q = query(
      collection(db, 'stores'),
      where('isActive', '==', true),
      orderBy('name'),
      firestoreLimit(limit)
    );

    const querySnapshot = await getDocs(q);
    const stores: Store[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const store = { id: doc.id, ...data } as Store;

      // Filtrar localmente por nome (Firestore não tem busca case-insensitive nativa)
      if (store.name.toLowerCase().includes(normalizedTerm)) {
        stores.push(store);
      }
    });

    return stores;
  } catch (error) {
    console.error('Erro ao buscar lojas por nome:', error);
    return [];
  }
};

/**
 * Buscar lojas por categoria
 */
export const searchStoresByCategory = async (
  category: string,
  limit: number = 20
): Promise<Store[]> => {
  try {
    const q = query(
      collection(db, 'stores'),
      where('category', '==', category),
      where('isActive', '==', true),
      firestoreLimit(limit)
    );

    const querySnapshot = await getDocs(q);
    const stores: Store[] = [];

    querySnapshot.forEach((doc) => {
      stores.push({ id: doc.id, ...doc.data() } as Store);
    });

    return stores;
  } catch (error) {
    console.error('Erro ao buscar lojas por categoria:', error);
    return [];
  }
};

/**
 * Buscar itens do menu por nome
 */
export const searchMenuItems = async (
  searchTerm: string,
  limit: number = 20
): Promise<MenuItem[]> => {
  try {
    const normalizedTerm = searchTerm.toLowerCase().trim();

    if (!normalizedTerm) {
      return [];
    }

    const q = query(
      collection(db, 'menuItems'),
      where('isAvailable', '==', true),
      orderBy('name'),
      firestoreLimit(limit)
    );

    const querySnapshot = await getDocs(q);
    const items: MenuItem[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const item = { id: doc.id, ...data } as MenuItem;

      // Filtrar localmente por nome
      if (item.name.toLowerCase().includes(normalizedTerm)) {
        items.push(item);
      }
    });

    return items;
  } catch (error) {
    console.error('Erro ao buscar itens do menu:', error);
    return [];
  }
};

/**
 * Buscar lojas e itens (busca unificada)
 */
export const searchAll = async (
  searchTerm: string,
  filters?: SearchFilters
): Promise<SearchResults> => {
  try {
    const normalizedTerm = searchTerm.toLowerCase().trim();

    // Se não houver termo e nem filtros, retornar vazio
    if (!normalizedTerm && !filters?.category) {
      return { stores: [], items: [] };
    }

    let stores: Store[] = [];
    let items: MenuItem[] = [];

    // Buscar por categoria se especificado
    if (filters?.category) {
      stores = await searchStoresByCategory(filters.category);
    } 
    // Buscar por nome se houver termo
    else if (normalizedTerm) {
      const [storeResults, itemResults] = await Promise.all([
        searchStoresByName(normalizedTerm),
        searchMenuItems(normalizedTerm),
      ]);
      stores = storeResults;
      items = itemResults;
    }

    // Aplicar filtros adicionais
    if (filters) {
      stores = applyFilters(stores, filters);
    }

    return { stores, items };
  } catch (error) {
    console.error('Erro na busca:', error);
    return { stores: [], items: [] };
  }
};

/**
 * Aplicar filtros às lojas
 */
const applyFilters = (stores: Store[], filters: SearchFilters): Store[] => {
  let filtered = [...stores];

  // Filtro de avaliação mínima
  if (filters.minRating && filters.minRating > 0) {
    filtered = filtered.filter((store) => (store.rating || 0) >= filters.minRating!);
  }

  // Filtro de taxa de entrega máxima
  if (filters.maxDeliveryFee !== undefined && filters.maxDeliveryFee >= 0) {
    filtered = filtered.filter(
      (store) => store.delivery?.deliveryFee <= filters.maxDeliveryFee!
    );
  }

  // Filtro de entrega grátis
  if (filters.freeDelivery) {
    filtered = filtered.filter((store) => store.delivery?.deliveryFee === 0);
  }

  // Filtro de tempo de entrega
  if (filters.maxDeliveryTime) {
    filtered = filtered.filter((store) => {
      if (!store.delivery?.deliveryTime) return false;
      
      // Extrair número do tempo de entrega (ex: "30-40 min" -> 30)
      const timeMatch = store.delivery.deliveryTime.match(/(\d+)/);
      if (!timeMatch) return false;
      
      const time = parseInt(timeMatch[1]);
      return time <= filters.maxDeliveryTime!;
    });
  }

  // Ordenar por avaliação (descendente)
  filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));

  return filtered;
};

/**
 * Obter categorias populares
 */
export const getPopularCategories = async (): Promise<string[]> => {
  try {
    const q = query(
      collection(db, 'stores'),
      where('isActive', '==', true)
    );

    const querySnapshot = await getDocs(q);
    const categoriesMap = new Map<string, number>();

    querySnapshot.forEach((doc) => {
      const store = doc.data() as Store;
      if (store.category) {
        categoriesMap.set(
          store.category,
          (categoriesMap.get(store.category) || 0) + 1
        );
      }
    });

    // Ordenar categorias por frequência
    const sortedCategories = Array.from(categoriesMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map((entry) => entry[0]);

    return sortedCategories;
  } catch (error) {
    console.error('Erro ao buscar categorias populares:', error);
    return [];
  }
};

/**
 * Obter lojas em destaque (top rated)
 */
export const getFeaturedStores = async (limit: number = 10): Promise<Store[]> => {
  try {
    const q = query(
      collection(db, 'stores'),
      where('isActive', '==', true)
    );

    const querySnapshot = await getDocs(q);
    const stores: Store[] = [];

    querySnapshot.forEach((doc) => {
      stores.push({ id: doc.id, ...doc.data() } as Store);
    });

    // Ordenar por avaliação e limitar
    return stores
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, limit);
  } catch (error) {
    console.error('Erro ao buscar lojas em destaque:', error);
    return [];
  }
};

