/**
 * Categorias compartilhadas entre toda a aplicação
 * IMPORTANTE: Devem ser iguais às definidas em app-rango/src/services/categoryService.ts
 */

export const CATEGORIES = {
  // Categorias principais (correspondem aos filtros do app)
  MAIN: [
    'Restaurantes',
    'Mercado',
    'Bebidas',
    'Farmácia',
    'Pet Shop',
    'Shopping',
  ],
  
  // Subcategorias de Restaurantes
  RESTAURANT_SUBCATEGORIES: [
    'Pizzaria',
    'Hamburgueria',
    'Japonês',
    'Italiana',
    'Brasileira',
    'Lanches',
    'Saudável',
    'Açaí',
    'Sobremesas',
    'Padaria',
    'Cafeteria',
  ],
} as const;

/**
 * Lista completa de todas as categorias
 */
export const ALL_CATEGORIES = [
  ...CATEGORIES.MAIN,
  ...CATEGORIES.RESTAURANT_SUBCATEGORIES,
];

/**
 * Componente de opções para select/dropdown
 */
export const getCategoryOptions = () => {
  return [
    { value: '', label: 'Selecione uma categoria', disabled: true },
    ...CATEGORIES.MAIN.map(cat => ({ value: cat, label: cat })),
    { value: 'divider', label: '--- Subcategorias de Restaurantes ---', disabled: true },
    ...CATEGORIES.RESTAURANT_SUBCATEGORIES.map(cat => ({ value: cat, label: cat })),
  ];
};

/**
 * Verificar se uma categoria é válida
 */
export const isValidCategory = (category: string): boolean => {
  return ALL_CATEGORIES.includes(category);
};

/**
 * Obter a categoria principal de uma subcategoria
 */
export const getMainCategory = (category: string): string => {
  if (CATEGORIES.MAIN.includes(category as any)) {
    return category;
  }
  
  if (CATEGORIES.RESTAURANT_SUBCATEGORIES.includes(category as any)) {
    return 'Restaurantes';
  }
  
  return 'Restaurantes'; // Default
};

