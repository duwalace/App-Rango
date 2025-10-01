import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const testFirebaseConnection = async () => {
  try {
    console.log('🔍 Testando conexão com Firebase...');
    
    // Teste 1: Verificar se o auth está funcionando
    console.log('✅ Firebase Auth inicializado:', !!auth);
    console.log('✅ Firebase Firestore inicializado:', !!db);
    
    // Teste 2: Tentar criar um usuário de teste
    const testEmail = 'teste@exemplo.com';
    const testPassword = '123456';
    
    try {
      // Tentar criar usuário (pode falhar se já existir)
      const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
      console.log('✅ Usuário de teste criado:', userCredential.user.email);
      
      // Criar documento de teste no Firestore
      await setDoc(doc(db, 'test', 'connection'), {
        message: 'Conexão funcionando!',
        timestamp: new Date()
      });
      console.log('✅ Documento de teste criado no Firestore');
      
      // Ler documento de teste
      const docSnap = await getDoc(doc(db, 'test', 'connection'));
      if (docSnap.exists()) {
        console.log('✅ Documento lido do Firestore:', docSnap.data());
      }
      
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        console.log('⚠️ Usuário de teste já existe, tentando fazer login...');
        
        // Tentar fazer login com usuário existente
        const loginResult = await signInWithEmailAndPassword(auth, testEmail, testPassword);
        console.log('✅ Login realizado com sucesso:', loginResult.user.email);
      } else {
        throw error;
      }
    }
    
    console.log('🎉 Firebase está funcionando corretamente!');
    return true;
    
  } catch (error: any) {
    console.error('❌ Erro ao testar Firebase:', error);
    console.error('Código do erro:', error.code);
    console.error('Mensagem:', error.message);
    return false;
  }
};
