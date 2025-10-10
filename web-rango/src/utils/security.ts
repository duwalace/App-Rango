// Utilitários de Segurança

/**
 * Criar hash SHA-256 de um CPF
 * @param cpf CPF limpo (apenas números)
 * @returns Hash SHA-256
 */
export const hashCPF = async (cpf: string): Promise<string> => {
  // Remover qualquer formatação
  const cleanCPF = cpf.replace(/\D/g, '');
  
  // Converter string para ArrayBuffer
  const encoder = new TextEncoder();
  const data = encoder.encode(cleanCPF);
  
  // Gerar hash SHA-256 usando Web Crypto API
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  // Converter para hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
};

/**
 * Validar CPF (algoritmo oficial)
 * @param cpf CPF com ou sem formatação
 * @returns true se válido
 */
export const validateCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/\D/g, '');
  
  if (cleanCPF.length !== 11) return false;
  
  // CPFs conhecidos inválidos
  const invalidCPFs = [
    '00000000000',
    '11111111111',
    '22222222222',
    '33333333333',
    '44444444444',
    '55555555555',
    '66666666666',
    '77777777777',
    '88888888888',
    '99999999999'
  ];
  
  if (invalidCPFs.includes(cleanCPF)) return false;
  
  // Validar dígitos verificadores
  let sum = 0;
  let remainder;
  
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;
  
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;
  
  return true;
};

/**
 * Formatar CPF (123.456.789-00)
 */
export const formatCPF = (cpf: string): string => {
  const cleanCPF = cpf.replace(/\D/g, '');
  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

/**
 * Limpar formatação de CPF (apenas números)
 */
export const cleanCPF = (cpf: string): string => {
  return cpf.replace(/\D/g, '');
};

/**
 * Mascarar CPF para exibição (***.***.789-00)
 */
export const maskCPF = (cpf: string): string => {
  const cleanCPF = cpf.replace(/\D/g, '');
  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '***.***.$3-$4');
};

/**
 * Validar telefone brasileiro
 */
export const validatePhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Deve ter 10 ou 11 dígitos (com DDD)
  if (cleanPhone.length < 10 || cleanPhone.length > 11) return false;
  
  // Validar DDD (11 a 99)
  const ddd = parseInt(cleanPhone.substring(0, 2));
  if (ddd < 11 || ddd > 99) return false;
  
  return true;
};

/**
 * Formatar telefone ((11) 98765-4321)
 */
export const formatPhone = (phone: string): string => {
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (cleanPhone.length === 11) {
    return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (cleanPhone.length === 10) {
    return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return phone;
};

/**
 * Validar placa de veículo (formatos antigo e Mercosul)
 */
export const validateLicensePlate = (plate: string): boolean => {
  const cleanPlate = plate.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  
  // Formato antigo: ABC1234
  const oldFormat = /^[A-Z]{3}[0-9]{4}$/;
  // Formato Mercosul: ABC1D23
  const newFormat = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;
  
  return oldFormat.test(cleanPlate) || newFormat.test(cleanPlate);
};

/**
 * Formatar placa (ABC-1234 ou ABC-1D23)
 */
export const formatLicensePlate = (plate: string): string => {
  const cleanPlate = plate.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  
  if (cleanPlate.length === 7) {
    return cleanPlate.replace(/([A-Z]{3})([0-9A-Z]{4})/, '$1-$2');
  }
  
  return plate;
};

/**
 * Gerar código de confirmação de 4 dígitos
 */
export const generateConfirmationCode = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

/**
 * Ofuscar dados sensíveis para logs
 */
export const obfuscate = (data: string, showLast: number = 4): string => {
  if (data.length <= showLast) return data;
  
  const hidden = '*'.repeat(data.length - showLast);
  const visible = data.slice(-showLast);
  
  return hidden + visible;
};

