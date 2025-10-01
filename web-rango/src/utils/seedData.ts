import { 
  collection, 
  addDoc, 
  doc, 
  setDoc 
} from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { Store, MenuCategory, MenuItem } from '@/types/store';

// Dados de exemplo para popular o Firebase
export const seedStoreData = async () => {
  try {
    // 1. Criar uma loja de exemplo
    const storeData: Omit<Store, 'id'> = {
      name: 'Pizzaria do João',
      description: 'A melhor pizza da cidade com ingredientes frescos',
      logo: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&h=200&fit=crop',
      coverImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=400&fit=crop',
      address: {
        street: 'Rua das Flores',
        number: '123',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567'
      },
      contact: {
        phone: '(11) 99999-9999',
        email: 'contato@pizzariadojoao.com',
        website: 'https://pizzariadojoao.com'
      },
      delivery: {
        deliveryTime: '30-45 min',
        deliveryFee: 5.99,
        freeDeliveryMinValue: 50.00,
        deliveryRadius: 5
      },
      operatingHours: {
        monday: { open: '18:00', close: '23:00', isOpen: true },
        tuesday: { open: '18:00', close: '23:00', isOpen: true },
        wednesday: { open: '18:00', close: '23:00', isOpen: true },
        thursday: { open: '18:00', close: '23:00', isOpen: true },
        friday: { open: '18:00', close: '00:00', isOpen: true },
        saturday: { open: '18:00', close: '00:00', isOpen: true },
        sunday: { open: '18:00', close: '22:00', isOpen: true }
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const storeRef = await addDoc(collection(db, 'stores'), storeData);
    console.log('Loja criada com ID:', storeRef.id);

    // 2. Criar categorias do cardápio
    const categories = [
      {
        storeId: storeRef.id,
        name: 'Pizzas',
        description: 'Pizzas tradicionais e especiais',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=200&fit=crop',
        isActive: true,
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        storeId: storeRef.id,
        name: 'Bebidas',
        description: 'Refrigerantes, sucos e cervejas',
        image: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=300&h=200&fit=crop',
        isActive: true,
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        storeId: storeRef.id,
        name: 'Sobremesas',
        description: 'Doces e sobremesas deliciosas',
        image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=300&h=200&fit=crop',
        isActive: true,
        order: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const categoryRefs = [];
    for (const category of categories) {
      const categoryRef = await addDoc(collection(db, 'menuCategories'), category);
      categoryRefs.push(categoryRef.id);
      console.log('Categoria criada:', category.name);
    }

    // 3. Criar itens do cardápio
    const menuItems = [
      // Pizzas
      {
        storeId: storeRef.id,
        categoryId: categoryRefs[0],
        name: 'Pizza Margherita',
        description: 'Molho de tomate, mussarela, manjericão e azeite',
        price: 32.90,
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300&h=200&fit=crop',
        isAvailable: true,
        isPopular: true,
        preparationTime: 25,
        ingredients: ['Molho de tomate', 'Mussarela', 'Manjericão', 'Azeite'],
        allergens: ['Glúten', 'Lactose'],
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        storeId: storeRef.id,
        categoryId: categoryRefs[0],
        name: 'Pizza Pepperoni',
        description: 'Molho de tomate, mussarela e pepperoni',
        price: 38.90,
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop',
        isAvailable: true,
        isPopular: true,
        preparationTime: 30,
        ingredients: ['Molho de tomate', 'Mussarela', 'Pepperoni'],
        allergens: ['Glúten', 'Lactose'],
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        storeId: storeRef.id,
        categoryId: categoryRefs[0],
        name: 'Pizza Quatro Queijos',
        description: 'Mussarela, parmesão, gorgonzola e catupiry',
        price: 42.90,
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=200&fit=crop',
        isAvailable: true,
        isPopular: false,
        preparationTime: 35,
        ingredients: ['Mussarela', 'Parmesão', 'Gorgonzola', 'Catupiry'],
        allergens: ['Glúten', 'Lactose'],
        order: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Bebidas
      {
        storeId: storeRef.id,
        categoryId: categoryRefs[1],
        name: 'Coca-Cola 350ml',
        description: 'Refrigerante gelado',
        price: 4.50,
        image: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=300&h=200&fit=crop',
        isAvailable: true,
        isPopular: false,
        preparationTime: 2,
        ingredients: ['Coca-Cola'],
        allergens: [],
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        storeId: storeRef.id,
        categoryId: categoryRefs[1],
        name: 'Suco de Laranja 300ml',
        description: 'Suco natural de laranja',
        price: 6.90,
        image: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=300&h=200&fit=crop',
        isAvailable: true,
        isPopular: false,
        preparationTime: 5,
        ingredients: ['Laranja'],
        allergens: [],
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Sobremesas
      {
        storeId: storeRef.id,
        categoryId: categoryRefs[2],
        name: 'Pudim de Leite',
        description: 'Pudim caseiro com calda de caramelo',
        price: 8.90,
        image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=300&h=200&fit=crop',
        isAvailable: true,
        isPopular: true,
        preparationTime: 10,
        ingredients: ['Leite', 'Ovos', 'Açúcar', 'Baunilha'],
        allergens: ['Lactose', 'Ovos'],
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const item of menuItems) {
      await addDoc(collection(db, 'menuItems'), item);
      console.log('Item criado:', item.name);
    }

    // 4. Criar um usuário dono da loja no Firebase Auth
    const email = 'joao@pizzariadojoao.com';
    const password = '123456'; // Senha padrão
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Atualizar perfil do usuário
      await updateProfile(user, {
        displayName: 'Pizzaria do João'
      });

      // Criar documento do usuário no Firestore
      const storeOwnerData = {
        email: email,
        role: 'store_owner',
        storeId: storeRef.id,
        storeName: 'Pizzaria do João',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(doc(db, 'users', user.uid), storeOwnerData);
      console.log('✅ Usuário dono da loja criado no Firebase Auth');
      console.log('📧 Email:', email);
      console.log('🔑 Senha:', password);
      
    } catch (authError: any) {
      if (authError.code === 'auth/email-already-in-use') {
        console.log('⚠️ Usuário já existe no Firebase Auth');
        console.log('📧 Email:', email);
        console.log('🔑 Use a senha que você definiu anteriormente');
      } else {
        throw authError;
      }
    }

    console.log('✅ Dados de exemplo criados com sucesso!');
    console.log('📧 Email do dono: joao@pizzariadojoao.com');
    console.log('🏪 ID da loja:', storeRef.id);
    
    return {
      storeId: storeRef.id,
      ownerEmail: 'joao@pizzariadojoao.com'
    };

  } catch (error) {
    console.error('❌ Erro ao criar dados de exemplo:', error);
    throw error;
  }
};

// Função para criar um pedido de exemplo
export const createSampleOrder = async (storeId: string) => {
  try {
    const orderData = {
      storeId,
      customerId: 'customer-123',
      customerName: 'Maria Silva',
      customerPhone: '(11) 99999-8888',
      items: [
        {
          id: 'item-1',
          menuItemId: 'pizza-margherita',
          name: 'Pizza Margherita',
          price: 32.90,
          quantity: 1,
          observations: 'Sem cebola',
          subtotal: 32.90
        },
        {
          id: 'item-2',
          menuItemId: 'coca-cola',
          name: 'Coca-Cola 350ml',
          price: 4.50,
          quantity: 2,
          subtotal: 9.00
        }
      ],
      subtotal: 41.90,
      deliveryFee: 5.99,
      serviceFee: 4.19,
      total: 52.08,
      status: 'pending' as const,
      paymentMethod: 'credit_card' as const,
      deliveryAddress: {
        street: 'Rua das Palmeiras',
        number: '456',
        neighborhood: 'Vila Nova',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '04567-890',
        complement: 'Apto 12'
      },
      deliveryInstructions: 'Portão azul, tocar a campainha',
      estimatedDeliveryTime: new Date(Date.now() + 45 * 60 * 1000), // 45 minutos
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const orderRef = await addDoc(collection(db, 'orders'), orderData);
    console.log('Pedido de exemplo criado:', orderRef.id);
    return orderRef.id;

  } catch (error) {
    console.error('Erro ao criar pedido de exemplo:', error);
    throw error;
  }
};
