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
  CreateMenuCategoryData, 
  UpdateMenuCategoryData
} from '@/types/shared';

// Importar tipos avançados do novo schema
import {
  MenuItem,
  CreateMenuItemData,
  UpdateMenuItemData
} from '@/types/menu-advanced';

// Coleções
const CATEGORIES_COLLECTION = 'menuCategories';
const ITEMS_COLLECTION = 'menuItems';

// ========== CATEGORIAS ==========

/**
 * Buscar todas as categorias de uma loja
 * CORRIGIDO: Remove orderBy para evitar necessidade de índice composto
 */
export const getStoreCategories = async (storeId: string): Promise<MenuCategory[]> => {
  try {
    console.log('🔍 getStoreCategories: Buscando categorias da loja', storeId);
    const q = query(
      collection(db, CATEGORIES_COLLECTION),
      where('storeId', '==', storeId),
      where('isActive', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    console.log('🔍 getStoreCategories: Docs recebidos:', querySnapshot.size);
    const categories: MenuCategory[] = [];
    
    querySnapshot.forEach((doc) => {
      categories.push({ id: doc.id, ...doc.data() } as MenuCategory);
    });
    
    // Ordenar em memória por 'order'
    categories.sort((a, b) => (a.order || 0) - (b.order || 0));
    
    console.log('✅ getStoreCategories: Retornando', categories.length, 'categorias');
    return categories;
  } catch (error) {
    console.error('❌ getStoreCategories: Erro ao buscar categorias:', error);
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
 * CORRIGIDO: Remove orderBy para evitar necessidade de índice composto
 */
export const subscribeToStoreCategories = (
  storeId: string,
  callback: (categories: MenuCategory[]) => void
): Unsubscribe => {
  const q = query(
    collection(db, CATEGORIES_COLLECTION),
    where('storeId', '==', storeId),
    where('isActive', '==', true)
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const categories: MenuCategory[] = [];
    querySnapshot.forEach((doc) => {
      categories.push({ id: doc.id, ...doc.data() } as MenuCategory);
    });
    // Ordenar em memória por 'order'
    categories.sort((a, b) => (a.order || 0) - (b.order || 0));
    callback(categories);
  }, (error) => {
    console.error('Erro no listener de categorias:', error);
    callback([]);
  });
};

/**
 * Atualizar ordem das categorias (drag and drop)
 */
export const updateCategoriesOrder = async (
  storeId: string,
  orderedCategoryIds: string[]
): Promise<void> => {
  try {
    // Batch update para performance
    const batch = orderedCategoryIds.map(async (categoryId, index) => {
      const categoryRef = doc(db, CATEGORIES_COLLECTION, categoryId);
      return updateDoc(categoryRef, {
        order: index,
        updatedAt: new Date()
      });
    });
    
    await Promise.all(batch);
    console.log('✅ Ordem das categorias atualizada');
  } catch (error) {
    console.error('❌ Erro ao atualizar ordem:', error);
    throw error;
  }
};

/**
 * Buscar todas as categorias (incluindo inativas) para gestão
 * CORRIGIDO: Remove orderBy para evitar necessidade de índice composto
 */
export const getAllStoreCategories = async (storeId: string): Promise<MenuCategory[]> => {
  try {
    const q = query(
      collection(db, CATEGORIES_COLLECTION),
      where('storeId', '==', storeId)
    );
    
    const querySnapshot = await getDocs(q);
    const categories: MenuCategory[] = [];
    
    querySnapshot.forEach((doc) => {
      categories.push({ id: doc.id, ...doc.data() } as MenuCategory);
    });
    
    // Ordenar em memória por 'order'
    categories.sort((a, b) => (a.order || 0) - (b.order || 0));
    
    return categories;
  } catch (error) {
    console.error('Erro ao buscar todas as categorias:', error);
    throw error;
  }
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
 * CORRIGIDO: Remove orderBy para evitar necessidade de índice composto
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
      where('isAvailable', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    const items: MenuItem[] = [];
    
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() } as MenuItem);
    });
    
    // Ordenar em memória por 'order'
    items.sort((a, b) => (a.order || 0) - (b.order || 0));
    
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
 * Remove campos com valor undefined de um objeto
 * (Firestore não aceita undefined, apenas null ou campo ausente)
 */
const removeUndefinedFields = <T extends Record<string, any>>(obj: T): Partial<T> => {
  const cleaned: any = {};
  
  for (const key in obj) {
    const value = obj[key];
    
    // Pular campos undefined
    if (value === undefined) {
      continue;
    }
    
    // Se for um objeto (e não array ou Date), limpar recursivamente
    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      cleaned[key] = removeUndefinedFields(value);
    } else {
      cleaned[key] = value;
    }
  }
  
  return cleaned;
};

/**
 * Criar um novo item com schema avançado
 */
export const createMenuItem = async (itemData: CreateMenuItemData): Promise<string> => {
  try {
    console.log('🔵 Criando novo item no Firestore...', itemData);
    
    // Remover campos undefined antes de enviar
    const cleanedData = removeUndefinedFields({
      ...itemData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const docRef = await addDoc(collection(db, ITEMS_COLLECTION), cleanedData);
    
    console.log('✅ Item criado com sucesso:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Erro ao criar item:', error);
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
    
    // Remover campos undefined antes de atualizar
    const cleanedUpdates = removeUndefinedFields({
      ...updates,
      updatedAt: new Date()
    });
    
    await updateDoc(itemRef, cleanedUpdates);
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

/**
 * Atualizar apenas disponibilidade de um item (rápido)
 */
export const setItemAvailability = async (
  itemId: string,
  isAvailable: boolean
): Promise<void> => {
  try {
    const itemRef = doc(db, ITEMS_COLLECTION, itemId);
    await updateDoc(itemRef, {
      isAvailable,
      updatedAt: new Date()
    });
    console.log(`✅ Disponibilidade do item ${itemId} atualizada para: ${isAvailable}`);
  } catch (error) {
    console.error('❌ Erro ao atualizar disponibilidade:', error);
    throw error;
  }
};

/**
 * Atualizar estoque de um item
 */
export const updateItemStock = async (
  itemId: string,
  stockData: {
    currentStock: number;
    autoDisable?: boolean;
  }
): Promise<void> => {
  try {
    const itemRef = doc(db, ITEMS_COLLECTION, itemId);
    const updates: any = {
      'stockControl.currentStock': stockData.currentStock,
      'stockControl.lastRestocked': new Date(),
      updatedAt: new Date()
    };
    
    // Auto-desabilitar se estoque zero
    if (stockData.autoDisable && stockData.currentStock === 0) {
      updates.isAvailable = false;
    }
    
    await updateDoc(itemRef, updates);
    console.log(`✅ Estoque do item ${itemId} atualizado para: ${stockData.currentStock}`);
  } catch (error) {
    console.error('❌ Erro ao atualizar estoque:', error);
    throw error;
  }
};

/**
 * Buscar itens com controle de estoque ativado
 */
export const getItemsWithStockControl = async (storeId: string): Promise<MenuItem[]> => {
  try {
    const q = query(
      collection(db, ITEMS_COLLECTION),
      where('storeId', '==', storeId),
      where('stockControl.enabled', '==', true),
      orderBy('order', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    const items: MenuItem[] = [];
    
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() } as MenuItem);
    });
    
    return items;
  } catch (error) {
    console.error('Erro ao buscar itens com estoque:', error);
    throw error;
  }
}; 