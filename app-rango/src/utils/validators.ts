/**
 * Funções de validação e formatação
 */

/**
 * Valida CPF
 */
export const isValidCPF = (cpf: string): boolean => {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/[^\d]/g, '');

  if (cpf.length !== 11) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cpf)) return false;

  // Valida primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit > 9) digit = 0;
  if (digit !== parseInt(cpf.charAt(9))) return false;

  // Valida segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit > 9) digit = 0;
  if (digit !== parseInt(cpf.charAt(10))) return false;

  return true;
};

/**
 * Formata CPF (000.000.000-00)
 */
export const formatCPF = (cpf: string): string => {
  cpf = cpf.replace(/[^\d]/g, '');
  
  if (cpf.length <= 3) return cpf;
  if (cpf.length <= 6) return `${cpf.slice(0, 3)}.${cpf.slice(3)}`;
  if (cpf.length <= 9) return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6)}`;
  
  return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9, 11)}`;
};

/**
 * Formata telefone ((00) 00000-0000)
 */
export const formatPhone = (phone: string): string => {
  phone = phone.replace(/[^\d]/g, '');
  
  if (phone.length <= 2) return phone;
  if (phone.length <= 7) return `(${phone.slice(0, 2)}) ${phone.slice(2)}`;
  if (phone.length <= 11) {
    return `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7, 11)}`;
  }
  
  return `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7, 11)}`;
};

/**
 * Formata CEP (00000-000)
 */
export const formatCEP = (cep: string): string => {
  cep = cep.replace(/[^\d]/g, '');
  
  if (cep.length <= 5) return cep;
  
  return `${cep.slice(0, 5)}-${cep.slice(5, 8)}`;
};

/**
 * Formata placa de veículo (ABC-1234 ou ABC1D23)
 */
export const formatPlate = (plate: string): string => {
  plate = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
  
  if (plate.length <= 3) return plate;
  
  // Placa padrão antigo (ABC-1234)
  if (plate.length <= 7 && /^[A-Z]{3}[0-9]/.test(plate)) {
    return `${plate.slice(0, 3)}-${plate.slice(3, 7)}`;
  }
  
  // Placa Mercosul (ABC1D23)
  if (plate.length <= 7) {
    return plate;
  }
  
  return plate.slice(0, 7);
};

/**
 * Formata data (DD/MM/AAAA)
 */
export const formatDate = (date: string): string => {
  date = date.replace(/[^\d]/g, '');
  
  if (date.length <= 2) return date;
  if (date.length <= 4) return `${date.slice(0, 2)}/${date.slice(2)}`;
  
  return `${date.slice(0, 2)}/${date.slice(2, 4)}/${date.slice(4, 8)}`;
};

/**
 * Valida email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida telefone (deve ter 10 ou 11 dígitos)
 */
export const isValidPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/[^\d]/g, '');
  return cleaned.length === 10 || cleaned.length === 11;
};

/**
 * Valida CEP (deve ter 8 dígitos)
 */
export const isValidCEP = (cep: string): boolean => {
  const cleaned = cep.replace(/[^\d]/g, '');
  return cleaned.length === 8;
};

/**
 * Valida data no formato DD/MM/AAAA
 */
export const isValidDate = (date: string): boolean => {
  const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = date.match(regex);
  
  if (!match) return false;
  
  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);
  
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  
  // Verificar dias válidos por mês
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day > daysInMonth) return false;
  
  return true;
};

/**
 * Converte data DD/MM/AAAA para Date
 */
export const parseDate = (dateString: string): Date | null => {
  const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = dateString.match(regex);
  
  if (!match) return null;
  
  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1; // Mês começa em 0
  const year = parseInt(match[3], 10);
  
  return new Date(year, month, day);
};

/**
 * Valida CNH (11 dígitos)
 */
export const isValidCNH = (cnh: string): boolean => {
  const cleaned = cnh.replace(/[^\d]/g, '');
  
  if (cleaned.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cleaned)) return false;
  
  return true;
};

/**
 * Formata CNH
 */
export const formatCNH = (cnh: string): string => {
  return cnh.replace(/[^\d]/g, '').slice(0, 11);
};

/**
 * Formata RG
 */
export const formatRG = (rg: string): string => {
  rg = rg.replace(/[^\d]/g, '');
  
  if (rg.length <= 2) return rg;
  if (rg.length <= 5) return `${rg.slice(0, 2)}.${rg.slice(2)}`;
  if (rg.length <= 8) return `${rg.slice(0, 2)}.${rg.slice(2, 5)}.${rg.slice(5)}`;
  
  return `${rg.slice(0, 2)}.${rg.slice(2, 5)}.${rg.slice(5, 8)}-${rg.slice(8, 9)}`;
};

/**
 * Remove formatação (mantém apenas números)
 */
export const onlyNumbers = (value: string): string => {
  return value.replace(/[^\d]/g, '');
};

/**
 * Remove formatação (mantém apenas letras e números)
 */
export const onlyAlphanumeric = (value: string): string => {
  return value.replace(/[^a-zA-Z0-9]/g, '');
};

