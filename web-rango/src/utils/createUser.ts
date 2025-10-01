import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export const createStoreOwner = async (email: string, password: string, storeId: string, storeName: string) => {
  try {
    // Criar usuário no Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Atualizar perfil do usuário
    await updateProfile(user, {
      displayName: storeName
    });

    // Criar documento do usuário no Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: email,
      role: 'store_owner',
      storeId: storeId,
      storeName: storeName,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('✅ Usuário criado com sucesso!');
    console.log('📧 Email:', email);
    console.log('🔑 Senha:', password);
    console.log('🏪 ID da Loja:', storeId);
    
    return user;
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
    throw error;
  }
};
