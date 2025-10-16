/**
 * Serviço para gerenciar dados da base de clientes
 */

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  Timestamp,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: Date;
  lastOrderAt: Date | null;
  totalOrders: number;
  totalSpent: number;
  averageTicket: number;
  segment: 'vip' | 'regular' | 'new' | 'inactive';
  status: 'active' | 'inactive';
  tags: string[];
  notes: string;
  favoriteItems: string[];
  rating: number;
}

export interface CustomerStats {
  totalCustomers: number;
  newThisMonth: number;
  activeCustomers: number;
  averageTicket: number;
  totalRevenue: number;
}

export interface CustomerOrder {
  id: string;
  date: Date;
  total: number;
  items: number;
  status: string;
}

/**
 * Busca todos os clientes de uma loja agregando dados de pedidos
 */
export async function getStoreCustomers(
  storeId: string
): Promise<Customer[]> {
  try {
    console.log('👥 Buscando clientes da loja...');

    // Buscar todos os pedidos da loja
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('storeId', '==', storeId));

    const snapshot = await getDocs(q);
    
    // Mapa para agregar dados por cliente
    const customersMap = new Map<string, {
      name: string;
      email: string;
      phone: string;
      address: string;
      firstOrder: Date;
      lastOrder: Date;
      orders: number;
      totalSpent: number;
      items: Map<string, number>; // Conta quantas vezes cada item foi pedido
    }>();

    snapshot.forEach((doc) => {
      const data = doc.data();
      const customerId = data.customerId || data.userId;
      
      if (!customerId) return;

      const orderDate = data.createdAt?.toDate() || new Date();
      const orderTotal = data.total || 0;
      const orderItems = data.items || [];

      const current = customersMap.get(customerId) || {
        name: data.customerName || data.customer?.name || 'Cliente',
        email: data.customerEmail || data.customer?.email || '',
        phone: data.customerPhone || data.customer?.phone || '',
        address: data.deliveryAddress?.street || data.customer?.address || '',
        firstOrder: orderDate,
        lastOrder: orderDate,
        orders: 0,
        totalSpent: 0,
        items: new Map(),
      };

      // Atualizar agregados
      current.orders += 1;
      current.totalSpent += orderTotal;
      
      if (orderDate < current.firstOrder) {
        current.firstOrder = orderDate;
      }
      
      if (orderDate > current.lastOrder) {
        current.lastOrder = orderDate;
      }

      // Contar itens favoritos
      orderItems.forEach((item: any) => {
        const itemName = item.name || 'Produto';
        current.items.set(itemName, (current.items.get(itemName) || 0) + 1);
      });

      customersMap.set(customerId, current);
    });

    // Converter para array de clientes
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const customers: Customer[] = Array.from(customersMap.entries()).map(
      ([id, data]) => {
        const averageTicket = data.orders > 0 ? data.totalSpent / data.orders : 0;
        
        // Determinar segmento
        let segment: Customer['segment'] = 'regular';
        
        if (data.lastOrder < ninetyDaysAgo) {
          segment = 'inactive';
        } else if (data.firstOrder > thirtyDaysAgo) {
          segment = 'new';
        } else if (data.totalSpent > 1000 || data.orders > 20) {
          segment = 'vip';
        }

        // Determinar status
        const status: Customer['status'] = data.lastOrder < ninetyDaysAgo ? 'inactive' : 'active';

        // Encontrar itens favoritos (top 3 mais pedidos)
        const favoriteItems = Array.from(data.items.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([name]) => name);

        // Rating baseado em frequência e valor gasto
        let rating = 3;
        if (data.totalSpent > 2000 && data.orders > 30) rating = 5;
        else if (data.totalSpent > 1000 && data.orders > 15) rating = 4;
        else if (segment === 'new') rating = 5; // Novos clientes começam com 5

        return {
          id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          createdAt: data.firstOrder,
          lastOrderAt: data.lastOrder,
          totalOrders: data.orders,
          totalSpent: data.totalSpent,
          averageTicket,
          segment,
          status,
          tags: [],
          notes: '',
          favoriteItems,
          rating,
        };
      }
    );

    console.log(`✅ ${customers.length} clientes carregados`);
    return customers.sort((a, b) => b.totalSpent - a.totalSpent);
  } catch (error) {
    console.error('❌ Erro ao buscar clientes:', error);
    throw error;
  }
}

