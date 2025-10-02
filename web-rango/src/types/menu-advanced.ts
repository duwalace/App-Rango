import { Timestamp } from 'firebase/firestore';

// ========================================
// MENU ITEM - Estrutura Completa
// ========================================

export interface MenuItem {
  id: string;
  storeId: string;
  categoryId: string;
  
  // Informações Básicas
  name: string;
  description: string;
  shortDescription?: string; // Para listagens (max 100 chars)
  
  // Preços e Variações
  basePrice: number;
  variations?: MenuItemVariation[]; // Tamanhos, sabores, etc
  
  // Mídia
  images: MenuItemImage[];
  video?: string; // URL do vídeo (futuro)
  
  // Disponibilidade
  isAvailable: boolean;
  stockControl: StockControl;
  availability: AvailabilitySchedule;
  
  // Complementos e Personalizações
  complementGroups?: ComplementGroup[];
  
  // Características e Flags
  isPopular: boolean;
  isNew: boolean;
  isPromotion: boolean;
  preparationTime: number; // em minutos
  servingSize?: string; // "Serve 2 pessoas", "Porção individual"
  
  // Informações Nutricionais e Restrições
  ingredients?: string[];
  allergens?: string[];
  nutritionalInfo?: NutritionalInfo;
  dietaryFlags: DietaryFlag[]; // vegetariano, vegano, sem glúten, etc
  
  // Metadata e SEO
  tags: string[]; // Para busca e categorização
  order: number; // Ordem de exibição
  
  // Estatísticas
  views: number;
  sales: number;
  rating: number;
  reviewCount: number;
  
  // Auditoria
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  createdBy: string; // UID do usuário
  lastModifiedBy: string; // UID do usuário
}

// ========================================
// VARIAÇÕES DE PRODUTO
// ========================================

export interface MenuItemVariation {
  id: string;
  name: string; // "Pequeno (300ml)", "Médio (500ml)", "Grande (700ml)"
  description?: string;
  priceModifier: number; // +5.00, -2.00, 0.00
  isAvailable: boolean;
  isDefault?: boolean; // Variação selecionada por padrão
  order: number;
}

// ========================================
// IMAGENS DO PRODUTO
// ========================================

export interface MenuItemImage {
  id: string;
  url: string; // URL completa da imagem
  thumbnailUrl: string; // URL do thumbnail (400x400)
  storageRef: string; // Caminho no Firebase Storage
  isPrimary: boolean; // Imagem principal
  order: number;
  uploadedAt: Date | Timestamp;
}

// ========================================
// GRUPOS DE COMPLEMENTOS
// ========================================

export interface ComplementGroup {
  id: string;
  name: string; // "Adicionais", "Ponto da Carne", "Molhos"
  description?: string; // "Escolha seus adicionais favoritos"
  
  // Regras de Seleção
  isRequired: boolean; // Cliente DEVE escolher
  minSelection: number; // Mínimo de itens (0 = opcional)
  maxSelection: number; // Máximo de itens (-1 = ilimitado)
  
  // Complementos do Grupo
  complements: Complement[];
  
  // Metadata
  order: number; // Ordem de exibição
}

// ========================================
// COMPLEMENTO INDIVIDUAL
// ========================================

export interface Complement {
  id: string;
  name: string; // "Bacon", "Queijo Cheddar", "Catupiry"
  description?: string;
  price: number; // Valor adicional (0.00 = grátis)
  isAvailable: boolean;
  maxQuantity: number; // Máximo por pedido (ex: 5 fatias de bacon)
  order: number;
}

// ========================================
// CONTROLE DE ESTOQUE
// ========================================

export interface StockControl {
  enabled: boolean; // Se controle de estoque está ativo
  currentStock: number; // Quantidade atual
  minStock: number; // Alerta de estoque baixo
  maxStock: number; // Capacidade máxima
  unit: StockUnit; // Unidade de medida
  lastRestocked: Date | Timestamp; // Última reposição
  autoDisable?: boolean; // Desabilitar produto quando estoque zero
}

export type StockUnit = 
  | 'unidades' 
  | 'porcoes'
  | 'kg' 
  | 'g' 
  | 'litros' 
  | 'ml';

// ========================================
// DISPONIBILIDADE E HORÁRIOS
// ========================================

export interface AvailabilitySchedule {
  alwaysAvailable: boolean; // Disponível 24/7
  schedules?: TimeSchedule[]; // Horários específicos
}

export interface TimeSchedule {
  dayOfWeek: number; // 0 = Domingo, 6 = Sábado
  startTime: string; // "11:00"
  endTime: string; // "14:30"
  isActive: boolean; // Ativar/Desativar horário específico
}

// ========================================
// INFORMAÇÕES NUTRICIONAIS
// ========================================

export interface NutritionalInfo {
  servingSize: string; // "1 porção (200g)"
  calories: number; // kcal
  protein: number; // g
  carbs: number; // g
  fat: number; // g
  fiber?: number; // g
  sodium?: number; // mg
  sugar?: number; // g
}

// ========================================
// FLAGS DIETÉTICAS
// ========================================

export type DietaryFlag = 
  | 'vegetarian'       // Vegetariano
  | 'vegan'            // Vegano
  | 'gluten-free'      // Sem Glúten
  | 'lactose-free'     // Sem Lactose
  | 'low-carb'         // Low Carb
  | 'keto'             // Cetogênico
  | 'organic'          // Orgânico
  | 'sugar-free'       // Sem Açúcar
  | 'halal'            // Halal
  | 'kosher';          // Kosher

// ========================================
// TIPOS PARA CRIAÇÃO E ATUALIZAÇÃO
// ========================================

export type CreateMenuItemData = Omit<
  MenuItem, 
  'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'lastModifiedBy' | 'views' | 'sales' | 'rating' | 'reviewCount'
>;

export type UpdateMenuItemData = Partial<
  Omit<MenuItem, 'id' | 'storeId' | 'createdAt' | 'createdBy'>
>;

// ========================================
// TIPO DE PRODUTO
// ========================================

export type ProductType = 
  | 'preparado'        // Feito na hora (hambúrguer, pizza)
  | 'industrializado'  // Produto pronto (refrigerante, chocolate)
  | 'combo';           // Kit de produtos

// ========================================
// HELPER TYPES
// ========================================

export interface ProductFormData {
  // Step 1: Básico
  type: ProductType;
  name: string;
  description: string;
  categoryId: string;
  
  // Step 2: Preço
  basePrice: number;
  variations: MenuItemVariation[];
  
  // Step 3: Complementos
  complementGroups: ComplementGroup[];
  
  // Step 4: Mídia
  images: MenuItemImage[];
  
  // Step 5: Disponibilidade
  isAvailable: boolean;
  stockControl: StockControl;
  availability: AvailabilitySchedule;
  
  // Extras
  preparationTime: number;
  servingSize?: string;
  ingredients?: string[];
  allergens?: string[];
  dietaryFlags: DietaryFlag[];
  tags: string[];
}

// ========================================
// VALIDAÇÃO
// ========================================

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
} 