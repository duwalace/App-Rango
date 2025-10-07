/**
 * SERVIÇO DE PROMOÇÕES E CUPONS
 * 
 * Gerencia criação, validação e aplicação de promoções
 */

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type PromotionType = 'percentage' | 'fixed' | 'buyXgetY' | 'freeDelivery';
export type PromotionStatus = 'active' | 'inactive' | 'expired' | 'scheduled';

export interface Promotion {
  id: string;
  storeId: string;
  name: string;
  description: string;
  type: PromotionType;
  code?: string; // Código do cupom (opcional)
  
  // Configuração do desconto
  discountValue?: number; // % ou valor fixo
  minOrderValue?: number; // Valor mínimo do pedido
  maxDiscount?: number; // Desconto máximo (para %)
  
  // Buy X Get Y (Leve X Pague Y)
  buyQuantity?: number; // Quantidade a comprar
  getQuantity?: number; // Quantidade grátis
  applicableItems?: string[]; // IDs de produtos específicos
  
  // Configurações gerais
  isActive: boolean;
  status: PromotionStatus;
  startDate: Date | Timestamp;
  endDate: Date | Timestamp;
  usageLimit?: number; // Limite total de usos
  usageCount: number; // Contador de usos
  userLimit?: number; // Limite por usuário
  
  // Metadados
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  createdBy: string;
}

export interface CreatePromotionData {
  storeId: string;
  name: string;
  description: string;
  type: PromotionType;
  code?: string;
  discountValue?: number;
  minOrderValue?: number;
  maxDiscount?: number;
  buyQuantity?: number;
  getQuantity?: number;
  applicableItems?: string[];
  startDate: Date;
  endDate: Date;
  usageLimit?: number;
  userLimit?: number;
  createdBy: string;
}

export interface PromotionValidation {
  isValid: boolean;
  error?: string;
  discountAmount?: number;
  finalPrice?: number;
}

/**
 * Criar uma promoção
 */
