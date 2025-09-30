// Script temporário para criar usuário entregador de teste
// Execute este código uma vez para criar o usuário de teste

import { signUp } from '../services/authService';

export const createTestDeliveryUser = async () => {
  try {
    const result = await signUp(
      'João Entregador', // nome
      'joao.entregador@teste.com', // email
      '123456', // senha
      'entregador' // role
    );
    
    console.log('Usuário entregador criado com sucesso:', result);
    return result;
  } catch (error) {
    console.error('Erro ao criar usuário entregador:', error);
    throw error;
  }
};

// Para usar, chame esta função em algum lugar do seu app temporariamente
// createTestDeliveryUser();