/**
 * FIRESTORE HELPERS
 * 
 * Utilitários para trabalhar com Firestore
 */

/**
 * Remove campos com valor undefined de um objeto
 * Firestore não aceita valores undefined, apenas null
 * 
 * @param obj - Objeto a ser limpo
 * @returns Objeto sem campos undefined
 */
export const removeUndefinedFields = <T extends Record<string, any>>(obj: T): Partial<T> => {
  const cleaned: any = {};
  
  for (const key in obj) {
    if (obj[key] !== undefined) {
      // Se for um objeto, aplicar recursivamente
      if (obj[key] !== null && typeof obj[key] === 'object' && !Array.isArray(obj[key]) && !(obj[key] instanceof Date)) {
        cleaned[key] = removeUndefinedFields(obj[key]);
      } else {
        cleaned[key] = obj[key];
      }
    }
  }
  
  return cleaned;
};

/**
 * Converte undefined para null em campos opcionais
 * Útil quando você quer manter o campo mas com valor null
 * 
 * @param obj - Objeto a ser processado
 * @returns Objeto com undefined convertido para null
 */
export const undefinedToNull = <T extends Record<string, any>>(obj: T): T => {
  const processed: any = {};
  
  for (const key in obj) {
    if (obj[key] === undefined) {
      processed[key] = null;
    } else if (obj[key] !== null && typeof obj[key] === 'object' && !Array.isArray(obj[key]) && !(obj[key] instanceof Date)) {
      // Se for um objeto, aplicar recursivamente
      processed[key] = undefinedToNull(obj[key]);
    } else {
      processed[key] = obj[key];
    }
  }
  
  return processed;
};

