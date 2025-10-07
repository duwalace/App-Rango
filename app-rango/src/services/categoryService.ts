/**
 * categoryService.ts
 * Gerencia categorias de lojas (Restaurantes, Mercado, Bebidas, etc.)
 */

import { collection, doc, getDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from './firebaseConfig';

export interface Category {
  id: string;
  name: string;
  icon: string;
  slug: string; // Para usar como filtro (ex: 'restaurantes', 'mercado')
  description?: string;
  image?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CATEGORIES_COLLECTION = 'categories';

/**
 * Buscar todas as categorias ativas
 */
export const getActiveCategories = async (): Promise<Category[]> => {
  try {
    // Query sem orderBy para evitar necessidade de índice composto
    const q = query(
      collection(db, CATEGORIES_COLLECTION),
      where('isActive', '==', true)
    );

    const querySnapshot = await getDocs(q);
    const categories: Category[] = [];

    querySnapshot.forEach((doc) => {
      categories.push({ id: doc.id, ...doc.data() } as Category);
    });

    // Ordenar localmente por order (mais rápido e sem índice necessário)
    categories.sort((a, b) => a.order - b.order);

    console.log('✅ Categorias carregadas:', categories.length);
    return categories;
  } catch (error) {
    console.error('❌ Erro ao buscar categorias:', error);
    // Retornar categorias padrão se houver erro
    return getDefaultCategories();
  }
};

/**
 * Buscar uma categoria por ID
 */
export const getCategoryById = async (id: string): Promise<Category | null> => {
  try {
    const docRef = doc(db, CATEGORIES_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Category;
    }

    return null;
  } catch (error) {
    console.error('Erro ao buscar categoria:', error);
    return null;
  }
};

/**
 * Buscar categoria por slug
 */
export const getCategoryBySlug = async (slug: string): Promise<Category | null> => {
  try {
    const q = query(
      collection(db, CATEGORIES_COLLECTION),
      where('slug', '==', slug.toLowerCase()),
      where('isActive', '==', true)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Category;
    }

    return null;
  } catch (error) {
    console.error('Erro ao buscar categoria por slug:', error);
    return null;
  }
};

/**
 * Categorias padrão (fallback quando Firebase não está disponível)
 */
export const getDefaultCategories = (): Category[] => {
  return [
    {
      id: '1',
      name: 'Restaurantes',
      icon: 'restaurant',
      slug: 'restaurantes',
      description: 'Restaurantes e lanchonetes',
      order: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      name: 'Mercado',
      icon: 'storefront',
      slug: 'mercado',
      description: 'Supermercados e hortifruti',
      order: 2,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      name: 'Bebidas',
      icon: 'wine',
      slug: 'bebidas',
      description: 'Bebidas e distribuidoras',
      order: 3,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '4',
      name: 'Farmácia',
      icon: 'medical',
      slug: 'farmacia',
      description: 'Farmácias e drogarias',
      order: 4,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '5',
      name: 'Pet Shop',
      icon: 'paw',
      slug: 'pet-shop',
      description: 'Produtos para pets',
      order: 5,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '6',
      name: 'Shopping',
      icon: 'bag',
      slug: 'shopping',
      description: 'Lojas e comércio',
      order: 6,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
};

/**
 * Mapear ID de categoria mockada para slug real
 * (Para manter compatibilidade com código existente)
 */
export const mapCategoryIdToSlug = (categoryId: string): string => {
  const mapping: Record<string, string> = {
    '1': 'restaurantes',
    '2': 'mercado',
    '3': 'bebidas',
    '4': 'farmacia',
    '5': 'pet-shop',
    '6': 'shopping',
  };

  return mapping[categoryId] || 'restaurantes';
};

/**
 * Mapear slug para nome da categoria
 */
export const getCategoryNameBySlug = (slug: string): string => {
  const mapping: Record<string, string> = {
    'restaurantes': 'Restaurantes',
    'mercado': 'Mercado',
    'bebidas': 'Bebidas',
    'farmacia': 'Farmácia',
    'pet-shop': 'Pet Shop',
    'shopping': 'Shopping',
  };

  return mapping[slug] || 'Todos';
};

