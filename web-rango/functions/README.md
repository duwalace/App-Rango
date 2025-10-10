# Cloud Functions - Módulo de Entregadores

Cloud Functions do Firebase para gerenciar o sistema de entregas do Rango.

## 📦 Funções Implementadas

### 1. `createDeliveryOffer`
**Trigger**: `onCreate` em `orders`

Quando um novo pedido é criado:
- Busca entregadores disponíveis em raio de 5km
- Calcula distância e valores (fee, earning, comissão)
- Cria oferta de entrega com expiração de 60s
- Envia notificação push para entregadores próximos

### 2. `retryDeliveryOffer`
**Trigger**: Scheduled (a cada 30 segundos)

Verifica ofertas expiradas:
- Expande raio de busca (5km → 10km → 15km → 20km)
- Busca novos entregadores no raio expandido
- Cria nova expiração de 60s
- Após 4 tentativas, marca como `failed`

### 3. `assignDeliveryPartner`
**Trigger**: `onUpdate` em `delivery_offers`

Quando oferta é aceita:
- Atualiza pedido com dados do entregador
- Muda status do entregador para `on_delivery`
- Cancela outras ofertas do mesmo pedido
- Notifica loja e cliente

### 4. `completeDelivery`
**Trigger**: `onUpdate` em `orders`

Quando entrega é concluída:
- Cria registro em `delivery_earnings`
- Atualiza métricas do entregador
- Libera entregador (`online_idle`)
- Atualiza saldo disponível

## 🚀 Setup

### Instalar Dependências

```bash
cd functions
npm install
```

### Build

```bash
npm run build
```

### Testar Localmente

```bash
npm run serve
```

Isso iniciará o Firebase Emulator para testar as functions localmente.

### Deploy

```bash
# Deploy todas as functions
firebase deploy --only functions

# Deploy function específica
firebase deploy --only functions:createDeliveryOffer
```

## 📊 Estrutura de Dados

### Delivery Offer
```typescript
{
  order_id: string,
  store_id: string,
  store_name: string,
  pickup_location: GeoPoint,
  delivery_location: GeoPoint,
  distance_km: number,
  earning_amount: number,
  status: 'open' | 'accepted' | 'expired',
  visible_to_partners: string[],
  created_at: Timestamp,
  expires_at: Timestamp,
  attempt_number: number,
  search_radius_km: number
}
```

### Delivery Earning
```typescript
{
  partner_id: string,
  order_id: string,
  gross_amount: number,
  platform_fee: number,
  net_amount: number,
  status: 'available' | 'withdrawn',
  created_at: Timestamp,
  completed_at: Timestamp
}
```

## 🔍 Logs

Ver logs das functions:

```bash
firebase functions:log
```

Logs em tempo real:

```bash
firebase functions:log --only createDeliveryOffer
```

## ⚙️ Configuração

### Variáveis de Ambiente

Para configurar variáveis de ambiente:

```bash
firebase functions:config:set delivery.base_rate="1.50"
firebase functions:config:set delivery.min_fee="5.00"
firebase functions:config:set delivery.partner_cut="0.80"
```

Usar nas functions:

```typescript
const config = functions.config();
const baseRate = parseFloat(config.delivery.base_rate);
```

## 🧪 Testes

### Teste Manual

1. Criar um pedido no Firestore
2. Verificar se oferta foi criada em `delivery_offers`
3. Verificar se entregadores próximos foram notificados
4. Simular aceitação mudando status da oferta
5. Verificar se pedido foi atualizado

### Logs Importantes

```
📦 Novo pedido criado: {orderId}
✅ Oferta criada: {offerId}
📍 Distância: {distance}km
💰 Ganho entregador: R$ {earning}
👥 {count} entregadores notificados
```

## 🚨 Troubleshooting

### Function não dispara

1. Verificar logs: `firebase functions:log`
2. Verificar se trigger está correto
3. Verificar permissões do Firestore

### Erros de compilação

```bash
cd functions
rm -rf node_modules lib
npm install
npm run build
```

### Deploy falha

1. Verificar se está autenticado: `firebase login`
2. Verificar projeto: `firebase use`
3. Verificar billing habilitado no Firebase Console

## 📝 Próximas Implementações

- [ ] `updateDeliveryETAs` - Atualizar ETAs em tempo real
- [ ] `sendDeliveryNotifications` - Sistema de notificações
- [ ] `updatePartnerRating` - Atualizar avaliações
- [ ] `processWithdrawal` - Saques automáticos via PIX
- [ ] `optimizeRoutes` - Otimizar rotas com ML

## 📚 Documentação

- [Firebase Cloud Functions Docs](https://firebase.google.com/docs/functions)
- [Triggers Disponíveis](https://firebase.google.com/docs/functions/firestore-events)
- [Scheduled Functions](https://firebase.google.com/docs/functions/schedule-functions)

---

**Última atualização**: Outubro 2025  
**Versão**: 1.0.0

