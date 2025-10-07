// Tipos para a seção de perfil do usuário

export interface UserProfile {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  id: string;
  userId: string;
  label: string; // 'Casa', 'Trabalho', 'Outro'
  zipCode: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  reference?: string; // Ponto de referência
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AddressFormData {
  label: string;
  zipCode: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  reference?: string; // Ponto de referência
  isDefault: boolean;
}

// Dados que vêm da API ViaCEP
export interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

// IMPORTANTE: NÃO armazenamos dados completos do cartão!
// Apenas informações não-sensíveis fornecidas pelo gateway
export interface PaymentMethod {
  id: string;
  userId: string;
  type: 'credit_card' | 'debit_card';
  brand: 'visa' | 'mastercard' | 'amex' | 'elo' | 'other';
  last4: string; // Últimos 4 dígitos
  holderName: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
  // Token fornecido pelo gateway de pagamento
  paymentGatewayToken: string;
  // ID do cliente no gateway (ex: Stripe customer ID)
  paymentGatewayCustomerId?: string;
  createdAt: Date;
}

// Preferências de notificações
export interface NotificationPreferences {
  promotions: boolean; // Promoções e ofertas
  orderUpdates: boolean; // Atualizações sobre pedidos
  appNews: boolean; // Novidades do app
  pushEnabled: boolean; // Se as notificações push estão habilitadas no dispositivo
  updatedAt: Date;
}

// Dados do formulário de cartão (usado apenas temporariamente, nunca salvo)
export interface CardFormData {
  cardNumber: string;
  holderName: string;
  expiryDate: string; // MM/YY
  cvv: string;
}

