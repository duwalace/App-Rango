import { useState, useEffect } from 'react';

/**
 * Hook para debounce de valores
 * Aguarda um delay antes de atualizar o valor
 * 
 * @param value - Valor a ser debounced
 * @param delay - Tempo de delay em millisegundos
 * @returns Valor debounced
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Criar timer para atualizar após o delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpar timer se value mudar antes do delay
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
} 