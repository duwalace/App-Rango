// Script para criar usuários de teste
// Execute este código uma vez para criar os usuários de teste

import { signUp } from '../services/authService';

// Função para criar usuário entregador de teste
export const createTestDeliveryUser = async () => {
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
  } catch (error) {
    console.error('❌ Erro ao criar usuário entregador:', error);
    throw error;
  }
};

// Função para criar usuário cliente de teste
export const createTestClientUser = async () => {
  try {
    const result = await signUp(
      'Maria Cliente Santos', // nome
      'maria.cliente@teste.com', // email
      'teste123', // senha
      'cliente' // role
    );
    
    console.log('✅ Usuário cliente criado com sucesso!');
    console.log('📧 Email:', 'maria.cliente@teste.com');
    console.log('🔑 Senha:', 'teste123');
    console.log('👤 Role:', 'cliente');
    console.log('🆔 UID:', result.user.uid);
    
    return result;
  } catch (error) {
    console.error('❌ Erro ao criar usuário cliente:', error);
    throw error;
  }
};

// Função para criar todos os usuários de teste
export const createAllTestUsers = async () => {
  console.log('🚀 Iniciando criação de usuários de teste...');
  
  try {
    console.log('\n📦 Criando usuário entregador...');
    await createTestDeliveryUser();
    
    console.log('\n📦 Criando usuário cliente...');
    await createTestClientUser();
    
    console.log('\n🎉 Todos os usuários de teste foram criados com sucesso!');
    console.log('\n📋 RESUMO DOS USUÁRIOS CRIADOS:');
    console.log('┌─────────────────────────────────────────────────────┐');
    console.log('│ ENTREGADOR:                                         │');
    console.log('│ Email: carlos.entregador@teste.com                  │');
    console.log('│ Senha: teste123                                     │');
    console.log('├─────────────────────────────────────────────────────┤');
    console.log('│ CLIENTE:                                            │');
    console.log('│ Email: maria.cliente@teste.com                     │');
    console.log('│ Senha: teste123                                     │');
    console.log('└─────────────────────────────────────────────────────┘');
    
  } catch (error) {
    console.error('❌ Erro ao criar usuários de teste:', error);
  }
};

// Para usar, descomente uma das linhas abaixo:
// createTestDeliveryUser();
// createTestClientUser();
// createAllTestUsers();