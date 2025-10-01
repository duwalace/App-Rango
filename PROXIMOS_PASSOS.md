# 🚀 Próximos Passos - Implementação Completa

Este guia detalha os próximos passos para tornar o sistema Rappy totalmente funcional.

## ✅ O que já está pronto:

- ✅ Serviços compartilhados (storeService, menuService, orderService)
- ✅ Tipos TypeScript compartilhados
- ✅ Hooks customizados para React (useStore, useMenu, useOrders)
- ✅ Script de seed para dados de teste
- ✅ Firebase configurado em ambos os projetos

---

## 📋 Checklist de Implementação

### 🎯 PRIORIDADE ALTA (Fazer Primeiro)

#### 1. Popular Firebase com Dados de Teste
```bash
# Executar uma vez para criar dados de exemplo
# No app-rango, criar uma tela temporária ou usar console:
import { seedFirebaseData } from './utils/seedFirebase';
await seedFirebaseData();
```

**Arquivo criado:** `app-rango/src/utils/seedFirebase.ts`

#### 2. Atualizar Tela de Loja (StoreScreen) - App Mobile
**Local:** `app-rango/src/Cliente/StoreScreen.tsx`

```typescript
import { useStore } from '../hooks/useStore';
import { useStoreCategories, useStoreMenuItems } from '../hooks/useMenu';

function StoreScreen({ route }) {
  const { storeId } = route.params;
  
  // Usar hooks em tempo real
  const { store, loading: storeLoading } = useStore(storeId);
  const { categories, loading: categoriesLoading } = useStoreCategories(storeId);
  const { items, loading: itemsLoading } = useStoreMenuItems(storeId);
  
  // Renderizar dados reais do Firebase
  // ...
}
```

**O que fazer:**
- [ ] Substituir dados mock por dados reais do Firebase
- [ ] Usar hooks `useStore`, `useStoreCategories`, `useStoreMenuItems`
- [ ] Adicionar loading states
- [ ] Testar atualização em tempo real

#### 3. Implementar Sistema de Pedidos - App Mobile
**Local:** `app-rango/src/Cliente/CartScreen.tsx`

```typescript
import { useCreateOrder } from '../hooks/useOrders';
import { useAuth } from '../contexts/AuthContext';

function CartScreen() {
  const { createOrder, loading } = useCreateOrder();
  const { currentUser } = useAuth();
  const { items, store, total } = useCart();
  
  const handleFinalizarPedido = async () => {
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
      subtotal: total,
      deliveryFee: 5.99,
      serviceFee: 0,
      total: total + 5.99,
      paymentMethod: 'credit_card',
      deliveryAddress: {
        street: 'Rua Exemplo',
        number: '123',
        // ... endereço do usuário
      },
      estimatedDeliveryTime: new Date(Date.now() + 45 * 60 * 1000)
    };
    
    try {
      const orderId = await createOrder(orderData);
      // Navegar para tela de acompanhamento
      navigation.navigate('OrderTracking', { orderId });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível criar o pedido');
    }
  };
}
```

**O que fazer:**
- [ ] Implementar função de finalizar pedido
- [ ] Criar tela de acompanhamento de pedido
- [ ] Usar hook `useCreateOrder`
- [ ] Adicionar validações

#### 4. Criar Tela de Acompanhamento de Pedido
**Criar:** `app-rango/src/Cliente/OrderTrackingScreen.tsx`

```typescript
import { useOrder } from '../hooks/useOrders';

function OrderTrackingScreen({ route }) {
  const { orderId } = route.params;
  const { order, loading } = useOrder(orderId);
  
  useEffect(() => {
    // Notificar quando status mudar
    if (order?.status === 'confirmed') {
      Alert.alert('Pedido confirmado!');
    } else if (order?.status === 'preparing') {
      Alert.alert('Seu pedido está sendo preparado!');
    }
  }, [order?.status]);
  
  return (
    <View>
      <Text>Status: {order?.status}</Text>
      <OrderStatusTimeline status={order?.status} />
      {/* Timeline visual do status */}
    </View>
  );
}
```

**O que fazer:**
- [ ] Criar tela de tracking
- [ ] Usar hook `useOrder` para tempo real
- [ ] Adicionar timeline visual de status
- [ ] Notificações quando status mudar

