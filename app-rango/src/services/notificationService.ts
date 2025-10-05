/**
 * SERVIÇO DE NOTIFICAÇÕES
 * 
 * Gerencia preferências de notificações do usuário
 */

import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { NotificationPreferences } from '../types/profile';
// import * as Notifications from 'expo-notifications'; // TODO: Instalar expo-notifications
import { Platform } from 'react-native';

const USERS_COLLECTION = 'users';

/**
 * Buscar preferências de notificações do usuário
 */
export const getNotificationPreferences = async (
  userId: string
): Promise<NotificationPreferences> => {
  try {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));

    if (!userDoc.exists()) {
      // Retornar preferências padrão se não existir
      return {
        promotions: true,
        orderUpdates: true,
        appNews: true,
        pushEnabled: false,
        updatedAt: new Date(),
      };
    }

    const data = userDoc.data();
    const prefs = data.notificationPreferences || {};

    return {
      promotions: prefs.promotions ?? true,
      orderUpdates: prefs.orderUpdates ?? true,
      appNews: prefs.appNews ?? true,
      pushEnabled: prefs.pushEnabled ?? false,
      updatedAt: prefs.updatedAt?.toDate() || new Date(),
    };
  } catch (error) {
    console.error('Erro ao buscar preferências de notificações:', error);
    throw new Error('Não foi possível carregar as preferências');
  }
};

/**
 * Atualizar preferências de notificações
 */
export const updateNotificationPreferences = async (
  userId: string,
  preferences: Partial<NotificationPreferences>
): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);

    await updateDoc(userRef, {
      notificationPreferences: {
        ...preferences,
        updatedAt: serverTimestamp(),
      },
    });

    console.log('✅ Preferências de notificações atualizadas');
  } catch (error) {
    console.error('❌ Erro ao atualizar preferências:', error);
    throw new Error('Não foi possível salvar as preferências');
  }
};

/**
 * Verificar e solicitar permissão para notificações push
 * TODO: Instalar expo-notifications para habilitar esta funcionalidade
 */
export const requestPushPermission = async (): Promise<boolean> => {
  try {
    console.warn('expo-notifications não está instalado. Instale com: npx expo install expo-notifications');
    return false;
    
    /* TODO: Descomentar após instalar expo-notifications
    if (Platform.OS === 'web') {
      console.log('Push notifications não suportadas na web');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    
    let finalStatus = existingStatus;

    // Se não tiver permissão, solicitar
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Permissão para notificações negada');
      return false;
    }

    console.log('✅ Permissão para notificações concedida');
    return true;
    */
  } catch (error) {
    console.error('Erro ao solicitar permissão para notificações:', error);
    return false;
  }
};

/**
 * Obter o token de push notification do dispositivo
 * (Para enviar notificações específicas para este dispositivo)
 * TODO: Instalar expo-notifications para habilitar esta funcionalidade
 */
export const getPushToken = async (): Promise<string | null> => {
  try {
    console.warn('expo-notifications não está instalado');
    return null;
    
    /* TODO: Descomentar após instalar expo-notifications
    if (Platform.OS === 'web') {
      return null;
    }

    const { data: token } = await Notifications.getExpoPushTokenAsync({
      projectId: 'your-expo-project-id', // Substituir pelo ID real do projeto
    });

    console.log('Push token:', token);
    return token;
    */
  } catch (error) {
    console.error('Erro ao obter push token:', error);
    return null;
  }
};

/**
 * Salvar token de push no perfil do usuário
 * (Para poder enviar notificações depois)
 */
export const savePushToken = async (userId: string, token: string): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);

    await updateDoc(userRef, {
      pushToken: token,
      pushTokenUpdatedAt: serverTimestamp(),
    });

    console.log('✅ Push token salvo');
  } catch (error) {
    console.error('❌ Erro ao salvar push token:', error);
    // Não lançar erro para não bloquear o fluxo
  }
};

/**
 * Configurar handler de notificações
 * (Como o app deve se comportar ao receber notificações)
 * TODO: Instalar expo-notifications para habilitar esta funcionalidade
 */
export const configureNotificationHandler = (): void => {
  console.warn('expo-notifications não está instalado');
  
  /* TODO: Descomentar após instalar expo-notifications
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
  */
};

