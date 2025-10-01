import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export const createStoreOwnerUser = async () => {
  try {
    const email = 'joao@pizzariadojoao.com';
    const password = '123456';
    
    console.log('🔐 Criando usuário no Firebase Auth...');
    
    // Criar usuário no Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('✅ Usuário criado no Auth:', user.email);
    
    // Atualizar perfil
    await updateProfile(user, {
      displayName: 'João - Pizzaria do João'
    });
    
    console.log('✅ Perfil atualizado');
    
    // Criar documento no Firestore
    const userData = {
      email: email,
      role: 'store_owner',
      storeId: 'store-joao-123', // ID temporário
      storeName: 'Pizzaria do João',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await setDoc(doc(db, 'users', user.uid), userData);
    console.log('✅ Documento criado no Firestore');
    
    console.log('🎉 Usuário criado com sucesso!');
    console.log('📧 Email:', email);
    console.log('🔑 Senha:', password);
    console.log('🆔 UID:', user.uid);
    
    return {
      uid: user.uid,
      email: email,
      password: password
    };
    
  } catch (error: any) {
    console.error('❌ Erro ao criar usuário:', error);
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('⚠️ Usuário já existe!');
      console.log('📧 Email: joao@pizzariadojoao.com');
      console.log('🔑 Use a senha que você definiu anteriormente');
    } else {
      console.error('Código do erro:', error.code);
      console.error('Mensagem:', error.message);
    }
    
    throw error;
  }
};