/**
 * Calcula estatísticas gerais da base de clientes
 */
export function calculateCustomerStats(customers: Customer[]): CustomerStats {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const totalCustomers = customers.length;
  const newThisMonth = customers.filter(c => c.createdAt >= thirtyDaysAgo).length;
  const activeCustomers = customers.filter(c => c.status === 'active').length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const totalOrders = customers.reduce((sum, c) => sum + c.totalOrders, 0);
  const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return {
    totalCustomers,
    newThisMonth,
    activeCustomers,
    averageTicket,
    totalRevenue,
  };
}

/**
 * Busca histórico de pedidos de um cliente específico
 */
export async function getCustomerOrders(
  storeId: string,
  customerId: string,
  limit: number = 20
): Promise<CustomerOrder[]> {
  try {
    console.log('📦 Buscando pedidos do cliente...');

    const ordersRef = collection(db, 'orders');
    
    // SOLUÇÃO TEMPORÁRIA: Removendo orderBy para evitar erro de índice
    const q = query(
      ordersRef,
      where('storeId', '==', storeId),
      where('customerId', '==', customerId)
      // orderBy('createdAt', 'desc') // Descomentar após deploy do índice
    );

    const snapshot = await getDocs(q);
    const orders: CustomerOrder[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      const items = data.items || [];
      
      orders.push({
        id: doc.id,
        date: data.createdAt?.toDate() || new Date(),
        total: data.total || 0,
        items: items.length,
        status: data.status || 'unknown',
      });
    });

    // Ordenar no JavaScript (solução temporária)
    const sortedOrders = orders
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limit);

    console.log(`✅ ${sortedOrders.length} pedidos carregados`);
    return sortedOrders;
  } catch (error) {
    console.error('❌ Erro ao buscar pedidos do cliente:', error);
    throw error;
  }
}

/**
 * Atualiza notas e tags de um cliente
 */
export async function updateCustomerNotes(
  customerId: string,
  notes: string,
  tags: string[]
): Promise<void> {
  try {
    console.log('💾 Atualizando notas do cliente...');

    // Como os dados de clientes são agregados dos pedidos,
    // vamos salvar notas e tags em uma coleção separada
    const customerNotesRef = doc(db, 'customer_notes', customerId);
    
    // Usar setDoc com merge para criar ou atualizar
    await setDoc(customerNotesRef, {
      notes,
      tags,
      updatedAt: Timestamp.now(),
    }, { merge: true });

    console.log('✅ Notas atualizadas com sucesso');
  } catch (error) {
    console.error('❌ Erro ao atualizar notas:', error);
    throw error;
  }
}

/**
 * Busca notas e tags salvas de um cliente
 */
export async function getCustomerNotes(
  customerId: string
): Promise<{ notes: string; tags: string[] } | null> {
  try {
    const customerNotesRef = doc(db, 'customer_notes', customerId);
    const snapshot = await getDoc(customerNotesRef);

    if (snapshot.exists()) {
      const data = snapshot.data();
      return {
        notes: data.notes || '',
        tags: data.tags || [],
      };
    }

    return null;
  } catch (error) {
    console.error('❌ Erro ao buscar notas:', error);
    return null;
  }
}

/**
 * Exporta dados de clientes para CSV
 */
export function exportCustomersToCSV(customers: Customer[]): void {
  const headers = [
    'ID',
    'Nome',
    'Email',
    'Telefone',
    'Endereço',
    'Data de Cadastro',
    'Último Pedido',
    'Total de Pedidos',
    'Total Gasto',
    'Ticket Médio',
    'Segmento',
    'Status',
  ];

  const rows = customers.map(c => [
    c.id,
    c.name,
    c.email,
    c.phone,
    c.address,
    c.createdAt.toLocaleDateString('pt-BR'),
    c.lastOrderAt ? c.lastOrderAt.toLocaleDateString('pt-BR') : 'Nunca',
    c.totalOrders.toString(),
    c.totalSpent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    c.averageTicket.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    c.segment,
    c.status,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `clientes_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  console.log('✅ CSV exportado com sucesso');
}

