// Types para o Módulo de Entregadores
import { Timestamp, GeoPoint } from 'firebase/firestore';

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

export type AccountType = 'checking' | 'savings';

export interface DeliveryPartnerDocuments {
  cnh: {
    number: string;
    category: 'A' | 'B' | 'AB' | 'C' | 'D' | 'E';
    expiration_date: Timestamp;
    photo_url: string;
  };
  rg: {
    number: string;
    photo_url: string;
  };
  selfie_photo_url: string; // Anti-fraude
}

export interface DeliveryPartnerVehicle {
  type: VehicleType;
  brand?: string;
  model?: string;
  year?: number;
  color?: string;
  license_plate?: string; // Obrigatório para moto/carro
  photo_url?: string;
}

export interface DeliveryPartnerBankingInfo {
  bank_code: string;
  bank_name?: string;
  account_type: AccountType;
  account_number: string;
  agency: string;
  holder_name: string;
  holder_cpf: string;
  pix_key?: string;
}

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

export interface DeliveryPartnerAvailability {
  is_available_now: boolean;
  schedule?: {
    [key: string]: { start: string; end: string }[];
  };
}

export interface DeliveryPartner {
  id: string;
  userId: string; // Link para users collection
  
  // Dados Pessoais
  full_name: string;
  email: string;
  phone: string;
  cpf_hash: string; // SHA-256 para segurança
  profile_photo_url?: string;
  
  // Documentação
  documents: DeliveryPartnerDocuments;
  
  // Veículo
  vehicle: DeliveryPartnerVehicle;
  
  // Status
  status: DeliveryPartnerStatus;
  approval_status: {
    status: ApprovalStatus;
    reviewed_by?: string;
    reviewed_at?: Timestamp;
    rejection_reason?: string;
  };
  
  // Estado em Tempo Real
  operational_status: OperationalStatus;
  current_location?: GeoPoint;
  last_location_update?: Timestamp;
  current_order_id?: string;
  
  // Zona de operação (GeoFencing)
  operating_zones: string[];
  preferred_zones?: string[];
  
  // Financeiro
  banking_info: DeliveryPartnerBankingInfo;
  
  // Métricas
  metrics: DeliveryPartnerMetrics;
  
  // Disponibilidade
  availability: DeliveryPartnerAvailability;
  
  // Auditoria
  created_at: Timestamp;
  updated_at: Timestamp;
  last_login?: Timestamp;
  metadata?: {
    app_version?: string;
    device_model?: string;
    os_version?: string;
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
  visible_to_partners: string[]; // IDs dos entregadores que podem ver
  
  // Timing
  created_at: Timestamp;
  expires_at: Timestamp; // 60 segundos após criação
  accepted_by?: string;
  accepted_at?: Timestamp;
  
  // Tentativas (expandir raio)
  attempt_number: number; // 1, 2, 3...
  search_radius_km: number; // 5km inicial, depois 10km, 15km...
}

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
  assigned_at?: Timestamp;
  pickup_eta_minutes?: number;
  delivery_eta_minutes?: number;
  arrived_at_store_at?: Timestamp;
  picked_up_at?: Timestamp;
  arrived_at_customer_at?: Timestamp;
  delivered_at?: Timestamp;
  
  // Financeiro
  delivery_fee: number; // Valor cobrado do cliente
  partner_earning: number; // Valor pago ao entregador (fee - comissão)
  platform_commission: number; // Comissão da plataforma (20%)
  distance_km: number; // Calculado automaticamente
  
  // Avaliação
  rating?: {
    score: number; // 1-5
    comment?: string;
    tags?: string[];
    created_at: Timestamp;
  };
  
  // Observações
  delivery_instructions?: string;
  proof_of_delivery?: {
    photo_url?: string;
    signature_url?: string;
    code?: string; // Código de confirmação
  };
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
  gross_amount: number; // Valor bruto (delivery_fee)
  platform_fee: number; // Taxa da plataforma
  net_amount: number; // Valor líquido para o entregador
  
  // Status
  status: EarningStatus;
  
  // Pagamento
  payment_method?: 'bank_transfer' | 'pix';
  withdrawal_id?: string; // Se já foi sacado
  paid_at?: Timestamp;
  
  // Auditoria
  created_at: Timestamp;
  completed_at?: Timestamp;
}

// ==========================================
// DELIVERY ZONE (GeoFencing)
// ==========================================

export interface DeliveryZone {
  id: string;
  name: string;
  city: string;
  state: string;
  
  // Polígono da zona
  boundaries: GeoPoint[]; // Array de coordenadas
  center: GeoPoint; // Centro da zona
  
  // Configurações
  is_active: boolean;
  min_delivery_fee: number;
  base_fee_per_km: number;
  
  // Horários de operação
  operating_hours?: {
    [key: string]: { open: string; close: string };
  };
  
  created_at: Timestamp;
  updated_at: Timestamp;
}

// ==========================================
// WITHDRAWAL REQUEST (Solicitação de Saque)
// ==========================================

export type WithdrawalStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export interface WithdrawalRequest {
  id: string;
  partner_id: string;
  partner_name: string;
  
  // Valores
  amount: number;
  earnings_ids: string[]; // IDs dos earnings sendo sacados
  
  // Dados bancários (cache do momento da solicitação)
  banking_info: DeliveryPartnerBankingInfo;
  
  // Status
  status: WithdrawalStatus;
  
  // Processamento
  requested_at: Timestamp;
  processed_by?: string; // ID do admin que processou
  processed_at?: Timestamp;
  rejection_reason?: string;
  
  // Comprovante
  receipt_url?: string;
  transaction_id?: string;
}

// ==========================================
// DELIVERY RATING (Avaliação do Entregador)
// ==========================================

export interface DeliveryRating {
  id: string;
  order_id: string;
  partner_id: string;
  customer_id: string;
  
  // Avaliação
  score: number; // 1-5
  tags?: string[]; // ['fast', 'polite', 'careful']
  comment?: string;
  
  // Auditoria
  created_at: Timestamp;
}

// ==========================================
// HELPER TYPES
// ==========================================

export interface DeliveryPartnerFilters {
  status?: DeliveryPartnerStatus;
  operational_status?: OperationalStatus;
  approval_status?: ApprovalStatus;
  vehicle_type?: VehicleType;
  zone?: string;
  min_rating?: number;
  search?: string; // Busca por nome/email
}

export interface DeliveryPartnerStats {
  total_partners: number;
  active_partners: number;
  online_partners: number;
  on_delivery_partners: number;
  pending_approval: number;
}

// ==========================================
// CONSTANTS
// ==========================================

export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  bicycle: 'Bicicleta',
  motorcycle: 'Moto',
  car: 'Carro'
};

