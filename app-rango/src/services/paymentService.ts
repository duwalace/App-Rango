/**
 * SERVIÇO DE PAGAMENTO - ARQUITETURA DE SEGURANÇA CRÍTICA
 * 
 * ⚠️ IMPORTANTE: NÓS NÃO IREMOS, EM HIPÓTESE ALGUMA, ARMAZENAR OS DADOS 
 * COMPLETOS DO CARTÃO DE CRÉDITO EM NOSSO BANCO DE DADOS.
 * 
 * Iremos integrar com um gateway de pagamento seguro (como Stripe ou Mercado Pago)
 * que lida com a conformidade PCI-DSS.
 * 
 * FLUXO SEGURO:
 * 1. Usuário insere dados do cartão no app
 * 2. Dados são enviados DIRETAMENTE para o SDK do gateway (HTTPS/TLS)
 * 3. Gateway valida, tokeniza e armazena o cartão de forma segura
 * 4. Gateway retorna um TOKEN não-sensível
 * 5. Salvamos APENAS o token + últimos 4 dígitos + bandeira em nosso banco
 * 
 * Nunca transmitimos ou armazenamos:
 * - Número completo do cartão
 * - CVV
 * - Dados da tarja magnética
 */

import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { PaymentMethod } from '../types/profile';

const USERS_COLLECTION = 'users';
const PAYMENT_METHODS_SUBCOLLECTION = 'payment_methods';

/**
 * 🔒 SIMULAÇÃO DE INTEGRAÇÃO COM GATEWAY DE PAGAMENTO
 * 
 * Em produção, você usaria o SDK real do Stripe, Mercado Pago, etc.
 * Este é apenas um exemplo de como a integração funcionaria.
 * 
 * BIBLIOTECAS RECOMENDADAS:
 * - Stripe: @stripe/stripe-react-native
 * - Mercado Pago: react-native-mercadopago-px
 */
interface PaymentGatewayResponse {
  success: boolean;
  token: string;
  customerId?: string;
  last4: string;
  brand: 'visa' | 'mastercard' | 'amex' | 'elo' | 'other';
  error?: string;
}

/**
 * 🔒 FUNÇÃO SIMULADA: Tokenizar cartão no gateway de pagamento
 * 
 * Em produção, esta função:
 * 1. Usaria o SDK do gateway (ex: Stripe.createToken())
 * 2. Os dados do cartão NUNCA passariam pelo nosso servidor
 * 3. A comunicação seria criptografada (TLS 1.2+)
 */
