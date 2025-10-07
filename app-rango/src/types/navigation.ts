export type RootStackParamList = {
  Main: undefined;
  Auth: undefined;
};

export type TabParamList = {
  Início: undefined;
  Busca: undefined;
  Pedidos: undefined;
  Perfil: undefined;
};

export type OrdersStackParamList = {
  OrdersMain: undefined;
  OrderDetails: {
    orderId: string;
  };
  Review: {
    orderId: string;
  };
};

export type HomeStackParamList = {
  HomeMain: undefined;
  Category: {
    categoryId: string;
    categoryName: string;
  };
  Store: {
    storeId: string;
  };
  Product: {
    productId: string;
    product: any;
    store: any;
  };
  Cart: undefined;
  Address: undefined;
  CheckoutAddress: undefined;
  CheckoutPayment: {
    selectedAddress: any;
  };
  CheckoutReview: {
    selectedAddress: any;
    selectedPayment: string;
    changeFor?: string;
  };
  OrderConfirmation: {
    orderId: string;
  };
  AddAddress: {
    returnTo?: string;
  };
  Review: {
    orderId: string;
  };
  StoreReviews: {
    storeId: string;
    storeName: string;
  };
  Favorites: undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
};

export type AuthStackParamList = {
  AuthMain: undefined;
  Login: undefined;
  Signup: undefined;
  DeliveryAuth: undefined;
  DeliveryLogin: undefined;
  DeliverySignup: undefined;
  DeliveryVerification: undefined;
  DeliveryDocuments: undefined;
  DeliveryConfirmation: undefined;
};

export type DeliveryStackParamList = {
  Dashboard: undefined;
  Entregas: undefined;
  Carteira: undefined;
  Perfil: undefined;
  DeliveryRouteScreen: { tripId: string };
  DeliveryTripDetails: { tripId: string };
  DeliveryHistory: undefined;
  DeliveryCompletion: { tripId: string };
  DeliveryWallet: undefined;
};