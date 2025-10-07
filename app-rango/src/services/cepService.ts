/**
 * Serviço de busca de CEP
 * Utiliza a API ViaCEP para buscar informações de endereço
 */

export interface CepData {
  cep: string;
  logradouro: string; // rua
  complemento: string;
  bairro: string;
  localidade: string; // cidade
  uf: string; // estado
  erro?: boolean;
}

/**
 * Busca informações de endereço pelo CEP
 * @param cep CEP a ser buscado (com ou sem formatação)
 * @returns Dados do endereço ou null se não encontrado
 */
export const buscarCEP = async (cep: string): Promise<CepData | null> => {
  try {
    // Remove formatação do CEP
    const cleanCep = cep.replace(/[^\d]/g, '');

    // Valida se tem 8 dígitos
    if (cleanCep.length !== 8) {
      console.log('❌ CEP inválido:', cleanCep);
      return null;
    }

    console.log('🔍 Buscando CEP:', cleanCep);

    // Faz a requisição para a API ViaCEP
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    
    if (!response.ok) {
      console.log('❌ Erro na resposta da API:', response.status);
      return null;
    }

    const data: CepData = await response.json();

    // Verifica se o CEP foi encontrado
    if (data.erro) {
      console.log('❌ CEP não encontrado:', cleanCep);
      return null;
    }

    console.log('✅ CEP encontrado:', data);
    return data;
  } catch (error) {
    console.error('❌ Erro ao buscar CEP:', error);
    return null;
  }
};

/**
 * Valida se o CEP existe
 * @param cep CEP a ser validado
 * @returns true se o CEP existe, false caso contrário
 */
export const validarCEP = async (cep: string): Promise<boolean> => {
  const data = await buscarCEP(cep);
  return data !== null && !data.erro;
};

