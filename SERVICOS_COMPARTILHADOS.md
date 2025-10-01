# 📦 Serviços Compartilhados - Rappy

Este documento descreve os serviços compartilhados criados para comunicação entre o **app-rango** (mobile) e **web-rango** (dashboard) através do Firebase.

## 📋 Índice

- [Estrutura de Arquivos](#estrutura-de-arquivos)
- [Tipos Compartilhados](#tipos-compartilhados)
- [Serviços Disponíveis](#serviços-disponíveis)
- [Como Usar](#como-usar)
- [Exemplos Práticos](#exemplos-práticos)

---

## 📁 Estrutura de Arquivos

### App-Rango (Mobile)
```
app-rango/src/
├── types/
│   └── shared.ts          # Tipos compartilhados
└── services/
    ├── storeService.ts    # Serviço de lojas
    ├── menuService.ts     # Serviço de cardápio
    └── orderService.ts    # Serviço de pedidos
```

### Web-Rango (Dashboard)
```
web-rango/src/
├── types/
│   └── shared.ts          # Tipos compartilhados (mesmo do app)
└── services/
    ├── storeService.ts    # Serviço de lojas
    ├── menuService.ts     # Serviço de cardápio
    └── orderService.ts    # Serviço de pedidos
```

---

## 🎯 Tipos Compartilhados

### Store (Loja)
```typescript
interface Store {
  id: string;
  name: string;
  description: string;
  logo: string;
  coverImage: string;
  address: { /* ... */ };
  contact: { /* ... */ };
  delivery: { /* ... */ };
  operatingHours: { /* ... */ };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### MenuItem (Item do Cardápio)
```typescript
interface MenuItem {
  id: string;
  storeId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  isAvailable: boolean;
  isPopular: boolean;
  preparationTime: number;
  ingredients?: string[];
  allergens?: string[];
  // ...
}
```

### Order (Pedido)
```typescript
interface Order {
  id: string;
  storeId: string;
  customerId: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus; // 'pending' | 'confirmed' | 'preparing' | etc.
  paymentMethod: PaymentMethod;
  deliveryAddress: Address;
  // ...
}
```

---

## 🛠️ Serviços Disponíveis

### 1. **Store Service** (Gerenciamento de Lojas)

#### Funções Principais:
- `getStoreById(storeId)` - Buscar loja por ID
- `getActiveStores()` - Buscar lojas ativas
- `createStore(data)` - Criar nova loja
- `updateStore(id, updates)` - Atualizar loja
- `toggleStoreStatus(id, isActive)` - Ativar/Desativar loja
- `isStoreOpen(store)` - Verificar se está aberta
- `subscribeToStore(id, callback)` - Listener em tempo real

### 2. **Menu Service** (Gerenciamento de Cardápio)

#### Categorias:
- `getStoreCategories(storeId)` - Buscar categorias
- `createCategory(data)` - Criar categoria
- `updateCategory(id, updates)` - Atualizar categoria
- `deleteCategory(id)` - Deletar categoria
- `subscribeToStoreCategories(id, callback)` - Listener

#### Itens:
- `getStoreMenuItems(storeId)` - Buscar itens
- `getCategoryMenuItems(storeId, categoryId)` - Itens por categoria
- `getPopularItems(storeId)` - Buscar itens populares
- `createMenuItem(data)` - Criar item
- `updateMenuItem(id, updates)` - Atualizar item
- `toggleItemAvailability(id, isAvailable)` - Disponibilizar item
- `subscribeToStoreMenuItems(id, callback)` - Listener

### 3. **Order Service** (Gerenciamento de Pedidos)

#### Funções Principais:
- `createOrder(data)` - Criar pedido
- `getOrderById(id)` - Buscar pedido
- `getCustomerOrders(customerId)` - Pedidos do cliente
- `getStoreOrders(storeId)` - Pedidos da loja
- `getOrdersByStatus(storeId, status)` - Pedidos por status
- `updateOrderStatus(id, status)` - Atualizar status
- `cancelOrder(id, reason)` - Cancelar pedido
- `subscribeToStoreOrders(id, callback)` - Listener
- `getOrderStatistics(storeId)` - Estatísticas

---

## 🚀 Como Usar

### 1. Importar os Serviços

**No App-Rango:**
```typescript
import { getStoreById, subscribeToStore } from '../services/storeService';
import { getStoreMenuItems, subscribeToStoreMenuItems } from '../services/menuService';
import { createOrder, subscribeToCustomerOrders } from '../services/orderService';
```

**No Web-Rango:**
```typescript
import { getStoreById, updateStore } from '@/services/storeService';
import { createMenuItem, updateMenuItem } from '@/services/menuService';
import { subscribeToStoreOrders, updateOrderStatus } from '@/services/orderService';
```

### 2. Usar Listeners em Tempo Real

Os listeners permitem que as mudanças no Firebase sejam refletidas automaticamente em ambos os apps.

**Exemplo - App Mobile (Cliente vendo cardápio):**
```typescript
import { useEffect, useState } from 'react';
import { subscribeToStoreMenuItems } from '../services/menuService';

function StoreScreen({ storeId }) {
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    // Subscrever às mudanças do cardápio
    const unsubscribe = subscribeToStoreMenuItems(
      storeId,
      (items) => {
        setMenuItems(items);
      }
    );

    // Limpar listener quando componente desmontar
    return () => unsubscribe();
  }, [storeId]);

  return (
    <View>
      {menuItems.map(item => (
        <MenuItem key={item.id} item={item} />
      ))}
    </View>
  );
}
```

**Exemplo - Web Dashboard (Dono editando cardápio):**
```tsx
import { updateMenuItem } from '@/services/menuService';

function EditItemForm({ itemId }) {
  const handleToggleAvailability = async () => {
    await updateMenuItem(itemId, { isAvailable: false });
    // O app mobile receberá a atualização automaticamente!
  };

  return (
    <button onClick={handleToggleAvailability}>
      Marcar como Indisponível
    </button>
  );
}
```

---

## 💡 Exemplos Práticos

### Exemplo 1: Cliente Faz um Pedido (App Mobile)

```typescript
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { createOrder } from '../services/orderService';

async function finalizarPedido() {
  const { currentUser } = useAuth();
  const { items, store, total, deliveryFee } = useCart();

  const orderData = {
    storeId: store.id,
    storeName: store.name,
    customerId: currentUser.uid,
    customerName: currentUser.nome,
    customerPhone: currentUser.phone,
    items: items.map(item => ({
      id: item.id,
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      observations: item.observations,
      subtotal: item.price * item.quantity
    })),
    subtotal: total - deliveryFee,
    deliveryFee: deliveryFee,
    serviceFee: 0,
    total: total,
    status: 'pending',
    paymentMethod: 'credit_card',
    deliveryAddress: {
      street: 'Rua Exemplo',
      number: '123',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567'
    },
    estimatedDeliveryTime: new Date(Date.now() + 45 * 60 * 1000)
  };

  try {
    const orderId = await createOrder(orderData);
    console.log('Pedido criado:', orderId);
    // Navegar para tela de acompanhamento
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
  }
}
```

### Exemplo 2: Dono Recebe e Aceita Pedido (Web Dashboard)

```tsx
import { useEffect, useState } from 'react';
import { subscribeToActiveStoreOrders, updateOrderStatus } from '@/services/orderService';
import { useAuth } from '@/contexts/AuthContext';

function OrdersManager() {
  const { user } = useAuth();
  const [activeOrders, setActiveOrders] = useState([]);

  useEffect(() => {
    if (!user?.storeId) return;

    // Receber pedidos em tempo real
    const unsubscribe = subscribeToActiveStoreOrders(
      user.storeId,
      (orders) => {
        setActiveOrders(orders);
        
        // Notificar novo pedido
        const newOrders = orders.filter(o => o.status === 'pending');
        if (newOrders.length > 0) {
          showNotification('Novo pedido recebido!');
        }
      }
    );

    return () => unsubscribe();
  }, [user?.storeId]);

  const handleAcceptOrder = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, 'confirmed');
      // Cliente verá atualização automática no app!
    } catch (error) {
      console.error('Erro ao aceitar pedido:', error);
    }
  };

  return (
    <div>
      {activeOrders.map(order => (
        <OrderCard 
          key={order.id} 
          order={order}
          onAccept={() => handleAcceptOrder(order.id)}
        />
      ))}
    </div>
  );
}
```

### Exemplo 3: Cliente Acompanha Pedido em Tempo Real (App Mobile)

```typescript
import { useEffect, useState } from 'react';
import { subscribeToOrder } from '../services/orderService';