export const tokenizeCard = async (
  cardData: {
    cardNumber: string;
    holderName: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
  }
): Promise<PaymentGatewayResponse> => {
  try {
    // ⚠️ SIMULAÇÃO - Em produção, use o SDK do gateway real
    console.log('🔒 Enviando dados do cartão para o gateway de pagamento...');
    console.log('⚠️ IMPORTANTE: Dados do cartão NUNCA devem ser logados em produção!');

    // Simular delay de rede
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Validação básica (o gateway faz validações muito mais robustas)
    const cleanCardNumber = cardData.cardNumber.replace(/\s/g, '');
    
    if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
      return {
        success: false,
        token: '',
        last4: '',
        brand: 'other',
        error: 'Número de cartão inválido',
      };
    }

    // Detectar bandeira (simulação simplificada)
    let brand: 'visa' | 'mastercard' | 'amex' | 'elo' | 'other' = 'other';
    const firstDigit = cleanCardNumber[0];
    const firstTwoDigits = cleanCardNumber.substring(0, 2);

    if (firstDigit === '4') brand = 'visa';
    else if (['51', '52', '53', '54', '55'].includes(firstTwoDigits)) brand = 'mastercard';
    else if (['34', '37'].includes(firstTwoDigits)) brand = 'amex';
    else if (['636368', '636369'].some(prefix => cleanCardNumber.startsWith(prefix))) brand = 'elo';

    // Extrair últimos 4 dígitos
    const last4 = cleanCardNumber.slice(-4);

    // Simular token gerado pelo gateway
    const mockToken = `tok_${Math.random().toString(36).substring(2, 15)}`;
    const mockCustomerId = `cus_${Math.random().toString(36).substring(2, 15)}`;

    console.log('✅ Cartão tokenizado com sucesso pelo gateway');
    console.log('Token recebido:', mockToken);

    return {
      success: true,
      token: mockToken,
      customerId: mockCustomerId,
      last4,
      brand,
    };

    // EM PRODUÇÃO, seria algo assim com Stripe:
    /*
    import { Stripe } from '@stripe/stripe-react-native';
    
    const { token, error } = await Stripe.createToken({
      number: cardData.cardNumber,
      exp_month: cardData.expiryMonth,
      exp_year: cardData.expiryYear,
      cvc: cardData.cvv,
    });

    if (error) {
      return {
        success: false,
        token: '',
        last4: '',
        brand: 'other',
        error: error.message,
      };
    }

    return {
      success: true,
      token: token.id,
      customerId: token.card.id,
      last4: token.card.last4,
      brand: token.card.brand,
    };
    */
  } catch (error: any) {
    console.error('❌ Erro ao tokenizar cartão:', error);
    return {
      success: false,
      token: '',
      last4: '',
      brand: 'other',
      error: 'Erro ao processar cartão. Tente novamente.',
    };
  }
};

/**
 * Listar métodos de pagamento salvos do usuário
 */
export const getPaymentMethods = async (userId: string): Promise<PaymentMethod[]> => {
  try {
    const paymentMethodsRef = collection(
      db,
      USERS_COLLECTION,
      userId,
      PAYMENT_METHODS_SUBCOLLECTION
    );

    const q = query(
      paymentMethodsRef,
      orderBy('isDefault', 'desc'),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId,
        type: data.type,
        brand: data.brand,
        last4: data.last4,
        holderName: data.holderName,
        expiryMonth: data.expiryMonth,
        expiryYear: data.expiryYear,
        isDefault: data.isDefault || false,
        paymentGatewayToken: data.paymentGatewayToken,
        paymentGatewayCustomerId: data.paymentGatewayCustomerId,
        createdAt: data.createdAt?.toDate() || new Date(),
      };
    });
  } catch (error) {
    console.error('Erro ao buscar métodos de pagamento:', error);
    throw new Error('Não foi possível carregar os métodos de pagamento');
  }
};

/**
 * Adicionar novo método de pagamento
 * 
 * FLUXO SEGURO:
 * 1. Dados do cartão são tokenizados pelo gateway
 * 2. Salvamos APENAS o token + metadados não-sensíveis
 */
export const addPaymentMethod = async (
  userId: string,
  cardData: {
    type: 'credit_card' | 'debit_card';
    holderName: string;
    expiryMonth: string;
    expiryYear: string;
  },
  gatewayResponse: PaymentGatewayResponse
): Promise<string> => {
  try {
    if (!gatewayResponse.success) {
      throw new Error(gatewayResponse.error || 'Erro ao processar cartão');
    }

    const paymentMethodsRef = collection(
      db,
      USERS_COLLECTION,
      userId,
      PAYMENT_METHODS_SUBCOLLECTION
    );

    // Se for o primeiro cartão ou marcado como padrão, definir como padrão
    const existingMethods = await getPaymentMethods(userId);
    const isDefault = existingMethods.length === 0;

    // Se for padrão, remover o padrão dos outros
    if (isDefault) {
      await removeDefaultFromOthers(userId);
    }

    // Salvar APENAS informações não-sensíveis
    const docRef = await addDoc(paymentMethodsRef, {
      type: cardData.type,
      brand: gatewayResponse.brand,
      last4: gatewayResponse.last4, // Apenas últimos 4 dígitos
      holderName: cardData.holderName,
      expiryMonth: cardData.expiryMonth,
      expiryYear: cardData.expiryYear,
      isDefault,
      // 🔒 APENAS o token do gateway (não-sensível)
      paymentGatewayToken: gatewayResponse.token,
      paymentGatewayCustomerId: gatewayResponse.customerId,
      createdAt: serverTimestamp(),
    });

    console.log('✅ Método de pagamento adicionado com segurança:', docRef.id);
    return docRef.id;
  } catch (error: any) {
    console.error('❌ Erro ao adicionar método de pagamento:', error);
    throw error;
  }
};

