import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface DeliveryZone {
  id: string;
  name: string;
  radius: number;
  fee: number;
  minOrderValue: number;
  estimatedTime: number;
  isActive: boolean;
}

export interface StoreAddress {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
}

export interface DeliverySettings {
  deliveryEnabled: boolean;
  storeAddress: StoreAddress;
  zones: DeliveryZone[];
  freeDeliveryThreshold: number;
  updatedAt?: Date;
  createdAt?: Date;
}

/**
 * Busca configurações de área de entrega da loja
 */
export async function getDeliverySettings(storeId: string): Promise<DeliverySettings | null> {
  try {
    console.log('🔍 Buscando configurações de entrega para loja:', storeId);

    const deliveryRef = doc(db, 'stores', storeId, 'settings', 'delivery');
    const deliveryDoc = await getDoc(deliveryRef);

    if (!deliveryDoc.exists()) {
      console.log('⚠️ Configurações de entrega não encontradas, usando padrão');
      return null;
    }

    const data = deliveryDoc.data();
    
    const settings: DeliverySettings = {
      deliveryEnabled: data.deliveryEnabled ?? true,
      storeAddress: data.storeAddress || {
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
        zipCode: '',
        latitude: -23.5505,
        longitude: -46.6333,
      },
      zones: data.zones || [],
      freeDeliveryThreshold: data.freeDeliveryThreshold || 80.0,
      updatedAt: data.updatedAt?.toDate(),
      createdAt: data.createdAt?.toDate(),
    };

    console.log('✅ Configurações de entrega carregadas:', settings);
    return settings;
  } catch (error) {
    console.error('❌ Erro ao buscar configurações de entrega:', error);
    throw error;
  }
}

/**
 * Salva configurações de área de entrega
 */
export async function saveDeliverySettings(
  storeId: string,
  settings: DeliverySettings
): Promise<void> {
  try {
    console.log('💾 Salvando configurações de entrega para loja:', storeId);

    const deliveryRef = doc(db, 'stores', storeId, 'settings', 'delivery');

    const dataToSave = {
      deliveryEnabled: settings.deliveryEnabled,
      storeAddress: settings.storeAddress,
      zones: settings.zones,
      freeDeliveryThreshold: settings.freeDeliveryThreshold,
      updatedAt: Timestamp.now(),
      createdAt: settings.createdAt ? Timestamp.fromDate(settings.createdAt) : Timestamp.now(),
    };

    await setDoc(deliveryRef, dataToSave, { merge: true });

    console.log('✅ Configurações de entrega salvas com sucesso');
  } catch (error) {
    console.error('❌ Erro ao salvar configurações de entrega:', error);
    throw error;
  }
}

/**
 * Atualiza apenas o endereço da loja principal (na collection stores)
 */
export async function updateStoreMainAddress(
  storeId: string,
  address: StoreAddress
): Promise<void> {
  try {
    console.log('📍 Atualizando endereço principal da loja:', storeId);

    const storeRef = doc(db, 'stores', storeId);

    await setDoc(
      storeRef,
      {
        address: {
          street: address.street,
          number: address.number,
          neighborhood: address.neighborhood,
          city: address.city,
          state: address.state,
          zipCode: address.zipCode,
        },
        location: {
          latitude: address.latitude,
          longitude: address.longitude,
          formattedAddress: `${address.street}, ${address.number} - ${address.city}, ${address.state}`,
        },
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    );

    console.log('✅ Endereço principal da loja atualizado');
  } catch (error) {
    console.error('❌ Erro ao atualizar endereço principal:', error);
    throw error;
  }
}

/**
 * Calcula a taxa de entrega baseado na distância
 */
export function calculateDeliveryFee(
  distance: number,
  zones: DeliveryZone[]
): { fee: number; zone: DeliveryZone | null; canDeliver: boolean } {
  // Ordenar zonas por raio (menor para maior)
  const sortedZones = [...zones].sort((a, b) => a.radius - b.radius);

  // Encontrar a zona apropriada
  for (const zone of sortedZones) {
    if (zone.isActive && distance <= zone.radius) {
      return {
        fee: zone.fee,
        zone: zone,
        canDeliver: true,
      };
    }
  }

  // Distância fora de todas as zonas
  return {
    fee: 0,
    zone: null,
    canDeliver: false,
  };
}

/**
 * Verifica se pode fazer entrega para um endereço
 */
export function canDeliverToAddress(
  distance: number,
  zones: DeliveryZone[]
): boolean {
  const result = calculateDeliveryFee(distance, zones);
  return result.canDeliver;
}

/**
 * Valida configurações de entrega
 */
export function validateDeliverySettings(settings: DeliverySettings): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validar endereço
  if (!settings.storeAddress.street) {
    errors.push('Rua é obrigatória');
  }
  if (!settings.storeAddress.number) {
    errors.push('Número é obrigatório');
  }
  if (!settings.storeAddress.city) {
    errors.push('Cidade é obrigatória');
  }
  if (!settings.storeAddress.state) {
    errors.push('Estado é obrigatório');
  }

  // Validar zonas
  if (settings.zones.length === 0) {
    errors.push('É necessário configurar pelo menos uma zona de entrega');
  }

  // Validar cada zona
  settings.zones.forEach((zone, index) => {
    if (!zone.name) {
      errors.push(`Zona ${index + 1}: Nome é obrigatório`);
    }
    if (zone.radius <= 0) {
      errors.push(`Zona ${index + 1}: Raio deve ser maior que zero`);
    }
    if (zone.fee < 0) {
      errors.push(`Zona ${index + 1}: Taxa não pode ser negativa`);
    }
    if (zone.minOrderValue < 0) {
      errors.push(`Zona ${index + 1}: Valor mínimo não pode ser negativo`);
    }
    if (zone.estimatedTime <= 0) {
      errors.push(`Zona ${index + 1}: Tempo estimado deve ser maior que zero`);
    }
  });

  // Validar frete grátis
  if (settings.freeDeliveryThreshold < 0) {
    errors.push('Valor para frete grátis não pode ser negativo');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

