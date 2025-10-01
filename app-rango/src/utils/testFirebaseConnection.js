// Script para testar conexão com Firebase
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');
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

// Função para criar usuário de teste
async function createTestUser() {
  try {
    console.log('🔥 Criando usuário de teste...');
    
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      'teste@exemplo.com', 
      '123456'
    );
    
    const user = userCredential.user;
    
    // Salvar dados no Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      nome: 'Usuário Teste',
      email: user.email,
      role: 'cliente',
      criadoEm: new Date()
    });
    
    console.log('✅ USUÁRIO CRIADO COM SUCESSO!');
    console.log('📧 Email: teste@exemplo.com');
    console.log('🔑 Senha: 123456');
    console.log('🆔 UID:', user.uid);
    
    return true;
    
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('ℹ️ Usuário já existe, continuando com o teste...');
      return true;
    } else {
      console.error('❌ ERRO AO CRIAR USUÁRIO:');
      console.error('Código:', error.code);
      console.error('Mensagem:', error.message);
      return false;
    }
  }
}

// Função para testar login
async function testLogin() {
  try {
    console.log('\n🔐 Testando login...');
    
    const userCredential = await signInWithEmailAndPassword(
      auth, 
      'teste@exemplo.com',
      '123456'
    );
    
    console.log('✅ LOGIN REALIZADO COM SUCESSO!');
    console.log('👤 Usuário:', userCredential.user.email);
    console.log('🆔 UID:', userCredential.user.uid);
    
    return true;
    
  } catch (error) {
    console.error('❌ ERRO NO LOGIN:');
    console.error('Código:', error.code);
    console.error('Mensagem:', error.message);
    return false;
  }
}

// Função principal
async function runTest() {
  console.log('🚀 INICIANDO TESTE DO FIREBASE\n');
  console.log('📡 Project ID:', firebaseConfig.projectId);
  console.log('🔑 API Key:', firebaseConfig.apiKey.substring(0, 10) + '...\n');
  
  // Primeiro, tentar criar o usuário
  const userCreated = await createTestUser();
  
  if (userCreated) {
    // Depois, testar o login
    const loginSuccess = await testLogin();
    
    if (loginSuccess) {
      console.log('\n🎉 FIREBASE ESTÁ FUNCIONANDO PERFEITAMENTE!');
      console.log('💡 Agora você pode usar o app normalmente.');
    }
  }
}

// Executar teste
runTest();