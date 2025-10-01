import { 
  createCategory, 
  createMenuItem 
} from '../services/menuService';
import { 
  createStore 
} from '../services/storeService';
import { 
  CreateStoreData, 
  CreateMenuCategoryData, 
  CreateMenuItemData 
} from '../types/shared';

export const createSampleData = async (storeId: string) => {
  try {
    console.log('🔵 Criando dados de exemplo...');

    // Criar categorias
    const categories = [
      {
        name: 'Pizzas',
        description: 'Pizzas tradicionais e especiais',
        storeId,
        isActive: true
      },
      {
        name: 'Bebidas',
        description: 'Refrigerantes, sucos e águas',
        storeId,
        isActive: true
      },
      {
        name: 'Sobremesas',
        description: 'Doces e sobremesas deliciosas',
        storeId,
        isActive: true
      }
    ];

    const categoryIds: string[] = [];
    
    for (const category of categories) {
      const categoryId = await createCategory(category as CreateMenuCategoryData);
      categoryIds.push(categoryId);
      console.log(`✅ Categoria criada: ${category.name}`);
    }

    // Criar itens do menu
    const menuItems = [
      // Pizzas
      {
        name: 'Pizza Margherita',
        description: 'Molho de tomate, mussarela, manjericão e azeite',
        price: 35.90,
        categoryId: categoryIds[0],
        storeId,
        image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&h=300&fit=crop',
        isAvailable: true,
        preparationTime: '25-30 min'
      },
      {
        name: 'Pizza Pepperoni',
        description: 'Molho de tomate, mussarela e pepperoni',
        price: 42.90,
        categoryId: categoryIds[0],
        storeId,
        image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop',
        isAvailable: true,
        preparationTime: '25-30 min'
      },
      {
        name: 'Pizza Portuguesa',
        description: 'Molho de tomate, mussarela, presunto, ovos, cebola e azeitona',
        price: 45.90,
        categoryId: categoryIds[0],
        storeId,
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
        isAvailable: true,
        preparationTime: '30-35 min'
      },
      // Bebidas
      {
        name: 'Coca-Cola 350ml',
        description: 'Refrigerante de cola gelado',
        price: 5.50,
        categoryId: categoryIds[1],
        storeId,
        image: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=400&h=300&fit=crop',
        isAvailable: true,
        preparationTime: '2-3 min'
      },
      {
        name: 'Suco de Laranja 500ml',
        description: 'Suco natural de laranja',
        price: 8.90,
        categoryId: categoryIds[1],
        storeId,
        image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=300&fit=crop',
        isAvailable: true,
        preparationTime: '3-5 min'
      },
      // Sobremesas
      {
        name: 'Pudim de Leite',
        description: 'Pudim cremoso com calda de caramelo',
        price: 12.90,
        categoryId: categoryIds[2],
        storeId,
        image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop',
        isAvailable: true,
        preparationTime: '5 min'
      },
      {
        name: 'Brownie com Sorvete',
        description: 'Brownie quente com sorvete de baunilha',
        price: 15.90,
        categoryId: categoryIds[2],
        storeId,
        image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop',
        isAvailable: true,
        preparationTime: '8-10 min'
      }
    ];

    for (const item of menuItems) {
      await createMenuItem(item as CreateMenuItemData);
      console.log(`✅ Item criado: ${item.name}`);
    }

    console.log('🎉 Dados de exemplo criados com sucesso!');
    console.log(`📊 Criadas ${categories.length} categorias e ${menuItems.length} itens`);

  } catch (error) {
    console.error('❌ Erro ao criar dados de exemplo:', error);
    throw error;
  }
};

// Função para criar pedidos de exemplo
export const createSampleOrders = async (storeId: string) => {
  // Esta função seria implementada se tivéssemos a função createOrder
  // Por enquanto, os pedidos virão do app mobile
  console.log('ℹ️ Pedidos de exemplo virão do app mobile quando os clientes fizerem pedidos');
}; 