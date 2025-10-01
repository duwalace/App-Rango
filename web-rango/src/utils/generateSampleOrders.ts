import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order } from '@/types/store';

export const generateSampleOrders = async (storeId: string) => {
  const sampleOrders: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
      storeId,
      customerId: 'customer-001',
      customerName: 'Maria Silva',
      customerPhone: '(11) 99999-1111',
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
      status: 'pending',
      paymentMethod: 'credit_card',
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
      estimatedDeliveryTime: new Date(Date.now() + 45 * 60 * 1000)
    },
    {
      storeId,
      customerId: 'customer-002',
      customerName: 'João Santos',
      customerPhone: '(11) 99999-2222',
      items: [
        {
          id: 'item-3',
          menuItemId: 'pizza-pepperoni',
          name: 'Pizza Pepperoni',
          price: 38.90,
          quantity: 1,
          subtotal: 38.90
        },
        {
          id: 'item-4',
          menuItemId: 'suco-laranja',
          name: 'Suco de Laranja 300ml',
          price: 6.90,
          quantity: 1,
          subtotal: 6.90
        }
      ],
      subtotal: 45.80,
      deliveryFee: 5.99,
      serviceFee: 4.58,
      total: 56.37,
      status: 'confirmed',
      paymentMethod: 'pix',
      deliveryAddress: {
        street: 'Av. Paulista',
        number: '1234',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01310-200'
      },
      deliveryInstructions: 'Entregar na portaria',
      estimatedDeliveryTime: new Date(Date.now() + 30 * 60 * 1000)
    },
    {
      storeId,
      customerId: 'customer-003',
      customerName: 'Ana Costa',
      customerPhone: '(11) 99999-3333',
      items: [
        {
          id: 'item-5',
          menuItemId: 'pizza-quatro-queijos',
          name: 'Pizza Quatro Queijos',
          price: 42.90,
          quantity: 1,
          subtotal: 42.90
        },
        {
          id: 'item-6',
          menuItemId: 'pudim-leite',
          name: 'Pudim de Leite',
          price: 8.90,
          quantity: 2,
          subtotal: 17.80
        }
      ],
      subtotal: 60.70,
      deliveryFee: 5.99,
      serviceFee: 6.07,
      total: 72.76,
      status: 'preparing',
      paymentMethod: 'debit_card',
      deliveryAddress: {
        street: 'Rua Augusta',
        number: '789',
        neighborhood: 'Jardins',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01412-100',
        complement: 'Casa 2'
      },
      deliveryInstructions: 'Deixar com o porteiro',
      estimatedDeliveryTime: new Date(Date.now() + 25 * 60 * 1000)
    },
    {
      storeId,
      customerId: 'customer-004',
      customerName: 'Carlos Oliveira',
      customerPhone: '(11) 99999-4444',
      items: [
        {
          id: 'item-7',
          menuItemId: 'pizza-margherita',
          name: 'Pizza Margherita',
          price: 32.90,
          quantity: 2,
          subtotal: 65.80
        }
      ],
      subtotal: 65.80,
      deliveryFee: 0.00, // Entrega grátis
      serviceFee: 6.58,
      total: 72.38,
      status: 'ready',
      paymentMethod: 'cash',
      deliveryAddress: {
        street: 'Rua Oscar Freire',
        number: '321',
        neighborhood: 'Jardins',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01426-001'
      },
      deliveryInstructions: 'Tocar a campainha 2 vezes',
      estimatedDeliveryTime: new Date(Date.now() + 15 * 60 * 1000)
    },
    {
      storeId,
      customerId: 'customer-005',
      customerName: 'Fernanda Lima',
      customerPhone: '(11) 99999-5555',
      items: [
        {
          id: 'item-8',
          menuItemId: 'pizza-pepperoni',
          name: 'Pizza Pepperoni',
          price: 38.90,
          quantity: 1,
          subtotal: 38.90
        },
        {
          id: 'item-9',
          menuItemId: 'coca-cola',
          name: 'Coca-Cola 350ml',
          price: 4.50,
          quantity: 1,
          subtotal: 4.50
        },
        {
          id: 'item-10',
          menuItemId: 'pudim-leite',
          name: 'Pudim de Leite',
          price: 8.90,
          quantity: 1,
          subtotal: 8.90
        }
      ],
      subtotal: 52.30,
      deliveryFee: 5.99,
      serviceFee: 5.23,
      total: 63.52,
      status: 'delivered',
      paymentMethod: 'credit_card',
      deliveryAddress: {
        street: 'Rua Haddock Lobo',
        number: '654',
        neighborhood: 'Cerqueira César',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01414-000'
      },
      deliveryInstructions: 'Entregar na recepção do prédio',
      estimatedDeliveryTime: new Date(Date.now() - 30 * 60 * 1000) // 30 minutos atrás
    }
  ];

  try {
    console.log('🛒 Gerando pedidos de exemplo...');
    
    for (const order of sampleOrders) {
      await addDoc(collection(db, 'orders'), {
        ...order,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`✅ Pedido criado: ${order.customerName} - ${order.status}`);
    }
    
    console.log('🎉 Todos os pedidos de exemplo foram criados!');
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao criar pedidos de exemplo:', error);
    throw error;
  }
};
