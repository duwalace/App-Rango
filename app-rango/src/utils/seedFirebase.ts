import { createStore } from '../services/storeService';
import { createCategory, createMenuItem } from '../services/menuService';
import { CreateStoreData } from '../types/shared';

/**
 * Popula o Firebase com dados de teste
 * Execute isso uma vez para criar lojas de exemplo
 */
export const seedFirebaseData = async () => {
  try {
    console.log('🌱 Iniciando seed de dados...');

    // 1. Criar loja de exemplo
    const storeData: CreateStoreData = {
      name: 'Burger King',
      description: 'Os melhores hambúrgueres da cidade',
      logo: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=100&h=100&fit=crop',
      coverImage: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&h=400&fit=crop',
      address: {
        street: 'Avenida Paulista',
        number: '1000',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01310-100'
      },
      contact: {
        phone: '(11) 99999-9999',
        email: 'contato@burgerking.com',
        website: 'https://burgerking.com.br'
      },
      delivery: {
        deliveryTime: '30-40 min',
        deliveryFee: 5.99,
        freeDeliveryMinValue: 30.00,
        deliveryRadius: 5
      },
      operatingHours: {
        monday: { open: '11:00', close: '23:00', isOpen: true },
        tuesday: { open: '11:00', close: '23:00', isOpen: true },
        wednesday: { open: '11:00', close: '23:00', isOpen: true },
        thursday: { open: '11:00', close: '23:00', isOpen: true },
        friday: { open: '11:00', close: '00:00', isOpen: true },
        saturday: { open: '11:00', close: '00:00', isOpen: true },
        sunday: { open: '11:00', close: '22:00', isOpen: true }
      },
      rating: 4.5,
      reviewCount: 1200,
      category: 'Hamburgeria',
      isActive: true
    };

    const storeId = await createStore(storeData);
    console.log('✅ Loja criada:', storeId);

    // 2. Criar categorias
    const categories = [
      { name: 'Hambúrgueres', description: 'Nossos deliciosos hambúrgueres' },
      { name: 'Acompanhamentos', description: 'Batatas, onion rings e mais' },
      { name: 'Bebidas', description: 'Refrigerantes e sucos' },
      { name: 'Sobremesas', description: 'Sorvetes e doces' }
    ];

    const categoryIds: string[] = [];
    for (const cat of categories) {
      const categoryId = await createCategory({
        storeId,
        name: cat.name,
        description: cat.description,
        isActive: true,
        order: categoryIds.length
      });
      categoryIds.push(categoryId);
      console.log(`✅ Categoria criada: ${cat.name}`);
    }

    // 3. Criar itens do cardápio
    const menuItems = [
      // Hambúrgueres
      {
        storeId,
        categoryId: categoryIds[0],
        name: 'Whopper',
        description: 'Pão com gergelim, hambúrguer grelhado, maionese, alface, tomate, picles e cebola',
        price: 28.90,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=200&fit=crop',
        isAvailable: true,
        isPopular: true,
        preparationTime: 15,
        ingredients: ['Pão', 'Hambúrguer', 'Alface', 'Tomate', 'Queijo'],
        allergens: ['Glúten', 'Lactose'],
        order: 0
      },
      {
        storeId,
        categoryId: categoryIds[0],
        name: 'Whopper Duplo',
        description: 'Dois hambúrgueres grelhados com todos os ingredientes do Whopper',
        price: 35.90,
        image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=300&h=200&fit=crop',
        isAvailable: true,
        isPopular: true,
        preparationTime: 18,
        ingredients: ['Pão', '2 Hambúrgueres', 'Alface', 'Tomate', 'Queijo'],
        allergens: ['Glúten', 'Lactose'],
        order: 1
      },
      {
        storeId,
        categoryId: categoryIds[0],
        name: 'BK Stacker',
        description: 'Dois hambúrgueres, bacon crocante e queijo derretido',
        price: 32.90,
        image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=300&h=200&fit=crop',
        isAvailable: true,
        isPopular: false,
        preparationTime: 20,
        ingredients: ['Pão', '2 Hambúrgueres', 'Bacon', 'Queijo'],
        allergens: ['Glúten', 'Lactose'],
        order: 2
      },
      // Acompanhamentos
      {
        storeId,
        categoryId: categoryIds[1],
        name: 'Batata Frita Média',
        description: 'Batatas fritas crocantes',
        price: 8.90,
        image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300&h=200&fit=crop',
        isAvailable: true,
        isPopular: true,
        preparationTime: 8,
        order: 0
      },
      {
        storeId,
        categoryId: categoryIds[1],
        name: 'Onion Rings',
        description: 'Anéis de cebola empanados',
        price: 10.90,
        image: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=300&h=200&fit=crop',
        isAvailable: true,
        isPopular: false,
        preparationTime: 10,
        order: 1
      },
      // Bebidas
      {
        storeId,
        categoryId: categoryIds[2],
        name: 'Coca-Cola 350ml',
        description: 'Refrigerante Coca-Cola lata',
        price: 5.90,
        image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=300&h=200&fit=crop',
        isAvailable: true,
        isPopular: true,
        preparationTime: 2,
        order: 0
      },
      {
        storeId,
        categoryId: categoryIds[2],
        name: 'Suco de Laranja',
        description: 'Suco natural de laranja',
        price: 8.90,
        image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=300&h=200&fit=crop',
        isAvailable: true,
        isPopular: false,
        preparationTime: 5,
        order: 1
      },
      // Sobremesas
      {
        storeId,
        categoryId: categoryIds[3],
        name: 'Sundae de Chocolate',
        description: 'Sorvete cremoso com calda de chocolate',
        price: 7.90,
        image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=300&h=200&fit=crop',
        isAvailable: true,
        isPopular: true,
        preparationTime: 5,
        order: 0
      }
    ];

    for (const item of menuItems) {
      await createMenuItem(item);
      console.log(`✅ Item criado: ${item.name}`);
    }

    console.log('🎉 Seed concluído com sucesso!');
    console.log('📝 ID da loja criada:', storeId);
    
    return { storeId, categoryIds };
  } catch (error) {
    console.error('❌ Erro ao fazer seed:', error);
    throw error;
  }
}; 