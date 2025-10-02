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
  Unsubscribe,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ========================================
// TIPOS
// ========================================

export interface GlobalComplementGroup {
  id: string;
  storeId: string;
  name: string;
  description?: string;
  
  // Regras de Seleção
  isRequired: boolean;
  minSelection: number;
  maxSelection: number; // -1 = ilimitado
  
  // Complementos do Grupo
  items: GlobalComplement[];
  
  // Metadata
  order: number;
  isActive: boolean;
  
  // Uso
  usageCount: number; // Quantos produtos usam este grupo
  
  // Auditoria
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface GlobalComplement {
  id: string;
  name: string;
  description?: string;
  price: number;
  isAvailable: boolean;
  maxQuantity: number; // Máximo por pedido
  order: number;
}

export type CreateComplementGroupData = Omit<
  GlobalComplementGroup, 
  'id' | 'createdAt' | 'updatedAt' | 'usageCount'
>;

export type UpdateComplementGroupData = Partial<
  Omit<GlobalComplementGroup, 'id' | 'storeId' | 'createdAt' | 'createdBy'>
>;

// ========================================
// COLEÇÃO
// ========================================

const COMPLEMENT_GROUPS_COLLECTION = 'complementGroups';

// ========================================
// CRUD OPERATIONS
// ========================================

/**
 * Criar um novo grupo de complementos
 */
export const createComplementGroup = async (
  groupData: CreateComplementGroupData
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COMPLEMENT_GROUPS_COLLECTION), {
      ...groupData,
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('✅ Grupo de complementos criado:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Erro ao criar grupo:', error);
    throw error;
  }
};

/**
 * Buscar todos os grupos de uma loja
 */
export const getStoreComplementGroups = async (
  storeId: string,
  activeOnly = false
): Promise<GlobalComplementGroup[]> => {
  try {
    let q = query(
      collection(db, COMPLEMENT_GROUPS_COLLECTION),
      where('storeId', '==', storeId),
      orderBy('order', 'asc')
    );
    
    if (activeOnly) {
      q = query(
        collection(db, COMPLEMENT_GROUPS_COLLECTION),
        where('storeId', '==', storeId),
        where('isActive', '==', true),
        orderBy('order', 'asc')
      );
    }
    
    const querySnapshot = await getDocs(q);
    const groups: GlobalComplementGroup[] = [];
    
    querySnapshot.forEach((doc) => {
      groups.push({ id: doc.id, ...doc.data() } as GlobalComplementGroup);
    });
    
    return groups;
  } catch (error) {
    console.error('Erro ao buscar grupos:', error);
    throw error;
  }
};

/**
 * Buscar um grupo por ID
 */
