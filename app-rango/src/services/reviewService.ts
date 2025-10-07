/**
 * SERVIÇO DE AVALIAÇÕES (REVIEWS)
 * 
 * Gerencia sistema de avaliações de pedidos e lojas
 */

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebaseConfig';

export interface Review {
  id: string;
  orderId: string;
  storeId: string;
  customerId: string;
  customerName: string;
  rating: number; // 1-5
  comment: string;
  response?: string; // Resposta do lojista
  helpful: number; // Contador de "útil"
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

export interface CreateReviewData {
  orderId: string;
  storeId: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
}

/**
 * Criar uma avaliação
 */
export const createReview = async (data: CreateReviewData): Promise<string> => {
  try {
    // Validações
    if (data.rating < 1 || data.rating > 5) {
      throw new Error('A avaliação deve ser entre 1 e 5 estrelas');
    }

    if (!data.comment || data.comment.trim().length < 10) {
      throw new Error('O comentário deve ter pelo menos 10 caracteres');
    }

    // Verificar se já existe avaliação para este pedido
    const existingReview = await getReviewByOrderId(data.orderId);
    if (existingReview) {
      throw new Error('Você já avaliou este pedido');
    }

    const reviewRef = await addDoc(collection(db, 'reviews'), {
      ...data,
      helpful: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log('✅ Avaliação criada:', reviewRef.id);

    // Atualizar rating da loja
    await updateStoreRating(data.storeId);

    return reviewRef.id;
  } catch (error: any) {
    console.error('❌ Erro ao criar avaliação:', error);
    throw error;
  }
};

/**
 * Buscar avaliação por ID do pedido
 */
export const getReviewByOrderId = async (orderId: string): Promise<Review | null> => {
  try {
    const q = query(
      collection(db, 'reviews'),
      where('orderId', '==', orderId),
      firestoreLimit(1)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Review;
  } catch (error) {
    console.error('Erro ao buscar avaliação:', error);
    return null;
  }
};

/**
 * Buscar avaliações de uma loja
 */
export const getStoreReviews = async (
  storeId: string,
  limit: number = 50
): Promise<Review[]> => {
  try {
    // Query sem orderBy para evitar necessidade de índice composto
    const q = query(
      collection(db, 'reviews'),
      where('storeId', '==', storeId)
    );

    const querySnapshot = await getDocs(q);
    const reviews: Review[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      reviews.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Review);
    });

    // Ordenar localmente por data de criação (mais rápido e sem índice necessário)
    reviews.sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(0);
      const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(0);
      return dateB.getTime() - dateA.getTime(); // Mais recente primeiro
    });

    // Aplicar limite localmente
    return reviews.slice(0, limit);
  } catch (error) {
    console.error('Erro ao buscar avaliações da loja:', error);
    return [];
  }
};

/**
 * Buscar avaliações de um cliente
 */
export const getCustomerReviews = async (customerId: string): Promise<Review[]> => {
  try {
    // Query sem orderBy para evitar necessidade de índice composto
    const q = query(
      collection(db, 'reviews'),
      where('customerId', '==', customerId)
    );

    const querySnapshot = await getDocs(q);
    const reviews: Review[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      reviews.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Review);
    });

    // Ordenar localmente por data de criação (mais rápido e sem índice necessário)
    reviews.sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(0);
      const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(0);
      return dateB.getTime() - dateA.getTime(); // Mais recente primeiro
    });

    return reviews;
  } catch (error) {
    console.error('Erro ao buscar avaliações do cliente:', error);
    return [];
  }
};

/**
 * Atualizar rating médio da loja
 */
export const updateStoreRating = async (storeId: string): Promise<void> => {
  try {
    const reviews = await getStoreReviews(storeId);

    if (reviews.length === 0) {
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const avgRating = totalRating / reviews.length;

    const storeRef = doc(db, 'stores', storeId);
    await updateDoc(storeRef, {
      rating: Math.round(avgRating * 10) / 10, // Arredondar para 1 casa decimal
      reviewCount: reviews.length,
      updatedAt: serverTimestamp(),
    });

    console.log(`✅ Rating da loja ${storeId} atualizado: ${avgRating.toFixed(1)}`);
  } catch (error) {
    console.error('Erro ao atualizar rating da loja:', error);
  }
};

/**
 * Lojista responder a uma avaliação
 */
export const respondToReview = async (
  reviewId: string,
  response: string
): Promise<void> => {
  try {
    if (!response || response.trim().length < 5) {
      throw new Error('A resposta deve ter pelo menos 5 caracteres');
    }

    const reviewRef = doc(db, 'reviews', reviewId);
    await updateDoc(reviewRef, {
      response: response.trim(),
      updatedAt: serverTimestamp(),
    });

    console.log('✅ Resposta adicionada à avaliação:', reviewId);
  } catch (error: any) {
    console.error('❌ Erro ao responder avaliação:', error);
    throw error;
  }
};

/**
 * Marcar avaliação como útil
 */
export const markReviewHelpful = async (reviewId: string): Promise<void> => {
  try {
    const reviewRef = doc(db, 'reviews', reviewId);
    const reviewDoc = await getDoc(reviewRef);

    if (!reviewDoc.exists()) {
      throw new Error('Avaliação não encontrada');
    }

    const currentHelpful = reviewDoc.data().helpful || 0;

    await updateDoc(reviewRef, {
      helpful: currentHelpful + 1,
    });

    console.log('✅ Avaliação marcada como útil');
  } catch (error: any) {
    console.error('❌ Erro ao marcar avaliação como útil:', error);
    throw error;
  }
};

/**
 * Calcular estatísticas de avaliações
 */
export const getReviewStats = async (storeId: string) => {
  try {
    const reviews = await getStoreReviews(storeId);

    if (reviews.length === 0) {
      return {
        average: 0,
        count: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }

    // Calcular média
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const average = totalRating / reviews.length;

    // Distribuição por estrelas
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((review) => {
      distribution[review.rating as keyof typeof distribution]++;
    });

    return {
      average: Math.round(average * 10) / 10,
      count: reviews.length,
      distribution,
    };
  } catch (error) {
    console.error('Erro ao calcular estatísticas:', error);
    return {
      average: 0,
      count: 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    };
  }
};

