// Arquivo para executar a criação de usuário de teste
// Execute este arquivo para criar o usuário entregador

import { signUp } from '../services/authService.js';

// Função para criar usuário entregador de teste
const createTestDeliveryUser = async () => {
  try {
    const result = await signUp(
      'Carlos Entregador Silva', // nome
      'carlos.entregador@teste.com', // email
      'teste123', // senha
      'entregador' // role
    );
    
    console.log('✅ Usuário entregador criado com sucesso!');
    console.log('📧 Email:', 'carlos.entregador@teste.com');
    console.log('🔑 Senha:', 'teste123');
    console.log('👤 Role:', 'entregador');
    console.log('🆔 UID:', result.user.uid);
    
    return result;
  } catch (error: any) {
    console.error('❌ Erro ao criar usuário entregador:', error);
    throw error;
  }
};

// Função principal para executar
const main = async () => {
  console.log('🔥 CRIANDO USUÁRIO ENTREGADOR DE TESTE...\n');
  
  try {
    await createTestDeliveryUser();
    
    console.log('\n✅ USUÁRIO CRIADO COM SUCESSO!');
    console.log('\n🎯 DADOS PARA LOGIN:');
    console.log('Email: carlos.entregador@teste.com');
    console.log('Senha: teste123');
    console.log('\n💡 Agora você pode fazer login com estes dados no app!');
    
  } catch (error: any) {
    console.error('\n❌ ERRO:', error.message);
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('\n💡 O usuário já existe! Você pode usar:');
      console.log('Email: carlos.entregador@teste.com');
      console.log('Senha: teste123');
    }
  }
};

// Executar a função
main();