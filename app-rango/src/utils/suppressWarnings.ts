/**
 * Supressor de Warnings do Expo Go
 * 
 * Este arquivo deve ser importado ANTES de qualquer outro import
 * para garantir que os warnings sejam suprimidos corretamente
 */

import Constants from 'expo-constants';
import { LogBox } from 'react-native';

// Verificar se está rodando no Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

if (isExpoGo) {
  // Suprimir warnings específicos do Expo Go
  LogBox.ignoreLogs([
    'expo-notifications',
    'Push notifications',
    'remote notifications',
    'RNMapsAirModule',
    'development build',
  ]);

  // Sobrescrever console.warn para filtrar warnings
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    const msg = args[0]?.toString() || '';
    
    // Lista de termos a ignorar
    const ignoreTerms = [
      'expo-notifications',
      'Push notifications',
      'remote notifications',
      'development build',
      'RNMapsAirModule',
      'Expo Go',
    ];
    
    // Verificar se deve ignorar
    const shouldIgnore = ignoreTerms.some(term => msg.includes(term));
    
    if (!shouldIgnore) {
      originalWarn.apply(console, args);
    }
  };

  // Sobrescrever console.error para filtrar erros relacionados
  const originalError = console.error;
  console.error = (...args: any[]) => {
    const msg = args[0]?.toString() || '';
    
    // Lista de termos a ignorar
    const ignoreTerms = [
      'expo-notifications',
      'Push notifications',
      'RNMapsAirModule',
    ];
    
    // Verificar se deve ignorar
    const shouldIgnore = ignoreTerms.some(term => msg.includes(term));
    
    if (!shouldIgnore) {
      originalError.apply(console, args);
    }
  };

  console.log('🔇 Warnings do Expo Go suprimidos');
}

export default {};