#### 5. Atualizar Tela de Pedidos
**Local:** `app-rango/src/Cliente/OrdersScreen.tsx`

```typescript
import { useCustomerOrders } from '../hooks/useOrders';
import { useAuth } from '../contexts/AuthContext';

function OrdersScreen() {
  const { currentUser } = useAuth();
  const { orders, loading } = useCustomerOrders(currentUser?.uid);
  
  return (
    <View>
      {orders.map(order => (
        <OrderCard 
          key={order.id} 
          order={order}
          onPress={() => navigation.navigate('OrderTracking', { orderId: order.id })}
        />
      ))}
    </View>
  );
}
```

**O que fazer:**
- [ ] Implementar listagem de pedidos
- [ ] Usar hook `useCustomerOrders`
- [ ] Adicionar filtros (ativos, histórico)
- [ ] Permitir cancelamento

---

### 🌐 PRIORIDADE ALTA - Web Dashboard

#### 6. Atualizar Dashboard de Pedidos - Web
**Local:** `web-rango/src/pages/dashboard/Orders.tsx`

O arquivo já existe e usa hooks, mas pode precisar de ajustes:

```typescript
import { subscribeToStoreOrders, updateOrderStatus } from '@/services/orderService';

// Já está implementado, verificar se usa os novos serviços
```

**O que fazer:**
- [ ] Garantir que usa os novos serviços
- [ ] Adicionar notificações para novos pedidos
- [ ] Som de alerta para novos pedidos
- [ ] Botão de aceitar/rejeitar pedido

#### 7. Melhorar Edição de Cardápio - Web
**Local:** `web-rango/src/pages/dashboard/Menu.tsx`

```typescript
import { updateMenuItem, toggleItemAvailability } from '@/services/menuService';

// Adicionar botão de disponibilidade rápida
const handleToggleAvailability = async (itemId: string, isAvailable: boolean) => {
  await toggleItemAvailability(itemId, !isAvailable);
  toast.success(isAvailable ? 'Item indisponível' : 'Item disponível');
};
```

**O que fazer:**
- [ ] Botão rápido para marcar item como indisponível
- [ ] Edição inline de preços
- [ ] Upload de imagens
- [ ] Duplicar itens

---

### 🔔 PRIORIDADE MÉDIA

#### 8. Implementar Notificações em Tempo Real - Web

**Criar:** `web-rango/src/hooks/useOrderNotifications.ts`

```typescript
import { useEffect } from 'react';
import { subscribeToActiveStoreOrders } from '@/services/orderService';

export const useOrderNotifications = (storeId: string) => {
  useEffect(() => {
    if (!storeId) return;
    
    const unsubscribe = subscribeToActiveStoreOrders(storeId, (orders) => {
      const pendingOrders = orders.filter(o => o.status === 'pending');
      
      if (pendingOrders.length > 0) {
        // Tocar som
        const audio = new Audio('/notification.mp3');
        audio.play();
        
        // Mostrar notificação
        new Notification('Novo pedido recebido!', {
          body: `Você tem ${pendingOrders.length} pedido(s) pendente(s)`,
          icon: '/logo.png'
        });
      }
    });
    
    return () => unsubscribe();
  }, [storeId]);
};
```

**O que fazer:**
- [ ] Criar hook de notificações
- [ ] Pedir permissão para notificações
- [ ] Adicionar som de alerta
- [ ] Notificações de desktop

#### 9. Criar Página de Estatísticas - Web

**Criar:** `web-rango/src/pages/dashboard/Analytics.tsx`

```typescript
import { getOrderStatistics } from '@/services/orderService';

function Analytics() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  
  useEffect(() => {
    if (user?.storeId) {
      getOrderStatistics(user.storeId).then(setStats);
    }
  }, [user?.storeId]);
  
  return (
    <div>
      <h2>Estatísticas</h2>
      <div>Total de Pedidos: {stats?.totalOrders}</div>
      <div>Pedidos Hoje: {stats?.todayOrders}</div>
      <div>Receita Total: R$ {stats?.totalRevenue}</div>
      <div>Receita Hoje: R$ {stats?.todayRevenue}</div>
    </div>
  );
}
```

