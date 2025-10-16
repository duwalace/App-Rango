import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  setDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where,
  orderBy,
  Timestamp,
  addDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  getAuth
} from 'firebase/auth';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'manager' | 'staff';
  status: 'active' | 'pending' | 'suspended';
  storeId: string;
  avatar?: string;
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface InviteData {
  email: string;
  name: string;
  role: TeamMember['role'];
  storeId: string;
}

/**
 * Busca todos os membros da equipe de uma loja
 */
export async function getStoreTeamMembers(storeId: string): Promise<TeamMember[]> {
  try {
    console.log('🔍 Buscando membros da loja:', storeId);

    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('storeId', '==', storeId)
      // orderBy removido temporariamente - ordenação será feita no código
    );

    const snapshot = await getDocs(q);
    const members: TeamMember[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      members.push({
        id: doc.id,
        name: data.nome || data.name || 'Sem nome',
        email: data.email,
        role: mapFirebaseRoleToTeamRole(data.role),
        status: data.status || 'active',
        storeId: data.storeId,
        avatar: data.avatar,
        joinedAt: data.joinedAt?.toDate() || data.createdAt?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      });
    });

    // Ordenar por data de criação (mais recente primeiro)
    members.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    console.log('✅ Membros encontrados:', members.length);
    return members;
  } catch (error) {
    console.error('❌ Erro ao buscar membros:', error);
    throw error;
  }
}

/**
 * Mapeia o role do Firebase para o role do TeamMember
 */
function mapFirebaseRoleToTeamRole(firebaseRole: string): TeamMember['role'] {
  switch (firebaseRole) {
    case 'dono_da_loja':
    case 'store_owner':
      return 'owner';
    case 'admin':
    case 'administrador':
      return 'admin';
    case 'manager':
    case 'gerente':
      return 'manager';
    case 'staff':
    case 'equipe':
      return 'staff';
    default:
      return 'staff';
  }
}

/**
 * Mapeia o role do TeamMember para o role do Firebase
 */
function mapTeamRoleToFirebaseRole(teamRole: TeamMember['role']): string {
  switch (teamRole) {
    case 'owner':
      return 'dono_da_loja';
    case 'admin':
      return 'admin';
    case 'manager':
      return 'manager';
    case 'staff':
      return 'staff';
  }
}

/**
 * Convida um novo membro para a equipe
 */
export async function inviteTeamMember(inviteData: InviteData): Promise<string> {
  try {
    console.log('📧 Enviando convite para:', inviteData.email);

    // Verificar se o email já existe
    const usersRef = collection(db, 'users');
    const emailQuery = query(usersRef, where('email', '==', inviteData.email));
    const emailSnapshot = await getDocs(emailQuery);

    if (!emailSnapshot.empty) {
      throw new Error('Este email já está cadastrado no sistema');
    }

    // Criar documento de convite pendente
    const inviteRef = collection(db, 'team_invites');
    const inviteDoc = await addDoc(inviteRef, {
      email: inviteData.email,
      name: inviteData.name,
      role: mapTeamRoleToFirebaseRole(inviteData.role),
      storeId: inviteData.storeId,
      status: 'pending',
      createdAt: Timestamp.now(),
      expiresAt: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // 7 dias
    });

    console.log('✅ Convite criado:', inviteDoc.id);

    // TODO: Enviar email de convite (implementar com Cloud Functions)
    // await sendInviteEmail(inviteData.email, inviteData.name, inviteDoc.id);

    return inviteDoc.id;
  } catch (error) {
    console.error('❌ Erro ao enviar convite:', error);
    throw error;
  }
}

/**
 * Atualiza o role de um membro da equipe
 */
export async function updateMemberRole(
  userId: string, 
  newRole: TeamMember['role']
): Promise<void> {
  try {
    console.log('🔄 Atualizando role do usuário:', userId, 'para', newRole);

    const userRef = doc(db, 'users', userId);
    
    // Verificar se o usuário existe
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      throw new Error('Usuário não encontrado');
    }

    // Não permitir alterar o role do owner
    const userData = userDoc.data();
    if (userData.role === 'dono_da_loja' || userData.role === 'store_owner') {
      throw new Error('Não é possível alterar as permissões do proprietário');
    }

    await updateDoc(userRef, {
      role: mapTeamRoleToFirebaseRole(newRole),
      updatedAt: Timestamp.now(),
    });

    console.log('✅ Role atualizado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao atualizar role:', error);
    throw error;
  }
}

/**
 * Atualiza o status de um membro da equipe
 */
export async function updateMemberStatus(
  userId: string,
  status: TeamMember['status']
): Promise<void> {
  try {
    console.log('🔄 Atualizando status do usuário:', userId, 'para', status);

    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      status: status,
      updatedAt: Timestamp.now(),
    });

    console.log('✅ Status atualizado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao atualizar status:', error);
    throw error;
  }
}

/**
 * Remove um membro da equipe
 */
export async function removeTeamMember(userId: string): Promise<void> {
  try {
    console.log('🗑️ Removendo usuário:', userId);

    const userRef = doc(db, 'users', userId);
    
    // Verificar se o usuário existe
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      throw new Error('Usuário não encontrado');
    }

    // Não permitir remover o owner
    const userData = userDoc.data();
    if (userData.role === 'dono_da_loja' || userData.role === 'store_owner') {
      throw new Error('Não é possível remover o proprietário da loja');
    }

    // Ao invés de deletar, marcar como inativo
    await updateDoc(userRef, {
      status: 'suspended',
      storeId: null, // Remove o vínculo com a loja
      updatedAt: Timestamp.now(),
    });

    console.log('✅ Usuário removido com sucesso');
  } catch (error) {
    console.error('❌ Erro ao remover usuário:', error);
    throw error;
  }
}

/**
 * Busca convites pendentes de uma loja
 */
export async function getPendingInvites(storeId: string) {
  try {
    const invitesRef = collection(db, 'team_invites');
    const q = query(
      invitesRef,
      where('storeId', '==', storeId),
      where('status', '==', 'pending')
      // orderBy removido temporariamente - ordenação será feita no código
    );

    const snapshot = await getDocs(q);
    const invites: any[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      invites.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        expiresAt: data.expiresAt?.toDate(),
      });
    });

    // Ordenar por data de criação (mais recente primeiro)
    invites.sort((a, b) => {
      const dateA = a.createdAt?.getTime() || 0;
      const dateB = b.createdAt?.getTime() || 0;
      return dateB - dateA;
    });

    return invites;
  } catch (error) {
    console.error('❌ Erro ao buscar convites:', error);
    throw error;
  }
}

/**
 * Cancela um convite pendente
 */
export async function cancelInvite(inviteId: string): Promise<void> {
  try {
    const inviteRef = doc(db, 'team_invites', inviteId);
    await updateDoc(inviteRef, {
      status: 'cancelled',
      updatedAt: Timestamp.now(),
    });

    console.log('✅ Convite cancelado');
  } catch (error) {
    console.error('❌ Erro ao cancelar convite:', error);
    throw error;
  }
}

/**
 * Reenvia um convite
 */
export async function resendInvite(inviteId: string): Promise<void> {
  try {
    const inviteRef = doc(db, 'team_invites', inviteId);
    
    await updateDoc(inviteRef, {
      updatedAt: Timestamp.now(),
      expiresAt: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
    });

    // TODO: Reenviar email (implementar com Cloud Functions)
    
    console.log('✅ Convite reenviado');
  } catch (error) {
    console.error('❌ Erro ao reenviar convite:', error);
    throw error;
  }
}

