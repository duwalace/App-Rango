import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  MenuCategory, 
  MenuItem, 
  CreateMenuCategoryData, 
  UpdateMenuCategoryData,
  CreateMenuItemData,
  UpdateMenuItemData
} from '@/types/shared';

// Coleções
const CATEGORIES_COLLECTION = 'menuCategories';
const ITEMS_COLLECTION = 'menuItems';

// ========== CATEGORIAS ==========

/**
 * Buscar todas as categorias de uma loja
 */
export const getStoreCategories = async (storeId: string): Promise<MenuCategory[]> => {
  try {
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
    
    return categories;
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    throw error;
  }
};

/**
 * Buscar uma categoria por ID
 */
export const getCategoryById = async (categoryId: string): Promise<MenuCategory | null> => {
  try {
    const categoryDoc = await getDoc(doc(db, CATEGORIES_COLLECTION, categoryId));
    
    if (categoryDoc.exists()) {
      return { id: categoryDoc.id, ...categoryDoc.data() } as MenuCategory;
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao buscar categoria:', error);
    throw error;
  }
};

/**
 * Criar uma nova categoria
 */
export const createCategory = async (categoryData: CreateMenuCategoryData): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), {
      ...categoryData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    throw error;
  }
};

/**
 * Atualizar uma categoria
 */
export const updateCategory = async (
  categoryId: string, 
  updates: UpdateMenuCategoryData
): Promise<void> => {
  try {
    const categoryRef = doc(db, CATEGORIES_COLLECTION, categoryId);
    
    await updateDoc(categoryRef, {
      ...updates,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    throw error;
  }
};

/**
 * Deletar uma categoria
 */
export const deleteCategory = async (categoryId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, CATEGORIES_COLLECTION, categoryId));
  } catch (error) {
    console.error('Erro ao deletar categoria:', error);
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
    callback(categories);
  }, (error) => {
    console.error('Erro no listener de categorias:', error);
    callback([]);
  });
};

// ========== ITENS DO CARDÁPIO ==========

/**
 * Buscar todos os itens de uma loja
 */
export const getStoreMenuItems = async (storeId: string): Promise<MenuItem[]> => {
  try {
    const q = query(
      collection(db, ITEMS_COLLECTION),
      where('storeId', '==', storeId),
      orderBy('order', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    const items: MenuItem[] = [];
    
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() } as MenuItem);
    });
    
    return items;
  } catch (error) {
    console.error('Erro ao buscar itens do cardápio:', error);
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
    
    return items;
  } catch (error) {
    console.error('Erro ao buscar itens da categoria:', error);
    throw error;
  }
};

/**
 * Buscar um item por ID
 */
export const getMenuItemById = async (itemId: string): Promise<MenuItem | null> => {
  try {
    const itemDoc = await getDoc(doc(db, ITEMS_COLLECTION, itemId));
    
    if (itemDoc.exists()) {
      return { id: itemDoc.id, ...itemDoc.data() } as MenuItem;
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao buscar item:', error);
    throw error;
  }
};

/**
 * Buscar itens populares de uma loja
 */
export const getPopularItems = async (storeId: string): Promise<MenuItem[]> => {
  try {
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
    
    return items;
  } catch (error) {
    console.error('Erro ao buscar itens populares:', error);
    throw error;
  }
};

/**
 * Criar um novo item
 */
export const createMenuItem = async (itemData: CreateMenuItemData): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, ITEMS_COLLECTION), {
      ...itemData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Erro ao criar item:', error);
    throw error;
  }
};

/**
 * Atualizar um item
 */
export const updateMenuItem = async (
  itemId: string, 
  updates: UpdateMenuItemData
): Promise<void> => {
  try {
    const itemRef = doc(db, ITEMS_COLLECTION, itemId);
    
    await updateDoc(itemRef, {
      ...updates,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Erro ao atualizar item:', error);
    throw error;
  }
};

/**
 * Deletar um item
 */
export const deleteMenuItem = async (itemId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, ITEMS_COLLECTION, itemId));
  } catch (error) {
    console.error('Erro ao deletar item:', error);
    throw error;
  }
};

/**
 * Marcar item como disponível/indisponível
 */
export const toggleItemAvailability = async (
  itemId: string, 
  isAvailable: boolean
): Promise<void> => {
  try {
    await updateMenuItem(itemId, { isAvailable });
  } catch (error) {
    console.error('Erro ao alterar disponibilidade do item:', error);
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
  let q;
  
  if (categoryId) {
    q = query(
      collection(db, ITEMS_COLLECTION),
      where('storeId', '==', storeId),
      where('categoryId', '==', categoryId),
      orderBy('order', 'asc')
    );
  } else {
    q = query(
      collection(db, ITEMS_COLLECTION),
      where('storeId', '==', storeId),
      orderBy('order', 'asc')
    );
  }
  
  return onSnapshot(q, (querySnapshot) => {
    const items: MenuItem[] = [];
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() } as MenuItem);
    });
    callback(items);
  }, (error) => {
    console.error('Erro no listener de itens:', error);
    callback([]);
  });
};

/**
 * Listener em tempo real para um item específico
 */
export const subscribeToMenuItem = (
  itemId: string,
  callback: (item: MenuItem | null) => void
): Unsubscribe => {
  const itemRef = doc(db, ITEMS_COLLECTION, itemId);
  
  return onSnapshot(itemRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() } as MenuItem);
    } else {
      callback(null);
    }
  }, (error) => {
    console.error('Erro no listener do item:', error);
    callback(null);
  });
}; 