export const createPromotion = async (data: CreatePromotionData): Promise<string> => {
  try {
    // Validações
    if (!data.name || data.name.trim().length < 3) {
      throw new Error('O nome da promoção deve ter pelo menos 3 caracteres');
    }

    if (data.type === 'percentage' && (!data.discountValue || data.discountValue > 100)) {
      throw new Error('Desconto percentual deve ser entre 1 e 100');
    }

    if (data.type === 'buyXgetY') {
      if (!data.buyQuantity || !data.getQuantity) {
        throw new Error('Configure as quantidades para Leve X Pague Y');
      }
    }

    if (data.endDate <= data.startDate) {
      throw new Error('A data de término deve ser após a data de início');
    }

    // Determinar status baseado nas datas
    const now = new Date();
    let status: PromotionStatus = 'scheduled';
    
    if (data.startDate <= now && data.endDate >= now) {
      status = 'active';
    } else if (data.endDate < now) {
      status = 'expired';
    }

    const promotionRef = await addDoc(collection(db, 'promotions'), {
      ...data,
      isActive: status === 'active',
      status,
      usageCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log('✅ Promoção criada:', promotionRef.id);
    return promotionRef.id;
  } catch (error: any) {
    console.error('❌ Erro ao criar promoção:', error);
    throw error;
  }
};

/**
 * Buscar promoções de uma loja
 */
export const getStorePromotions = async (storeId: string): Promise<Promotion[]> => {
  try {
    const q = query(
      collection(db, 'promotions'),
      where('storeId', '==', storeId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const promotions: Promotion[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      promotions.push({
        id: doc.id,
        ...data,
        startDate: data.startDate?.toDate() || new Date(),
        endDate: data.endDate?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Promotion);
    });

    return promotions;
  } catch (error) {
    console.error('Erro ao buscar promoções:', error);
    return [];
  }
};

/**
 * Buscar promoções ativas de uma loja
 */
export const getActivePromotions = async (storeId: string): Promise<Promotion[]> => {
  try {
    const now = new Date();

    const q = query(
      collection(db, 'promotions'),
      where('storeId', '==', storeId),
      where('isActive', '==', true)
    );

    const snapshot = await getDocs(q);
    const promotions: Promotion[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      const promotion = {
        id: doc.id,
        ...data,
        startDate: data.startDate?.toDate() || new Date(),
        endDate: data.endDate?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Promotion;

      // Verificar se está dentro do período
      if (promotion.startDate <= now && promotion.endDate >= now) {
        // Verificar limite de uso
        if (!promotion.usageLimit || promotion.usageCount < promotion.usageLimit) {
          promotions.push(promotion);
        }
      }
    });

    return promotions;
  } catch (error) {
    console.error('Erro ao buscar promoções ativas:', error);
    return [];
  }
};

/**
 * Buscar promoção por código
 */
export const getPromotionByCode = async (
  storeId: string,
  code: string
): Promise<Promotion | null> => {
  try {
    const q = query(
      collection(db, 'promotions'),
      where('storeId', '==', storeId),
      where('code', '==', code.toUpperCase())
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    return {
      id: doc.id,
      ...data,
      startDate: data.startDate?.toDate() || new Date(),
      endDate: data.endDate?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Promotion;
  } catch (error) {
    console.error('Erro ao buscar promoção por código:', error);
    return null;
  }
};

/**
 * Validar e calcular desconto de uma promoção
 */
export const validatePromotion = (
  promotion: Promotion,
  orderValue: number,
  userId?: string
): PromotionValidation => {
  // Verificar se está ativa
  if (!promotion.isActive) {
    return { isValid: false, error: 'Promoção inativa' };
  }

  // Verificar período
  const now = new Date();
  if (promotion.startDate > now) {
    return { isValid: false, error: 'Promoção ainda não começou' };
  }
  if (promotion.endDate < now) {
    return { isValid: false, error: 'Promoção expirada' };
  }

  // Verificar limite de uso total
  if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) {
    return { isValid: false, error: 'Promoção esgotada' };
  }

  // Verificar valor mínimo do pedido
  if (promotion.minOrderValue && orderValue < promotion.minOrderValue) {
    return {
      isValid: false,
      error: `Valor mínimo do pedido: R$ ${promotion.minOrderValue.toFixed(2)}`,
    };
  }

  // Calcular desconto
  let discountAmount = 0;

  switch (promotion.type) {
    case 'percentage':
      discountAmount = (orderValue * (promotion.discountValue || 0)) / 100;
      if (promotion.maxDiscount && discountAmount > promotion.maxDiscount) {
        discountAmount = promotion.maxDiscount;
      }
      break;

    case 'fixed':
      discountAmount = promotion.discountValue || 0;
      if (discountAmount > orderValue) {
        discountAmount = orderValue;
      }
      break;

    case 'freeDelivery':
      // Retorna sucesso, mas o desconto será aplicado na taxa de entrega
      discountAmount = 0;
      break;

    case 'buyXgetY':
      // Lógica específica para Buy X Get Y (implementar no carrinho)
      discountAmount = 0;
      break;
  }

  const finalPrice = Math.max(0, orderValue - discountAmount);

  return {
    isValid: true,
    discountAmount,
    finalPrice,
  };
};

/**
 * Atualizar promoção
 */
export const updatePromotion = async (
  id: string,
  data: Partial<CreatePromotionData>
): Promise<void> => {
  try {
    const promotionRef = doc(db, 'promotions', id);
    await updateDoc(promotionRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });

    console.log('✅ Promoção atualizada:', id);
  } catch (error: any) {
    console.error('❌ Erro ao atualizar promoção:', error);
    throw error;
  }
};

/**
 * Ativar/Desativar promoção
 */
export const togglePromotionStatus = async (
  id: string,
  isActive: boolean
): Promise<void> => {
  try {
    const promotionRef = doc(db, 'promotions', id);
    const status: PromotionStatus = isActive ? 'active' : 'inactive';

    await updateDoc(promotionRef, {
      isActive,
      status,
      updatedAt: serverTimestamp(),
    });

    console.log(`✅ Promoção ${isActive ? 'ativada' : 'desativada'}:`, id);
  } catch (error: any) {
    console.error('❌ Erro ao alterar status da promoção:', error);
    throw error;
  }
};

/**
 * Deletar promoção
 */
export const deletePromotion = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'promotions', id));
    console.log('✅ Promoção deletada:', id);
  } catch (error: any) {
    console.error('❌ Erro ao deletar promoção:', error);
    throw error;
  }
};

/**
 * Incrementar contador de uso
 */
export const incrementPromotionUsage = async (id: string): Promise<void> => {
  try {
    const promotionRef = doc(db, 'promotions', id);
    const promotionDoc = await getDoc(promotionRef);

    if (!promotionDoc.exists()) {
      throw new Error('Promoção não encontrada');
    }

    const currentCount = promotionDoc.data().usageCount || 0;

    await updateDoc(promotionRef, {
      usageCount: currentCount + 1,
      updatedAt: serverTimestamp(),
    });

    console.log('✅ Uso da promoção incrementado:', id);
  } catch (error: any) {
    console.error('❌ Erro ao incrementar uso:', error);
    throw error;
  }
};

/**
 * Gerar código único de cupom
 */
export const generateCouponCode = (prefix: string = ''): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = prefix.toUpperCase();
  
  const length = 8 - code.length;
  for (let i = 0; i < length; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return code;
};

