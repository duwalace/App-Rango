import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Tipos
export interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  quantity: number;
  observations?: string;
  storeId: string;
  storeName: string;
}

export interface Store {
  id: string;
  name: string;
  logo: string;
  deliveryTime: string;
  deliveryFee: number;
}

interface CartState {
  items: CartItem[];
  store: Store | null;
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  total: number;
}

// Actions
type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'UPDATE_OBSERVATIONS'; payload: { id: string; observations: string } }
  | { type: 'SET_STORE'; payload: Store }
  | { type: 'CLEAR_CART' }
  | { type: 'CALCULATE_TOTALS' };

// Estado inicial
const initialState: CartState = {
  items: [],
  store: null,
  subtotal: 0,
  deliveryFee: 0,
  serviceFee: 0,
  total: 0,
};

// Reducer
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(
        item => item.id === action.payload.id && 
        item.observations === action.payload.observations
      );

      let newItems;
      if (existingItemIndex >= 0) {
        // Se o item já existe com as mesmas observações, aumenta a quantidade
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      } else {
        // Adiciona novo item
        newItems = [...state.items, action.payload];
      }

      const newState = { ...state, items: newItems };
      return calculateTotals(newState);
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload);
      const newState = { ...state, items: newItems };
      return calculateTotals(newState);
    }

    case 'UPDATE_QUANTITY': {
      const newItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: Math.max(0, action.payload.quantity) }
          : item
      ).filter(item => item.quantity > 0);

      const newState = { ...state, items: newItems };
      return calculateTotals(newState);
    }

    case 'UPDATE_OBSERVATIONS': {
      const newItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, observations: action.payload.observations }
          : item
      );

      return { ...state, items: newItems };
    }

    case 'SET_STORE': {
      const newState = { ...state, store: action.payload, deliveryFee: action.payload.deliveryFee };
      return calculateTotals(newState);
    }

    case 'CLEAR_CART': {
      return { ...initialState };
    }

    case 'CALCULATE_TOTALS': {
      return calculateTotals(state);
    }

    default:
      return state;
  }
}

// Função para calcular totais
function calculateTotals(state: CartState): CartState {
  const subtotal = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const serviceFee = subtotal * 0.1; // 10% de taxa de serviço
  const total = subtotal + state.deliveryFee + serviceFee;

  return {
    ...state,
    subtotal,
    serviceFee,
    total,
  };
}

// Context
interface CartContextType {
  state: CartState;
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateObservations: (id: string, observations: string) => void;
  setStore: (store: Store) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getItemById: (id: string) => CartItem | undefined;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider
interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addItem = (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    dispatch({
      type: 'ADD_ITEM',
      payload: { ...item, quantity: item.quantity || 1 },
    });
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const updateObservations = (id: string, observations: string) => {
    dispatch({ type: 'UPDATE_OBSERVATIONS', payload: { id, observations } });
  };

  const setStore = (store: Store) => {
    dispatch({ type: 'SET_STORE', payload: store });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getItemCount = () => {
    return state.items.reduce((count, item) => count + item.quantity, 0);
  };

  const getItemById = (id: string) => {
    return state.items.find(item => item.id === id);
  };

  const value: CartContextType = {
    state,
    addItem,
    removeItem,
    updateQuantity,
    updateObservations,
    setStore,
    clearCart,
    getItemCount,
    getItemById,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Hook personalizado
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};