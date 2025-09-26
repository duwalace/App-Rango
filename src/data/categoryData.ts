// Dados mock para subcategorias
export const mockSubCategories = [
  {
    id: '1',
    name: 'Lanches',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100&h=100&fit=crop',
  },
  {
    id: '2',
    name: 'Pizza',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=100&h=100&fit=crop',
  },
  {
    id: '3',
    name: 'Japonesa',
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=100&h=100&fit=crop',
  },
  {
    id: '4',
    name: 'Italiana',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=100&h=100&fit=crop',
  },
  {
    id: '5',
    name: 'Brasileira',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=100&h=100&fit=crop',
  },
  {
    id: '6',
    name: 'Doces',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=100&h=100&fit=crop',
  },
];

// Dados mock para banners promocionais
export const mockPromoBanners = [
  {
    id: '1',
    title: 'Frete Grátis',
    subtitle: 'Em pedidos acima de R$ 30',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=150&h=150&fit=crop',
    backgroundColor: '#EA1D2C',
  },
  {
    id: '2',
    title: 'Desconto 50%',
    subtitle: 'Na primeira compra',
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=150&h=150&fit=crop',
    backgroundColor: '#FF6B35',
  },
  {
    id: '3',
    title: 'Combo Família',
    subtitle: 'Economize até 30%',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=150&h=150&fit=crop',
    backgroundColor: '#4CAF50',
  },
];

// Dados mock para pratos com desconto
export const mockDiscountedDishes = [
  {
    id: '1',
    name: 'Monte seu Combo 10 Esfihas',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=200&h=150&fit=crop',
    discountedPrice: 'R$ 65,99',
    originalPrice: 'R$ 83,87',
    discountPercentage: '-21%',
    storeName: 'O Sheik Esfiharia',
    storeRating: 4.8,
    deliveryTime: '25-35 min',
  },
  {
    id: '2',
    name: 'Big Mac + Batata + Refrigerante',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=150&fit=crop',
    discountedPrice: 'R$ 28,90',
    originalPrice: 'R$ 35,90',
    discountPercentage: '-19%',
    storeName: 'McDonald\'s',
    storeRating: 4.5,
    deliveryTime: '20-30 min',
  },
  {
    id: '3',
    name: 'Pizza Margherita Grande',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&h=150&fit=crop',
    discountedPrice: 'R$ 45,90',
    originalPrice: 'R$ 59,90',
    discountPercentage: '-23%',
    storeName: 'Domino\'s Pizza',
    storeRating: 4.7,
    deliveryTime: '35-45 min',
  },
  {
    id: '4',
    name: 'Combo Sushi 20 Peças',
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=200&h=150&fit=crop',
    discountedPrice: 'R$ 89,90',
    originalPrice: 'R$ 119,90',
    discountPercentage: '-25%',
    storeName: 'Sushi House',
    storeRating: 4.9,
    deliveryTime: '40-50 min',
  },
];

// Dados mock para lojas patrocinadas (reutilizando estrutura de restaurantes)
export const mockSponsoredStores = [
  {
    id: '1',
    name: 'McDonald\'s',
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop',
    logo: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=80&h=80&fit=crop',
    rating: 4.8,
    deliveryTime: '25-35 min',
    deliveryFee: 'R$ 3,99',
    isSponsored: true,
    isFavorite: false,
  },
  {
    id: '2',
    name: 'Burger King',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
    logo: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=80&h=80&fit=crop',
    rating: 4.5,
    deliveryTime: '30-40 min',
    deliveryFee: 'R$ 4,99',
    isSponsored: true,
    isFavorite: false,
  },
  {
    id: '3',
    name: 'Domino\'s Pizza',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
    logo: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=80&h=80&fit=crop',
    rating: 4.7,
    deliveryTime: '35-45 min',
    deliveryFee: 'R$ 5,99',
    isSponsored: true,
    isFavorite: false,
  },
];

// Lista completa de lojas para a categoria
export const mockCategoryStores = [
  {
    id: '1',
    name: 'Q Sabor Pizzaria Delivery',
    logo: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=80&h=80&fit=crop',
    rating: 4.8,
    category: 'Pizza',
    distance: '2,1 km',
    deliveryTime: '35-45 min',
    deliveryFee: 'R$ 5,99',
    isSponsored: false,
    isFreeDelivery: false,
    isFavorite: false,
  },
  {
    id: '2',
    name: 'O Sheik Esfiharia',
    logo: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=80&h=80&fit=crop',
    rating: 4.6,
    category: 'Árabe',
    distance: '1,8 km',
    deliveryTime: '25-35 min',
    deliveryFee: 'R$ 3,99',
    isSponsored: false,
    isFreeDelivery: false,
    isFavorite: true,
  },
  {
    id: '3',
    name: 'Hamburgueria Mineiro Uai',
    logo: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=80&h=80&fit=crop',
    rating: 4.5,
    category: 'Lanches',
    distance: '3,2 km',
    deliveryTime: '30-40 min',
    deliveryFee: 'R$ 0,00',
    isSponsored: false,
    isFreeDelivery: true,
    isFavorite: false,
  },
  {
    id: '4',
    name: 'Sushi House',
    logo: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=80&h=80&fit=crop',
    rating: 4.9,
    category: 'Japonesa',
    distance: '4,5 km',
    deliveryTime: '40-50 min',
    deliveryFee: 'R$ 8,99',
    isSponsored: false,
    isFreeDelivery: false,
    isFavorite: false,
  },
  {
    id: '5',
    name: 'Pasta & Basta',
    logo: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=80&h=80&fit=crop',
    rating: 4.4,
    category: 'Italiana',
    distance: '2,8 km',
    deliveryTime: '35-45 min',
    deliveryFee: 'R$ 6,99',
    isSponsored: false,
    isFreeDelivery: false,
    isFavorite: true,
  },
];

// Estrutura de dados dinâmica para a CategoryScreen
export const getCategoryScreenData = (categoryId: string) => {
  return [
    { 
      type: 'sub_category_carousel', 
      data: mockSubCategories 
    },
    { 
      type: 'promo_banner_carousel', 
      data: mockPromoBanners 
    },
    { 
      type: 'discounted_dishes_carousel', 
      title: 'Desconto até 35% OFF', 
      data: mockDiscountedDishes 
    },
    { 
      type: 'sponsored_stores_carousel', 
      title: 'Lojas Patrocinadas', 
      data: mockSponsoredStores 
    },
    { 
      type: 'section_title', 
      title: 'Lojas' 
    },
    // Convertendo cada loja em um item individual da lista
    ...mockCategoryStores.map(store => ({
      type: 'store_list_item',
      data: store
    }))
  ];
};