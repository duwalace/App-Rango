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
    
    console.log('   Documentos de categorias retornados:', querySnapshot.size);
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`   Categoria: ${data.name} (ID: ${doc.id})`);
      categories.push({ id: doc.id, ...data } as MenuCategory);
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
      const data = doc.data();
      console.log(`   Item encontrado: ${data.name} (categoria: ${data.categoryId})`);
      items.push({ id: doc.id, ...data } as MenuItem);
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
 * Query simplificada - sem índice composto necessário
 */
export const getPopularItems = async (storeId: string): Promise<MenuItem[]> => {
  try {
    console.log('🔵 Buscando itens populares da loja:', storeId);
    
    // Query simples - buscar apenas por loja e disponibilidade
    const q = query(
      collection(db, ITEMS_COLLECTION),
      where('storeId', '==', storeId),
      where('isAvailable', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    const items: MenuItem[] = [];
    const popularItems: MenuItem[] = [];
    
    // Separar populares e ordenar no código
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const item = { id: doc.id, ...data } as MenuItem;
      
      if (data.isPopular === true) {
        popularItems.push(item);
      }
    });
    
    // Ordenar por order
    popularItems.sort((a, b) => (a.order || 0) - (b.order || 0));
    
    console.log('✅ Itens populares encontrados:', popularItems.length);
    return popularItems;
  } catch (error) {
    console.error('❌ Erro ao buscar itens populares:', error);
    return []; // Retornar array vazio em vez de throw
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
 * Buscar produtos por tags (para exibir na tela inicial por categoria)
 * Ex: tags contendo "pizza", "marmita", etc
 */
export const getProductsByTag = async (tag: string, limit: number = 10): Promise<MenuItem[]> => {
  try {
    console.log(`🔵 Buscando produtos com tag: ${tag}`);
    
    const q = query(
      collection(db, ITEMS_COLLECTION),
      where('tags', 'array-contains', tag.toLowerCase()),
      where('isAvailable', '==', true),
      orderBy('sales', 'desc') // Ordenar pelos mais vendidos
    );
    
    const querySnapshot = await getDocs(q);
    const items: MenuItem[] = [];
    
    querySnapshot.forEach((doc) => {
      if (items.length < limit) {
        items.push({ id: doc.id, ...doc.data() } as MenuItem);
      }
    });
    
    console.log(`✅ Produtos com tag "${tag}" encontrados:`, items.length);
    return items;
  } catch (error) {
    console.error(`❌ Erro ao buscar produtos com tag "${tag}":`, error);
    // Se der erro de índice, retornar array vazio por enquanto
    return [];
  }
};

/**
 * Buscar produtos para tela inicial
 * Busca TODOS os itens disponíveis, priorizando os populares
 */
export const getPopularProducts = async (limit: number = 20): Promise<MenuItem[]> => {
  try {
    console.log('🔵 Buscando produtos para tela inicial');
    console.log('   Coleção:', ITEMS_COLLECTION);
    
    // Primeiro tenta buscar apenas produtos disponíveis (query mais simples)
    const q = query(
      collection(db, ITEMS_COLLECTION),
      where('isAvailable', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    console.log('   📦 Total de documentos retornados:', querySnapshot.size);
    
    const items: MenuItem[] = [];
    const popularItems: MenuItem[] = [];
    const regularItems: MenuItem[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const item = { id: doc.id, ...data } as MenuItem;
      
      // Separar populares de regulares
      if (data.isPopular === true) {
        console.log(`   ⭐ Popular: ${data.name}`);
        popularItems.push(item);
      } else {
        console.log(`   📌 Regular: ${data.name}`);
        regularItems.push(item);
      }
    });
    
    // Priorizar populares, depois adicionar regulares até o limite
    const allItems = [...popularItems, ...regularItems].slice(0, limit);
    
    console.log('✅ Produtos encontrados:');
    console.log(`   - Populares: ${popularItems.length}`);
    console.log(`   - Regulares: ${regularItems.length}`);
    console.log(`   - Total retornado: ${allItems.length}`);
    
    return allItems;
  } catch (error) {
    console.error('❌ Erro ao buscar produtos:', error);
    return [];
  }
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

// ========== CRUD DE CATEGORIAS ==========

/**
 * Criar uma nova categoria
 */
export const createCategory = async (categoryData: {
  storeId: string;
  name: string;
  description: string;
  image?: string;
  isActive: boolean;
  order: number;
}): Promise<string> => {
  try {
    console.log('🔵 Criando categoria:', categoryData.name);
    
    const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), {
      ...categoryData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('✅ Categoria criada com ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Erro ao criar categoria:', error);
    throw error;
  }
};

/**
 * Atualizar uma categoria
 */
export const updateCategory = async (
  categoryId: string,
  updates: Partial<MenuCategory>
): Promise<void> => {
  try {
    const categoryRef = doc(db, CATEGORIES_COLLECTION, categoryId);
    await updateDoc(categoryRef, {
      ...updates,
      updatedAt: new Date()
    });
    console.log('✅ Categoria atualizada:', categoryId);
  } catch (error) {
    console.error('❌ Erro ao atualizar categoria:', error);
    throw error;
  }
};

/**
 * Deletar uma categoria
 */
export const deleteCategory = async (categoryId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, CATEGORIES_COLLECTION, categoryId));
    console.log('✅ Categoria deletada:', categoryId);
  } catch (error) {
    console.error('❌ Erro ao deletar categoria:', error);
    throw error;
  }
};

// ========== CRUD DE ITENS DO MENU ==========

/**
 * Criar um novo item do menu
 */
export const createMenuItem = async (itemData: {
  storeId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  isAvailable: boolean;
  isPopular: boolean;
  preparationTime: number;
  ingredients?: string[];
  allergens?: string[];
  order: number;
}): Promise<string> => {
  try {
    console.log('🔵 Criando item:', itemData.name);
    
    const docRef = await addDoc(collection(db, ITEMS_COLLECTION), {
      ...itemData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('✅ Item criado com ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Erro ao criar item:', error);
    throw error;
  }
};

/**
 * Atualizar um item do menu
 */
export const updateMenuItem = async (
  itemId: string,
  updates: Partial<MenuItem>
): Promise<void> => {
  try {
    const itemRef = doc(db, ITEMS_COLLECTION, itemId);
    await updateDoc(itemRef, {
      ...updates,
      updatedAt: new Date()
    });
    console.log('✅ Item atualizado:', itemId);
  } catch (error) {
    console.error('❌ Erro ao atualizar item:', error);
    throw error;
  }
};

/**
 * Deletar um item do menu
 */
export const deleteMenuItem = async (itemId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, ITEMS_COLLECTION, itemId));
    console.log('✅ Item deletado:', itemId);
  } catch (error) {
    console.error('❌ Erro ao deletar item:', error);
    throw error;
  }
};