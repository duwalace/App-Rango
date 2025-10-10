/**
 * SERVIÇO DE NOTIFICAÇÕES
 * 
 * Gerencia notificações push com Expo Notifications
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

// Verificar se está rodando no Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

// Helper para logs condicionais (apenas em Development/Production builds)
const log = (message: string, ...args: any[]) => {
  if (!isExpoGo) {
    console.log(message, ...args);
  }
};

const logError = (message: string, ...args: any[]) => {
  if (!isExpoGo) {
    console.error(message, ...args);
  }
};

const logWarn = (message: string, ...args: any[]) => {
  if (!isExpoGo) {
    console.warn(message, ...args);
  }
};

// Configurar handler de notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Solicitar permissões de notificação
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    if (!Device.isDevice) {
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    log('✅ Permissão de notificação concedida');
    return true;
  } catch (error) {
    logError('❌ Erro ao solicitar permissões:', error);
    return false;
  }
};

/**
 * Obter token de push notification
 */
export const getPushToken = async (): Promise<string | null> => {
  // Push notifications remotas não funcionam no Expo Go (SDK 53+)
  // Retornar null imediatamente para evitar qualquer tentativa
  if (isExpoGo) {
    return null;
  }

  try {
    if (!Device.isDevice) {
      return null;
    }

    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    // Apenas tentar obter token se NÃO estiver no Expo Go
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId || 'your-project-id',
    });

    log('✅ Push token obtido:', token.data);
    return token.data;
  } catch (error) {
    logError('❌ Erro ao obter push token:', error);
    return null;
  }
};

/**
 * Registrar token no Firestore (delivery_partners)
 */
export const registerPushToken = async (partnerId: string): Promise<void> => {
  try {
    const token = await getPushToken();
    
    if (!token) {
      logWarn('⚠️ Token não disponível');
      return;
    }

    await updateDoc(doc(db, 'delivery_partners', partnerId), {
      push_token: token,
      push_token_updated_at: new Date(),
    });

    log(`✅ Push token registrado para ${partnerId}`);
  } catch (error) {
    logError('❌ Erro ao registrar push token:', error);
  }
};

/**
 * Configurar canais de notificação (Android)
 */
export const setupNotificationChannels = async (): Promise<void> => {
  // Não configurar canais no Expo Go para evitar warnings
  if (isExpoGo || Platform.OS !== 'android') {
    return;
  }

  try {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF6B35',
    });

    await Notifications.setNotificationChannelAsync('new-offer', {
      name: 'Novas Ofertas',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 500, 200, 500],
      lightColor: '#FF6B35',
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync('delivery', {
      name: 'Entregas',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250],
      lightColor: '#4CAF50',
    });

    log('✅ Canais de notificação configurados (Android)');
  } catch (error) {
    logError('❌ Erro ao configurar canais:', error);
  }
};

/**
 * Notificação local - Nova oferta disponível
 */
export const notifyNewOffer = async (offer: {
  store_name: string;
  partner_earning: number;
  distance_km: number;
}): Promise<void> => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔥 Nova Entrega Disponível!',
        body: `${offer.store_name} • R$ ${offer.partner_earning.toFixed(2)} • ${offer.distance_km.toFixed(1)}km`,
        data: { type: 'new_offer' },
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
        vibrate: [0, 500, 200, 500],
      },
      trigger: null, // Imediato
    });

    log('✅ Notificação de nova oferta enviada');
  } catch (error) {
    logError('❌ Erro ao enviar notificação:', error);
  }
};

/**
 * Notificação - Oferta aceita
 */
export const notifyOfferAccepted = async (storeName: string): Promise<void> => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '✅ Entrega Aceita!',
        body: `Vá até ${storeName} para coletar o pedido`,
        data: { type: 'offer_accepted' },
        sound: 'default',
      },
      trigger: null,
    });
  } catch (error) {
    logError('❌ Erro ao enviar notificação:', error);
  }
};

/**
 * Notificação - Chegou no destino
 */
export const notifyArrivedAtDestination = async (isPickup: boolean): Promise<void> => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📍 Você chegou!',
        body: isPickup ? 'Colete o pedido na loja' : 'Entregue o pedido ao cliente',
        data: { type: 'arrived' },
        sound: 'default',
        vibrate: [0, 250, 250, 250],
      },
      trigger: null,
    });
  } catch (error) {
    logError('❌ Erro ao enviar notificação:', error);
  }
};

/**
 * Notificação - Entrega concluída
 */
export const notifyDeliveryCompleted = async (earning: number): Promise<void> => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎉 Entrega Concluída!',
        body: `Você ganhou R$ ${earning.toFixed(2)}`,
        data: { type: 'delivery_completed' },
        sound: 'default',
      },
      trigger: null,
    });
  } catch (error) {
    logError('❌ Erro ao enviar notificação:', error);
  }
};

/**
 * Notificação - Lembrete para ficar online
 */
export const notifyGoOnlineReminder = async (): Promise<void> => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '💰 Hora de trabalhar!',
        body: 'Fique online para receber entregas',
        data: { type: 'go_online' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 11, // 11h da manhã
        minute: 0,
      },
    });
  } catch (error) {
    logError('❌ Erro ao agendar notificação:', error);
  }
};

/**
 * Adicionar listener para quando usuário toca na notificação
 */
export const addNotificationResponseListener = (
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription => {
  return Notifications.addNotificationResponseReceivedListener(callback);
};

/**
 * Adicionar listener para notificações recebidas
 */
export const addNotificationReceivedListener = (
  callback: (notification: Notifications.Notification) => void
): Notifications.Subscription => {
  return Notifications.addNotificationReceivedListener(callback);
};

/**
 * Cancelar todas as notificações agendadas
 */
export const cancelAllNotifications = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
  log('✅ Todas as notificações canceladas');
};

/**
 * Limpar badge do app
 */
export const clearBadge = async (): Promise<void> => {
  await Notifications.setBadgeCountAsync(0);
};

/**
 * Configuração inicial (chamar no App.tsx)
 */
export const initializeNotifications = async (partnerId?: string): Promise<void> => {
  // Evitar qualquer operação que possa gerar warnings no Expo Go
  if (isExpoGo) {
    try {
      // No Expo Go: apenas configurar canais e permissões locais
      await setupNotificationChannels();
      await requestNotificationPermissions();
      // NÃO tentar registrar push token no Expo Go
      return;
    } catch (error) {
      // Silenciar completamente erros no Expo Go
      return;
    }
  }

  // Development/Production Build: notificações completas
  try {
    log('📱 Development Build: Inicializando notificações push');
    
    // Configurar canais (Android)
    await setupNotificationChannels();

    // Solicitar permissões
    await requestNotificationPermissions();

    // Registrar token se partnerId fornecido
    if (partnerId) {
      await registerPushToken(partnerId);
    }

    log('✅ Notificações inicializadas com sucesso');
  } catch (error) {
    logError('❌ Erro ao inicializar notificações:', error);
  }
};
