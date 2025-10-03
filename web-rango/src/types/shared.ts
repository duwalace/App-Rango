// Tipos compartilhados entre app-rango e web-rango
// Este arquivo deve ser sincronizado entre os dois projetos

export interface Store {
  id: string;
  name: string;
  description: string;
  logo: string;
  coverImage: string;
  address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  delivery: {
    deliveryTime: string;
    deliveryFee: number;
    freeDeliveryMinValue: number;
    deliveryRadius: number;
  };
  operatingHours: {
    [key: string]: {
      open: string;
      close: string;
      isOpen: boolean;
    };
  };
  rating?: number;
  reviewCount?: number;
  category?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuCategory {
  id: string;
  storeId: string;
  name: string;
  description: string;
  image?: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuItem {
  id: string;
  storeId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  isAvailable: boolean;
  isPopular: boolean;
  preparationTime: number; // em minutos
  ingredients?: string[];
  allergens?: string[];
  nutritionalInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  storeId: string;
  storeName: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  deliveryAddress: Address;
  deliveryInstructions?: string;
  estimatedDeliveryTime: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  observations?: string;
  subtotal: number;
}

export interface Address {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  complement?: string;
}

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'preparing' 
  | 'ready' 
  | 'in_delivery'
  | 'delivered' 
  | 'cancelled';

export type PaymentMethod = 
  | 'credit_card' 
  | 'debit_card' 
  | 'pix' 
  | 'cash';

export type UserRole = 
  | 'cliente' 
  | 'entregador' 
  | 'dono_da_loja' 
  | 'admin'
  | 'dono_do_site';

export interface User {
  uid: string;
  email: string;
  nome: string;
  role: UserRole;
  storeId?: string; // Para donos de loja
  storeName?: string;
  phone?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt?: Date;
}

// Tipos auxiliares para criação
export type CreateStoreData = Omit<Store, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateStoreData = Partial<Omit<Store, 'id' | 'createdAt' | 'updatedAt'>>;

export type CreateMenuCategoryData = Omit<MenuCategory, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateMenuCategoryData = Partial<Omit<MenuCategory, 'id' | 'storeId' | 'createdAt' | 'updatedAt'>>;

export type CreateMenuItemData = Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateMenuItemData = Partial<Omit<MenuItem, 'id' | 'storeId' | 'categoryId' | 'createdAt' | 'updatedAt'>>;

export type CreateOrderData = Omit<Order, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateOrderData = Partial<Omit<Order, 'id' | 'storeId' | 'customerId' | 'createdAt' | 'updatedAt'>>; 