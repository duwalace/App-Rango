import { createStore } from '../services/storeService';
import { createCategory, createMenuItem } from '../services/menuService';
import { CreateStoreData } from '../types/shared';

/**
 * Popula o Firebase com dados de teste completos
 * Execute isso uma vez para criar lojas de exemplo
 */
export const seedFirebaseData = async () => {
  try {
    console.log('🌱 Iniciando seed completo de dados...');
    console.log('⏳ Isso pode levar alguns segundos...\n');

    const storesCreated = [];

    // ============================================
    // LOJA 1: PIZZARIA DO JOÃO
    // ============================================
    console.log('🍕 Criando Pizzaria do João...');
    const pizzariaData: CreateStoreData = {
      name: 'Pizzaria do João',
      description: 'As melhores pizzas artesanais da região, feitas no forno à lenha',
      logo: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&h=200&fit=crop',
      coverImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=400&fit=crop',
      address: {
        street: 'Rua das Palmeiras',
        number: '123',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01310-100'
      },
      contact: {
        phone: '(11) 98888-1111',
        email: 'contato@pizzariadojoao.com'
      },
      delivery: {
        deliveryTime: '40-50 min',
        deliveryFee: 6.50,
        freeDeliveryMinValue: 50.00,
        deliveryRadius: 8
      },
      operatingHours: {
        monday: { open: '18:00', close: '23:30', isOpen: true },
        tuesday: { open: '18:00', close: '23:30', isOpen: true },
        wednesday: { open: '18:00', close: '23:30', isOpen: true },
        thursday: { open: '18:00', close: '23:30', isOpen: true },
        friday: { open: '18:00', close: '00:30', isOpen: true },
        saturday: { open: '18:00', close: '00:30', isOpen: true },
        sunday: { open: '18:00', close: '23:00', isOpen: true }
      },
      rating: 4.7,
      reviewCount: 856,
      category: 'Pizzaria',
      isActive: true
    };

    const pizzariaId = await createStore(pizzariaData);
    console.log('✅ Pizzaria criada:', pizzariaId);

    const pizzaCats = ['Pizzas Salgadas', 'Pizzas Doces', 'Bebidas'];
    const pizzaCatIds: string[] = [];
    
    for (let i = 0; i < pizzaCats.length; i++) {
      const catId = await createCategory({
        storeId: pizzariaId,
        name: pizzaCats[i],
        description: `Categoria ${pizzaCats[i]}`,
        isActive: true,
        order: i
      });
      pizzaCatIds.push(catId);
    }

    // Pizzas
    const pizzas = [
      { name: 'Pizza Margherita', price: 45.90, desc: 'Molho de tomate, mussarela, manjericão e azeite', popular: true, img: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop' },
      { name: 'Pizza Calabresa', price: 48.90, desc: 'Calabresa, cebola, mussarela e azeitonas', popular: true, img: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop' },
      { name: 'Pizza Portuguesa', price: 52.90, desc: 'Presunto, ovos, cebola, azeitonas e mussarela', popular: true, img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop' },
      { name: 'Pizza Quatro Queijos', price: 54.90, desc: 'Mussarela, provolone, gorgonzola e parmesão', popular: false, img: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400&h=300&fit=crop' },
      { name: 'Pizza Frango com Catupiry', price: 49.90, desc: 'Frango desfiado com catupiry original', popular: true, img: 'https://images.unsplash.com/photo-1594007654729-407eedc4be65?w=400&h=300&fit=crop' }
    ];

    for (let i = 0; i < pizzas.length; i++) {
      await createMenuItem({
        storeId: pizzariaId,
        categoryId: pizzaCatIds[0],
        name: pizzas[i].name,
        description: pizzas[i].desc,
        price: pizzas[i].price,
        image: pizzas[i].img,
        isAvailable: true,
        isPopular: pizzas[i].popular,
        preparationTime: 35,
        order: i
      });
    }

    storesCreated.push({ name: 'Pizzaria do João', id: pizzariaId });

    // ============================================
    // LOJA 2: MARMITEX DO BAIRRO
    // ============================================
    console.log('\n🍱 Criando Marmitex do Bairro...');
    const marmitexData: CreateStoreData = {
      name: 'Marmitex do Bairro',
      description: 'Comida caseira deliciosa e preço justo',
      logo: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop',
      coverImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=400&fit=crop',
      address: {
        street: 'Rua dos Comerciantes',
        number: '456',
        neighborhood: 'Jardim Paulista',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01405-100'
      },
      contact: {
        phone: '(11) 98888-2222',
        email: 'contato@marmitexdobairro.com'
      },
      delivery: {
        deliveryTime: '25-35 min',
        deliveryFee: 4.50,
        freeDeliveryMinValue: 35.00,
        deliveryRadius: 5
      },
      operatingHours: {
        monday: { open: '11:00', close: '15:00', isOpen: true },
        tuesday: { open: '11:00', close: '15:00', isOpen: true },
        wednesday: { open: '11:00', close: '15:00', isOpen: true },
        thursday: { open: '11:00', close: '15:00', isOpen: true },
        friday: { open: '11:00', close: '15:00', isOpen: true },
        saturday: { open: '11:00', close: '14:00', isOpen: true },
        sunday: { open: '11:00', close: '14:00', isOpen: false }
      },
      rating: 4.8,
      reviewCount: 1234,
      category: 'Comida Caseira',
      isActive: true
    };

    const marmitexId = await createStore(marmitexData);
    console.log('✅ Marmitex criado:', marmitexId);

    const marmitexCats = ['Marmitas', 'Bebidas', 'Sobremesas'];
    const marmitexCatIds: string[] = [];
    
    for (let i = 0; i < marmitexCats.length; i++) {
      const catId = await createCategory({
        storeId: marmitexId,
        name: marmitexCats[i],
        description: `Categoria ${marmitexCats[i]}`,
        isActive: true,
        order: i
      });
      marmitexCatIds.push(catId);
    }

    const marmitas = [
      { name: 'Marmita Executiva', price: 25.90, desc: 'Arroz, feijão, bife, batata frita, salada', popular: true, img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop' },
      { name: 'Marmita Frango Grelhado', price: 22.90, desc: 'Arroz, feijão, frango grelhado, legumes', popular: true, img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop' },
      { name: 'Marmita Peixe', price: 28.90, desc: 'Arroz, feijão, peixe grelhado, salada', popular: false, img: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop' }
    ];

    for (let i = 0; i < marmitas.length; i++) {
      await createMenuItem({
        storeId: marmitexId,
        categoryId: marmitexCatIds[0],
        name: marmitas[i].name,
        description: marmitas[i].desc,
        price: marmitas[i].price,
        image: marmitas[i].img,
        isAvailable: true,
        isPopular: marmitas[i].popular,
        preparationTime: 20,
        order: i
      });
    }

    storesCreated.push({ name: 'Marmitex do Bairro', id: marmitexId });

    // ============================================
    // LOJA 3: BURGER HOUSE
    // ============================================
    console.log('\n🍔 Criando Burger House...');
    const burgerData: CreateStoreData = {
      name: 'Burger House',
      description: 'Hambúrgueres artesanais e suculentos',
      logo: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=200&h=200&fit=crop',
      coverImage: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&h=400&fit=crop',
      address: {
        street: 'Avenida Paulista',
        number: '2000',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01310-200'
      },
      contact: {
        phone: '(11) 98888-3333',
        email: 'contato@burgerhouse.com'
      },
      delivery: {
        deliveryTime: '30-40 min',
        deliveryFee: 5.99,
        freeDeliveryMinValue: 40.00,
        deliveryRadius: 6
      },
      operatingHours: {
        monday: { open: '18:00', close: '23:00', isOpen: true },
        tuesday: { open: '18:00', close: '23:00', isOpen: true },
        wednesday: { open: '18:00', close: '23:00', isOpen: true },
        thursday: { open: '18:00', close: '23:00', isOpen: true },
        friday: { open: '18:00', close: '01:00', isOpen: true },
        saturday: { open: '18:00', close: '01:00', isOpen: true },
        sunday: { open: '18:00', close: '23:00', isOpen: true }
      },
      rating: 4.6,
      reviewCount: 678,
      category: 'Hamburgeria',
      isActive: true
    };

    const burgerId = await createStore(burgerData);
    console.log('✅ Burger House criado:', burgerId);

    const burgerCats = ['Hambúrgueres', 'Acompanhamentos', 'Bebidas'];
    const burgerCatIds: string[] = [];
    
    for (let i = 0; i < burgerCats.length; i++) {
      const catId = await createCategory({
        storeId: burgerId,
        name: burgerCats[i],
        description: `Categoria ${burgerCats[i]}`,
        isActive: true,
        order: i
      });
      burgerCatIds.push(catId);
    }

    const burgers = [
      { name: 'Classic Burger', price: 32.90, desc: 'Hambúrguer 180g, queijo, alface, tomate', popular: true, img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop' },
      { name: 'Bacon Burger', price: 36.90, desc: 'Hambúrguer 180g, bacon crocante, queijo cheddar', popular: true, img: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=300&fit=crop' },
      { name: 'Double Burger', price: 42.90, desc: 'Dois hambúrgueres 180g, queijo duplo', popular: true, img: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&h=300&fit=crop' }
    ];

    for (let i = 0; i < burgers.length; i++) {
      await createMenuItem({
        storeId: burgerId,
        categoryId: burgerCatIds[0],
        name: burgers[i].name,
        description: burgers[i].desc,
        price: burgers[i].price,
        image: burgers[i].img,
        isAvailable: true,
        isPopular: burgers[i].popular,
        preparationTime: 25,
        order: i
      });
    }

    storesCreated.push({ name: 'Burger House', id: burgerId });

    // ============================================
    // RESUMO FINAL
    // ============================================
    console.log('\n' + '='.repeat(50));
    console.log('🎉 SEED CONCLUÍDO COM SUCESSO!');
    console.log('='.repeat(50));
    console.log('\n📊 Lojas criadas:');
    storesCreated.forEach((store, index) => {
      console.log(`  ${index + 1}. ${store.name} (ID: ${store.id})`);
    });
    console.log('\n✅ Total de lojas:', storesCreated.length);
    console.log('✅ O app agora exibirá as lojas e produtos!\n');
    
    return { storesCreated };
  } catch (error) {
    console.error('\n❌ ERRO AO FAZER SEED:', error);
    throw error;
  }
}; 