// Script simples para criar usuário entregador
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA-qPqdBBchmdFcqV4yjTn2ZM3LUO8OobI",
  authDomain: "apprango-81562.firebaseapp.com",
  projectId: "apprango-81562",
  storageBucket: "apprango-81562.firebasestorage.app",
  messagingSenderId: "50042762219",
  appId: "1:50042762219:web:d873994104609ecbcc5fae",
  measurementId: "G-KFTWJPB3KE"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Função para criar usuário entregador
async function createDeliveryUser() {
  try {
    console.log('🔥 Criando usuário entregador...');
    
    // Criar usuário no Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      'carlos.entregador@teste.com', 
      'teste123'
    );
    
    const user = userCredential.user;
    
    // Salvar dados no Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      nome: 'Carlos Entregador Silva',
      email: user.email,
      role: 'entregador',
      criadoEm: new Date()
    });
    
    console.log('✅ USUÁRIO CRIADO COM SUCESSO!');
    console.log('📧 Email: carlos.entregador@teste.com');
    console.log('🔑 Senha: teste123');
    console.log('👤 Role: entregador');
    console.log('🆔 UID:', user.uid);
    console.log('\n💡 Agora você pode fazer login no app!');
    
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('💡 Usuário já existe! Dados para login:');
      console.log('📧 Email: carlos.entregador@teste.com');
      console.log('🔑 Senha: teste123');
    } else {
      console.error('❌ Erro:', error.message);
    }
  }
}

// Executar
createDeliveryUser();