export const getComplementGroupById = async (
  groupId: string
): Promise<GlobalComplementGroup | null> => {
  try {
    const groupDoc = await getDoc(doc(db, COMPLEMENT_GROUPS_COLLECTION, groupId));
    
    if (groupDoc.exists()) {
      return { id: groupDoc.id, ...groupDoc.data() } as GlobalComplementGroup;
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao buscar grupo:', error);
    throw error;
  }
};

/**
 * Atualizar um grupo
 */
export const updateComplementGroup = async (
  groupId: string,
  updates: UpdateComplementGroupData
): Promise<void> => {
  try {
    const groupRef = doc(db, COMPLEMENT_GROUPS_COLLECTION, groupId);
    
    await updateDoc(groupRef, {
      ...updates,
      updatedAt: new Date()
    });
    
    console.log('✅ Grupo atualizado:', groupId);
  } catch (error) {
    console.error('❌ Erro ao atualizar grupo:', error);
    throw error;
  }
};

/**
 * Deletar um grupo
 */
export const deleteComplementGroup = async (groupId: string): Promise<void> => {
  try {
    // TODO: Verificar se o grupo está sendo usado por algum produto
    // antes de deletar (implementar no frontend)
    
    await deleteDoc(doc(db, COMPLEMENT_GROUPS_COLLECTION, groupId));
    console.log('✅ Grupo deletado:', groupId);
  } catch (error) {
    console.error('❌ Erro ao deletar grupo:', error);
    throw error;
  }
};

/**
 * Adicionar complemento a um grupo
 */
export const addComplementToGroup = async (
  groupId: string,
  complement: Omit<GlobalComplement, 'id'>
): Promise<void> => {
  try {
    const group = await getComplementGroupById(groupId);
    if (!group) throw new Error('Grupo não encontrado');
    
    const newComplement: GlobalComplement = {
      ...complement,
      id: `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    await updateComplementGroup(groupId, {
      items: [...group.items, newComplement]
    });
    
    console.log('✅ Complemento adicionado ao grupo');
  } catch (error) {
    console.error('❌ Erro ao adicionar complemento:', error);
    throw error;
  }
};

/**
 * Atualizar complemento de um grupo
 */
export const updateComplement = async (
  groupId: string,
  complementId: string,
  updates: Partial<Omit<GlobalComplement, 'id'>>
): Promise<void> => {
  try {
    const group = await getComplementGroupById(groupId);
    if (!group) throw new Error('Grupo não encontrado');
    
    const updatedItems = group.items.map(item =>
      item.id === complementId ? { ...item, ...updates } : item
    );
    
    await updateComplementGroup(groupId, {
      items: updatedItems
    });
    
    console.log('✅ Complemento atualizado');
  } catch (error) {
    console.error('❌ Erro ao atualizar complemento:', error);
    throw error;
  }
};

/**
 * Remover complemento de um grupo
 */
export const removeComplementFromGroup = async (
  groupId: string,
  complementId: string
): Promise<void> => {
  try {
    const group = await getComplementGroupById(groupId);
    if (!group) throw new Error('Grupo não encontrado');
    
    const updatedItems = group.items.filter(item => item.id !== complementId);
    
    await updateComplementGroup(groupId, {
      items: updatedItems
    });
    
    console.log('✅ Complemento removido');
  } catch (error) {
    console.error('❌ Erro ao remover complemento:', error);
    throw error;
  }
};

/**
 * Reordenar complementos de um grupo
 */
export const reorderComplements = async (
  groupId: string,
  orderedComplementIds: string[]
): Promise<void> => {
  try {
    const group = await getComplementGroupById(groupId);
    if (!group) throw new Error('Grupo não encontrado');
    
    // Criar um mapa para quick lookup
    const itemsMap = new Map(group.items.map(item => [item.id, item]));
    
    // Reordenar itens
    const reorderedItems = orderedComplementIds
      .map((id, index) => {
        const item = itemsMap.get(id);
        return item ? { ...item, order: index } : null;
      })
      .filter(Boolean) as GlobalComplement[];
    
    await updateComplementGroup(groupId, {
      items: reorderedItems
    });
    
    console.log('✅ Complementos reordenados');
  } catch (error) {
    console.error('❌ Erro ao reordenar:', error);
    throw error;
  }
};

/**
 * Listener em tempo real para grupos de complementos
 */
export const subscribeToComplementGroups = (
  storeId: string,
  callback: (groups: GlobalComplementGroup[]) => void
): Unsubscribe => {
  const q = query(
    collection(db, COMPLEMENT_GROUPS_COLLECTION),
    where('storeId', '==', storeId),
    orderBy('order', 'asc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const groups: GlobalComplementGroup[] = [];
    querySnapshot.forEach((doc) => {
      groups.push({ id: doc.id, ...doc.data() } as GlobalComplementGroup);
    });
    callback(groups);
  }, (error) => {
    console.error('Erro no listener de grupos:', error);
    callback([]);
  });
};

/**
 * Duplicar um grupo (útil para criar variações)
 */
export const duplicateComplementGroup = async (
  groupId: string,
  newName?: string
): Promise<string> => {
  try {
    const original = await getComplementGroupById(groupId);
    if (!original) throw new Error('Grupo não encontrado');
    
    const { id, createdAt, updatedAt, usageCount, ...groupData } = original;
    
    const duplicated: CreateComplementGroupData = {
      ...groupData,
      name: newName || `${original.name} (Cópia)`,
      order: original.order + 1
    };
    
    const newId = await createComplementGroup(duplicated);
    console.log('✅ Grupo duplicado:', newId);
    
    return newId;
  } catch (error) {
    console.error('❌ Erro ao duplicar grupo:', error);
    throw error;
  }
};

export default {
  createComplementGroup,
  getStoreComplementGroups,
  getComplementGroupById,
  updateComplementGroup,
  deleteComplementGroup,
  addComplementToGroup,
  updateComplement,
  removeComplementFromGroup,
  reorderComplements,
  subscribeToComplementGroups,
  duplicateComplementGroup
}; 