**O que fazer:**
- [ ] Criar página de analytics
- [ ] Gráficos com Recharts
- [ ] Métricas por período
- [ ] Export para Excel/PDF

#### 10. Melhorar Tela Inicial - App Mobile

**Local:** `app-rango/src/Cliente/HomeScreen.tsx`

```typescript
import { useActiveStores } from '../hooks/useStore';

function HomeScreen() {
  const { stores, loading } = useActiveStores();
  
  return (
    <ScrollView>
      <RestaurantCarousel restaurants={stores} />
      {/* Renderizar lojas reais */}
    </ScrollView>
  );
}
```

**O que fazer:**
- [ ] Usar dados reais do Firebase
- [ ] Implementar busca de lojas
- [ ] Filtros por categoria
- [ ] Geolocalização

---

### 🎨 PRIORIDADE BAIXA (Melhorias)

#### 11. Sistema de Favoritos
- [ ] Adicionar campo `favorites` no usuário
- [ ] Botão de favoritar loja
- [ ] Tela de favoritos

#### 12. Sistema de Avaliações
- [ ] Permitir cliente avaliar pedido
- [ ] Mostrar avaliações na loja
- [ ] Calcular média de avaliações

#### 13. Sistema de Cupons/Promoções
- [ ] Criar serviço de cupons
- [ ] Aplicar desconto no carrinho
- [ ] Validar cupons

#### 14. Chat Cliente-Loja
- [ ] Implementar chat em tempo real
- [ ] Notificações de mensagens
- [ ] Histórico de conversas

#### 15. Notificações Push
- [ ] Firebase Cloud Messaging
- [ ] Notificar status de pedido
- [ ] Notificar promoções

---

## 🛠️ Ferramentas e Recursos

### Testar Comunicação em Tempo Real

1. **Abra o Web Dashboard:**
```bash
cd web-rango
npm run dev
```

2. **Abra o App Mobile:**
```bash
cd app-rango
npm start
```

3. **Teste o fluxo:**
   - No web, edite o preço de um produto
   - No app, veja a atualização automática
   - No app, faça um pedido
   - No web, veja o pedido aparecer em tempo real

### Debug

**Ver logs do Firebase:**
```typescript
// Em qualquer serviço
console.log('Dados recebidos:', data);
```

**Limpar cache:**
```bash
# App
npm start --clear

# Web
rm -rf node_modules/.vite
```

---

## 📚 Documentação de Referência

- **Serviços:** `SERVICOS_COMPARTILHADOS.md`
- **Resumo:** `RESUMO_SERVICOS.md`
- **Firebase Docs:** https://firebase.google.com/docs
- **React Native:** https://reactnative.dev/docs

---

## 🎯 Ordem Recomendada de Implementação

### Semana 1: Backend e Dados
1. ✅ Popular Firebase com dados de teste
2. ✅ Testar serviços compartilhados
3. ✅ Verificar regras do Firestore

### Semana 2: App Mobile - Visualização
4. ✅ Atualizar tela de loja com dados reais
5. ✅ Implementar busca de lojas
6. ✅ Testar atualização em tempo real

### Semana 3: App Mobile - Pedidos
7. ✅ Implementar criação de pedidos
8. ✅ Criar tela de acompanhamento
9. ✅ Tela de histórico de pedidos

### Semana 4: Web Dashboard
10. ✅ Melhorar recepção de pedidos
11. ✅ Adicionar notificações sonoras
12. ✅ Edição rápida de cardápio

### Semana 5: Polimento
13. ✅ Testes de integração
14. ✅ Tratamento de erros
15. ✅ UX/UI improvements

---

## ✅ Checklist Rápido para Começar AGORA

```bash
# 1. Popular dados de teste (fazer UMA VEZ)
# Criar componente temporário ou usar console do navegador
import { seedFirebaseData } from './utils/seedFirebase';
await seedFirebaseData();

# 2. Atualizar StoreScreen.tsx
# Substituir dados mock por:
const { store } = useStore(storeId);
const { items } = useStoreMenuItems(storeId);

# 3. Testar em tempo real
# Abrir web e app lado a lado
# Editar preço no web
# Ver atualização no app!
```

---

**Próximo passo imediato:** Popular Firebase com dados de teste usando `seedFirebaseData()` 🚀 