/**
 * SERVIÇO DE LOCALIZAÇÃO
 * 
 * Gerencia tracking de GPS em background e atualização no Firestore
 */

import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { updateDeliveryLocation, updateOperationalStatus } from './deliveryOfferService';

const LOCATION_TASK_NAME = 'background-location-task';
const UPDATE_INTERVAL = 10000; // 10 segundos

// Variáveis globais para o task
let currentPartnerId: string | null = null;
let currentOrderId: string | null = null;

/**
 * Definir task de background para localização
 */
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('❌ Erro no task de localização:', error);
    return;
  }

  if (data) {
    const { locations } = data as any;
    
    if (locations && locations.length > 0) {
      const location = locations[0];
      const { latitude, longitude } = location.coords;

      console.log('📍 Nova localização:', { latitude, longitude });

      try {
        // Atualizar localização na entrega ativa
        if (currentOrderId) {
          await updateDeliveryLocation(currentOrderId, latitude, longitude);
          console.log(`✅ Localização atualizada no pedido: ${currentOrderId}`);
        }

        // Atualizar localização no perfil do entregador
        if (currentPartnerId) {
          await updateOperationalStatus(
            currentPartnerId,
            'on_delivery',
            { latitude, longitude }
          );
        }
      } catch (error) {
        console.error('❌ Erro ao atualizar localização:', error);
      }
    }
  }
});

/**
 * Verificar se task de background está registrado
 */
export const isLocationTaskDefined = async (): Promise<boolean> => {
  const isTaskDefined = await TaskManager.isTaskDefined(LOCATION_TASK_NAME);
  return isTaskDefined;
};

/**
 * Solicitar permissões de localização
 */
export const requestLocationPermissions = async (): Promise<{
  foreground: boolean;
  background: boolean;
}> => {
  try {
    // Permissão de foreground
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    
    if (foregroundStatus !== 'granted') {
      console.warn('⚠️ Permissão de localização em foreground negada');
      return { foreground: false, background: false };
    }

    // Permissão de background
    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    
    if (backgroundStatus !== 'granted') {
      console.warn('⚠️ Permissão de localização em background negada');
      return { foreground: true, background: false };
    }

    console.log('✅ Permissões de localização concedidas');
    return { foreground: true, background: true };
  } catch (error) {
    console.error('❌ Erro ao solicitar permissões:', error);
    return { foreground: false, background: false };
  }
};

/**
 * Iniciar tracking de localização em background
 */
export const startLocationTracking = async (
  partnerId: string,
  orderId: string
): Promise<boolean> => {
  try {
    // Verificar permissões
    const permissions = await requestLocationPermissions();
    
    if (!permissions.foreground || !permissions.background) {
      console.error('❌ Permissões insuficientes para tracking');
      return false;
    }

    // Definir variáveis globais para o task
    currentPartnerId = partnerId;
    currentOrderId = orderId;

    // Iniciar location updates
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: UPDATE_INTERVAL,
      distanceInterval: 50, // Atualizar a cada 50 metros
      foregroundService: {
        notificationTitle: 'Entrega em andamento',
        notificationBody: 'Rastreando sua localização para a entrega',
        notificationColor: '#FF6B35',
      },
      pausesUpdatesAutomatically: false,
      showsBackgroundLocationIndicator: true,
    });

    console.log(`✅ Tracking iniciado para entregador ${partnerId} no pedido ${orderId}`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao iniciar tracking:', error);
    return false;
  }
};

/**
 * Parar tracking de localização
 */
export const stopLocationTracking = async (): Promise<void> => {
  try {
    const isTracking = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
    
    if (isTracking) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      console.log('✅ Tracking de localização parado');
    }

    // Limpar variáveis globais
    currentPartnerId = null;
    currentOrderId = null;
  } catch (error) {
    console.error('❌ Erro ao parar tracking:', error);
  }
};

/**
 * Verificar se tracking está ativo
 */
export const isLocationTrackingActive = async (): Promise<boolean> => {
  try {
    return await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
  } catch (error) {
    console.error('❌ Erro ao verificar tracking:', error);
    return false;
  }
};

/**
 * Obter localização atual (one-time)
 */
export const getCurrentLocation = async (): Promise<{
  latitude: number;
  longitude: number;
} | null> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      console.warn('⚠️ Permissão de localização negada');
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error('❌ Erro ao obter localização:', error);
    return null;
  }
};

/**
 * Atualizar localização manualmente (quando não em tracking)
 */
export const updateCurrentLocation = async (
  partnerId: string,
  status: 'offline' | 'online_idle' | 'on_delivery' | 'unavailable' = 'online_idle'
): Promise<void> => {
  try {
    const location = await getCurrentLocation();
    
    if (location) {
      await updateOperationalStatus(partnerId, status, location);
      console.log(`✅ Localização atualizada manualmente: ${status}`);
    }
  } catch (error) {
    console.error('❌ Erro ao atualizar localização:', error);
  }
};

/**
 * Calcular distância entre dois pontos (Haversine)
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Raio da Terra em km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
};

const toRad = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Formatar distância para exibição
 */
export const formatDistance = (km: number): string => {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)}km`;
};

/**
 * Watchear localização em foreground (para tela de entrega)
 */
export const watchLocation = (
  callback: (location: { latitude: number; longitude: number }) => void
): () => void => {
  let subscription: Location.LocationSubscription | null = null;

  const startWatching = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      console.warn('⚠️ Permissão de localização negada');
      return;
    }

    subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000, // 5 segundos
        distanceInterval: 10, // 10 metros
      },
      (location) => {
        callback({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    );
  };

  startWatching();

  // Retornar função de cleanup
  return () => {
    if (subscription) {
      subscription.remove();
    }
  };
};

/**
 * Verificar se o entregador está próximo do destino
 */
export const isNearDestination = (
  currentLat: number,
  currentLon: number,
  destLat: number,
  destLon: number,
  thresholdMeters: number = 100
): boolean => {
  const distanceKm = calculateDistance(currentLat, currentLon, destLat, destLon);
  const distanceMeters = distanceKm * 1000;
  
  return distanceMeters <= thresholdMeters;
};

