import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query,
  where,
  orderBy,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from './firebaseConfig';

// Tipos
export interface MenuCategory {
  id: string;
  storeId: string;
  name: string;
  description: string;
  image?: string;
  isActive: boolean;
  order: number;
  createdAt: any;
  updatedAt: any;
}

export interface MenuItem {
  id: string;
  storeId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  isAvailable: boolean;
  isPopular: boolean;
  preparationTime: number; // em minutos
  ingredients?: string[];
  allergens?: string[];
  order: number;
  createdAt: any;
  updatedAt: any;
}

// Coleções
const CATEGORIES_COLLECTION = 'menuCategories';
const ITEMS_COLLECTION = 'menuItems';

// ========== CATEGORIAS ==========

/**
 * Buscar todas as categorias ativas de uma loja
 */
export const getStoreCategories = async (storeId: string): Promise<MenuCategory[]> => {
  try {
    console.log('🔵 Buscando categorias da loja:', storeId);
    
    const q = query(
      collection(db, CATEGORIES_COLLECTION),
      where('storeId', '==', storeId),
      where('isActive', '==', true),
      orderBy('order', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    const categories: MenuCategory[] = [];
    
    querySnapshot.forEach((doc) => {
      categories.push({ id: doc.id, ...doc.data() } as MenuCategory);
    });
    
    console.log('✅ Categorias encontradas:', categories.length);
    return categories;
  } catch (error) {
    console.error('❌ Erro ao buscar categorias:', error);
    throw error;
  }
};

/**
 * Listener em tempo real para categorias de uma loja
 */
export const subscribeToStoreCategories = (
  storeId: string,
  callback: (categories: MenuCategory[]) => void
): Unsubscribe => {
  console.log('🔵 Inscrevendo-se nas categorias da loja:', storeId);
  
  const q = query(
    collection(db, CATEGORIES_COLLECTION),
    where('storeId', '==', storeId),
    where('isActive', '==', true),
    orderBy('order', 'asc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const categories: MenuCategory[] = [];
    querySnapshot.forEach((doc) => {
      categories.push({ id: doc.id, ...doc.data() } as MenuCategory);
    });
    console.log('✅ Categorias atualizadas em tempo real:', categories.length);
    callback(categories);
  }, (error) => {
    console.error('❌ Erro no listener de categorias:', error);
    callback([]);
  });
};

// ========== ITENS DO CARDÁPIO ==========

/**
 * Buscar todos os itens disponíveis de uma loja
 */
export const getStoreMenuItems = async (storeId: string): Promise<MenuItem[]> => {
  try {
    console.log('🔵 Buscando itens do menu da loja:', storeId);
    
    const q = query(
      collection(db, ITEMS_COLLECTION),
      where('storeId', '==', storeId),
      where('isAvailable', '==', true),
      orderBy('order', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    const items: MenuItem[] = [];
    
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() } as MenuItem);
    });
    
    console.log('✅ Itens do menu encontrados:', items.length);
    return items;
  } catch (error) {
    console.error('❌ Erro ao buscar itens do menu:', error);
    throw error;
  }
};

/**
 * Buscar itens de uma categoria específica
 */
export const getCategoryMenuItems = async (
  storeId: string, 
  categoryId: string
): Promise<MenuItem[]> => {
  try {
    console.log('🔵 Buscando itens da categoria:', categoryId);
    
    const q = query(
      collection(db, ITEMS_COLLECTION),
      where('storeId', '==', storeId),
      where('categoryId', '==', categoryId),
      where('isAvailable', '==', true),
      orderBy('order', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    const items: MenuItem[] = [];
    
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() } as MenuItem);
    });
    
    console.log('✅ Itens da categoria encontrados:', items.length);
    return items;
  } catch (error) {
    console.error('❌ Erro ao buscar itens da categoria:', error);
    throw error;
  }
};

/**
 * Buscar itens populares de uma loja
 */
export const getPopularItems = async (storeId: string): Promise<MenuItem[]> => {
  try {
    console.log('🔵 Buscando itens populares da loja:', storeId);
    
    const q = query(
      collection(db, ITEMS_COLLECTION),
      where('storeId', '==', storeId),
      where('isPopular', '==', true),
      where('isAvailable', '==', true),
      orderBy('order', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    const items: MenuItem[] = [];
    
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() } as MenuItem);
    });
    
    console.log('✅ Itens populares encontrados:', items.length);
    return items;
  } catch (error) {
    console.error('❌ Erro ao buscar itens populares:', error);
    throw error;
  }
};

/**
 * Buscar um item por ID
 */
export const getMenuItemById = async (itemId: string): Promise<MenuItem | null> => {
  try {
    console.log('🔵 Buscando item:', itemId);
    
    const itemDoc = await getDoc(doc(db, ITEMS_COLLECTION, itemId));
    
    if (itemDoc.exists()) {
      console.log('✅ Item encontrado');
      return { id: itemDoc.id, ...itemDoc.data() } as MenuItem;
    }
    
    console.log('❌ Item não encontrado');
    return null;
  } catch (error) {
    console.error('❌ Erro ao buscar item:', error);
    throw error;
  }
};

/**
 * Listener em tempo real para itens de uma loja
 */
export const subscribeToStoreMenuItems = (
  storeId: string,
  callback: (items: MenuItem[]) => void,
  categoryId?: string
): Unsubscribe => {
  console.log('🔵 Inscrevendo-se nos itens do menu da loja:', storeId);
  
  let q;
  
  if (categoryId) {
    q = query(
      collection(db, ITEMS_COLLECTION),
      where('storeId', '==', storeId),
      where('categoryId', '==', categoryId),
      where('isAvailable', '==', true),
      orderBy('order', 'asc')
    );
  } else {
    q = query(
      collection(db, ITEMS_COLLECTION),
      where('storeId', '==', storeId),
      where('isAvailable', '==', true),
      orderBy('order', 'asc')
    );
  }
  
  return onSnapshot(q, (querySnapshot) => {
    const items: MenuItem[] = [];
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() } as MenuItem);
    });
    console.log('✅ Itens do menu atualizados em tempo real:', items.length);
    callback(items);
  }, (error) => {
    console.error('❌ Erro no listener de itens:', error);
    callback([]);
  });
};

/**
 * Formatar preço para exibição
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(price);
};

/**
 * Formatar tempo de preparo para exibição
 */
export const formatPreparationTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMinutes}min`;
};
