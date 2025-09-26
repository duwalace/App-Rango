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
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
};

export type AuthStackParamList = {
  AuthMain: undefined;
  Login: undefined;
  Signup: undefined;
};