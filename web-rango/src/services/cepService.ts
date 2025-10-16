/**
 * Serviço para busca de endereço por CEP usando ViaCEP API
 */

export interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export interface AddressData {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

/**
 * Busca endereço por CEP na API ViaCEP
 * @param cep CEP com ou sem formatação (99999-999 ou 99999999)
 * @returns Dados do endereço ou null se não encontrado
 */
export const fetchAddressByCEP = async (cep: string): Promise<AddressData | null> => {
  try {
    // Remove caracteres não numéricos
    const cleanCEP = cep.replace(/\D/g, '');
    
    // Valida tamanho do CEP
    if (cleanCEP.length !== 8) {
      throw new Error('CEP inválido. Deve conter 8 dígitos.');
    }

    console.log('🔍 Buscando CEP:', cleanCEP);
    
    // Busca na API ViaCEP
    const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
    
    if (!response.ok) {
      throw new Error('Erro ao buscar CEP');
    }

    const data: ViaCEPResponse = await response.json();
    
    // Verifica se houve erro
    if (data.erro) {
      throw new Error('CEP não encontrado');
    }

    console.log('✅ Endereço encontrado:', data);

    return {
      street: data.logradouro,
      neighborhood: data.bairro,
      city: data.localidade,
      state: data.uf,
      zipCode: formatCEP(cleanCEP)
    };

  } catch (error: any) {
    console.error('❌ Erro ao buscar CEP:', error);
    throw error;
  }
};

/**
 * Formata CEP para o padrão 99999-999
 * @param cep CEP sem formatação
 * @returns CEP formatado
 */
export const formatCEP = (cep: string): string => {
  const cleanCEP = cep.replace(/\D/g, '');
  return cleanCEP.replace(/^(\d{5})(\d{3})$/, '$1-$2');
};

/**
 * Valida se o CEP está no formato correto
 * @param cep CEP a ser validado
 * @returns true se válido, false caso contrário
 */
export const isValidCEP = (cep: string): boolean => {
  const cleanCEP = cep.replace(/\D/g, '');
  return cleanCEP.length === 8;
};

