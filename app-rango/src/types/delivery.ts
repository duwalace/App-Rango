// Types para o Módulo de Entregadores (App Mobile)
import { Timestamp } from 'firebase/firestore';

// Reexportando para compatibilidade
export type { Timestamp } from 'firebase/firestore';

// GeoPoint type para React Native
export interface GeoPoint {
  latitude: number;
  longitude: number;
}

// ==========================================
// DELIVERY PARTNER (Entregador)
// ==========================================

export type DeliveryPartnerStatus = 
  | 'pending_approval' 
  | 'active' 
  | 'inactive' 
  | 'suspended' 
  | 'blocked';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export type OperationalStatus = 
  | 'offline' 
  | 'online_idle' 
  | 'on_delivery' 
  | 'unavailable';

export type VehicleType = 'bicycle' | 'motorcycle' | 'car';

// ==========================================
// DELIVERY INFO (Adicionado ao Order)
// ==========================================

export type DeliveryStatus = 
  | 'waiting_partner' 
  | 'partner_assigned' 
  | 'going_to_store' 
  | 'arrived_at_store' 
  | 'picked_up' 
  | 'going_to_customer' 
  | 'arrived_at_customer' 
  | 'delivered'
  | 'failed';

export interface DeliveryInfo {
  // Atribuição
  partner_id?: string;
  partner_name?: string;
  partner_phone?: string;
  partner_photo_url?: string;
  partner_vehicle_type?: VehicleType;
  
  // Status da Entrega
  status: DeliveryStatus;
  
  // Rastreamento
  pickup_location: GeoPoint; // Localização da loja
  delivery_location: GeoPoint; // Localização do cliente
  partner_current_location?: GeoPoint; // Atualizado em tempo real
  
  // Tempos (SLA tracking)
  assigned_at?: Timestamp | Date;
  pickup_eta_minutes?: number;
  delivery_eta_minutes?: number;
  arrived_at_store_at?: Timestamp | Date;
  picked_up_at?: Timestamp | Date;
  arrived_at_customer_at?: Timestamp | Date;
  delivered_at?: Timestamp | Date;
  
  // Financeiro
  delivery_fee: number; // Valor cobrado do cliente
  partner_earning: number; // Valor pago ao entregador
  platform_commission: number; // Comissão da plataforma
  distance_km: number; // Calculado automaticamente
  
  // Avaliação
  rating?: {
    score: number; // 1-5
    comment?: string;
    tags?: string[];
    created_at: Timestamp | Date;
  };
  
  // Observações
  delivery_instructions?: string;
  proof_of_delivery?: {
    photo_url?: string;
    signature_url?: string;
    code?: string;
  };
}

// ==========================================
// DELIVERY OFFER (Pool de Ofertas)
// ==========================================

export type DeliveryOfferStatus = 'open' | 'accepted' | 'expired' | 'cancelled';

export interface DeliveryOffer {
  id: string;
  order_id: string;
  store_id: string;
  store_name: string;
  
  // Localização
  pickup_location: GeoPoint;
  delivery_location: GeoPoint;
  distance_km: number;
  
  // Financeiro
  earning_amount: number; // Quanto o entregador ganhará
  
  // Status da Oferta
  status: DeliveryOfferStatus;
  visible_to_partners: string[];
  
  // Timing
  created_at: Timestamp | Date;
  expires_at: Timestamp | Date;
  accepted_by?: string;
  accepted_at?: Timestamp | Date;
  
  // Tentativas
  attempt_number: number;
  search_radius_km: number;
}

// ==========================================
// DELIVERY EARNING (Controle Financeiro)
// ==========================================

export type EarningStatus = 'pending' | 'available' | 'withdrawn' | 'cancelled';

export interface DeliveryEarning {
  id: string;
  partner_id: string;
  order_id: string;
  
  // Valores
  gross_amount: number;
  platform_fee: number;
  net_amount: number;
  
  // Status
  status: EarningStatus;
  
  // Pagamento
  payment_method?: 'bank_transfer' | 'pix';
  withdrawal_id?: string;
  paid_at?: Timestamp | Date;
  
  // Auditoria
  created_at: Timestamp | Date;
  completed_at?: Timestamp | Date;
}

// ==========================================
// DELIVERY PARTNER METRICS (para Dashboard)
// ==========================================

export interface DeliveryPartnerMetrics {
  total_deliveries: number;
  completed_deliveries: number;
  cancelled_deliveries: number;
  acceptance_rate: number; // 0-100
  average_rating: number; // 0-5
  total_ratings: number;
  on_time_rate: number; // % entregas no prazo
  total_earnings: number; // Valor total ganho
  current_balance: number; // Saldo a receber
}

// ==========================================
// ORDER COM DELIVERY INFO
// ==========================================

export interface OrderWithDelivery {
  id: string;
  // ... outros campos do order ...
  delivery?: DeliveryInfo;
}

// ==========================================
// HELPER TYPES
// ==========================================

export const DELIVERY_STATUS_LABELS: Record<DeliveryStatus, string> = {
  waiting_partner: 'Buscando entregador',
  partner_assigned: 'Entregador atribuído',
  going_to_store: 'Indo buscar pedido',
  arrived_at_store: 'Na loja',
  picked_up: 'Pedido retirado',
  going_to_customer: 'A caminho',
  arrived_at_customer: 'Chegou no endereço',
  delivered: 'Entregue',
  failed: 'Falhou'
};

export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  bicycle: 'Bicicleta',
  motorcycle: 'Moto',
  car: 'Carro'
};

export const VEHICLE_TYPE_ICONS: Record<VehicleType, string> = {
  bicycle: '🚴',
  motorcycle: '🏍️',
  car: '🚗'
};