/**
 * Deletar método de pagamento
 * 
 * IMPORTANTE: Também deve deletar do gateway de pagamento
 */
export const deletePaymentMethod = async (
  userId: string,
  paymentMethodId: string
): Promise<void> => {
  try {
    const paymentMethodRef = doc(
      db,
      USERS_COLLECTION,
      userId,
      PAYMENT_METHODS_SUBCOLLECTION,
      paymentMethodId
    );

    // TODO: Deletar também do gateway de pagamento
    // await stripe.paymentMethods.detach(paymentMethod.paymentGatewayToken);

    await deleteDoc(paymentMethodRef);
    console.log('✅ Método de pagamento deletado:', paymentMethodId);
  } catch (error) {
    console.error('❌ Erro ao deletar método de pagamento:', error);
    throw new Error('Não foi possível deletar o método de pagamento');
  }
};

/**
 * Definir método de pagamento como padrão
 */
export const setDefaultPaymentMethod = async (
  userId: string,
  paymentMethodId: string
): Promise<void> => {
  try {
    await removeDefaultFromOthers(userId, paymentMethodId);

    const paymentMethodRef = doc(
      db,
      USERS_COLLECTION,
      userId,
      PAYMENT_METHODS_SUBCOLLECTION,
      paymentMethodId
    );

    await updateDoc(paymentMethodRef, {
      isDefault: true,
    });

    console.log('✅ Método de pagamento definido como padrão:', paymentMethodId);
  } catch (error) {
    console.error('❌ Erro ao definir método padrão:', error);
    throw new Error('Não foi possível definir o método padrão');
  }
};

/**
 * Remove a flag de padrão de todos os outros métodos
 */
const removeDefaultFromOthers = async (
  userId: string,
  exceptPaymentMethodId?: string
): Promise<void> => {
  try {
    const paymentMethodsRef = collection(
      db,
      USERS_COLLECTION,
      userId,
      PAYMENT_METHODS_SUBCOLLECTION
    );

    const q = query(paymentMethodsRef, where('isDefault', '==', true));
    const snapshot = await getDocs(q);

    const batch = writeBatch(db);

    snapshot.docs.forEach((doc) => {
      if (doc.id !== exceptPaymentMethodId) {
        batch.update(doc.ref, { isDefault: false });
      }
    });

    await batch.commit();
  } catch (error) {
    console.error('Erro ao remover padrão dos outros:', error);
  }
};

/**
 * Validar número de cartão (Algoritmo de Luhn)
 * Esta validação pode ser feita no cliente antes de enviar ao gateway
 */
export const validateCardNumber = (cardNumber: string): boolean => {
  const cleaned = cardNumber.replace(/\D/g, '');

  if (cleaned.length < 13 || cleaned.length > 19) {
    return false;
  }

  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

/**
 * Formatar número do cartão para exibição
 * 1234567890123456 -> 1234 5678 9012 3456
 */
export const formatCardNumber = (cardNumber: string): string => {
  const cleaned = cardNumber.replace(/\D/g, '');
  const groups = cleaned.match(/.{1,4}/g) || [];
  return groups.join(' ');
};

/**
 * Mascarar número do cartão para exibição
 * 1234567890123456 -> •••• •••• •••• 3456
 */
export const maskCardNumber = (cardNumber: string, last4: string): string => {
  return `•••• •••• •••• ${last4}`;
};