function OrderTrackingScreen({ orderId }) {
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToOrder(
      orderId,
      (orderData) => {
        setOrder(orderData);
        
        // Mostrar notificação quando status mudar
        if (orderData?.status === 'confirmed') {
          showNotification('Pedido confirmado pela loja!');
        } else if (orderData?.status === 'preparing') {
          showNotification('Seu pedido está sendo preparado!');
        } else if (orderData?.status === 'in_delivery') {
          showNotification('Pedido saiu para entrega!');
        }
      }
    );

    return () => unsubscribe();
  }, [orderId]);

  return (
    <View>
      <Text>Status: {order?.status}</Text>
      <OrderStatusTimeline status={order?.status} />
    </View>
  );
}
```

### Exemplo 4: Dono Edita Cardápio (Web Dashboard)

```tsx
import { updateMenuItem, toggleItemAvailability } from '@/services/menuService';

function MenuEditor() {
  const handleEditPrice = async (itemId: string, newPrice: number) => {
    try {
      await updateMenuItem(itemId, { price: newPrice });
      toast.success('Preço atualizado!');
      // App mobile mostrará novo preço automaticamente
    } catch (error) {
      toast.error('Erro ao atualizar preço');
    }
  };

  const handleToggleAvailability = async (itemId: string, isAvailable: boolean) => {
    try {
      await toggleItemAvailability(itemId, isAvailable);
      toast.success(isAvailable ? 'Item disponível' : 'Item indisponível');
      // App mobile ocultará/mostrará item automaticamente
    } catch (error) {
      toast.error('Erro ao alterar disponibilidade');
    }
  };

  // ...
}
```

---

## 🔄 Fluxo de Comunicação

### Cenário: Dono atualiza preço de um produto

1. **Web Dashboard** → Dono edita preço usando `updateMenuItem()`
2. **Firebase Firestore** → Documento atualizado
3. **App Mobile** → Listener `subscribeToStoreMenuItems()` detecta mudança
4. **App Mobile** → Interface atualizada automaticamente com novo preço

### Cenário: Cliente faz pedido

1. **App Mobile** → Cliente finaliza pedido usando `createOrder()`
2. **Firebase Firestore** → Novo documento criado
3. **Web Dashboard** → Listener `subscribeToActiveStoreOrders()` detecta novo pedido
4. **Web Dashboard** → Notificação exibida ao dono
5. **Web Dashboard** → Dono aceita pedido usando `updateOrderStatus()`
6. **App Mobile** → Listener `subscribeToOrder()` detecta mudança de status
7. **App Mobile** → Cliente vê status atualizado

---

## ✅ Vantagens desta Arquitetura

1. **Tempo Real**: Mudanças aparecem instantaneamente em ambos os apps
2. **Código Reutilizável**: Mesmos serviços em app e web
3. **Type Safety**: TypeScript garante consistência
4. **Escalável**: Firebase suporta milhares de usuários
5. **Seguro**: Regras do Firestore controlam acesso
6. **Simples**: Não precisa de API backend complexa

---

## 🔒 Segurança

Os serviços usam as **Firestore Rules** definidas em `web-rango/firestore.rules`:

- Apenas donos de loja podem editar suas lojas e cardápios
- Clientes podem criar pedidos
- Todos usuários autenticados podem ler dados públicos
- Dados sensíveis são protegidos por regras específicas

---

## 📝 Notas Importantes

1. **Sincronização de Tipos**: Os arquivos `shared.ts` devem ser idênticos em ambos os projetos
2. **Listeners**: Sempre limpar listeners com `unsubscribe()` para evitar memory leaks
3. **Error Handling**: Sempre usar try/catch ao chamar serviços
4. **Performance**: Usar listeners específicos (por loja, categoria, etc.) em vez de buscar tudo

---

## 🚀 Próximos Passos

- [ ] Implementar notificações push para novos pedidos
- [ ] Adicionar sistema de promoções
- [ ] Criar hook personalizado para facilitar uso dos serviços
- [ ] Implementar cache local com AsyncStorage/LocalStorage
- [ ] Adicionar analytics para tracking de eventos

---

**Criado em:** Outubro 2025  
**Versão:** 1.0.0 