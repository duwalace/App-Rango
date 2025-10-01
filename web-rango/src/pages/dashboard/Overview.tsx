import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MetricCard } from '@/components/MetricCard';
import { OrderStatusBadge } from '@/components/OrderStatusBadge';
import { 
  DollarSign, 
  ShoppingBag, 
  TrendingUp, 
  Clock,
  Package,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { getOrderStatistics, subscribeToStoreOrders } from '@/services/orderService';
import { getStoreById } from '@/services/storeService';
import { createSampleData } from '@/utils/createSampleData';
import { useToast } from '@/hooks/use-toast';
import { Order, Store } from '@/types/shared';

export default function Overview() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [store, setStore] = useState<Store | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    averageTicket: 0,
    todayOrders: 0,
    todayRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [creatingData, setCreatingData] = useState(false);

  useEffect(() => {
    if (!user?.storeId) return;

    // Carregar dados da loja
    const loadStore = async () => {
      const storeData = await getStoreById(user.storeId!);
      setStore(storeData);
    };

    loadStore();

    // Inscrever-se nos pedidos em tempo real
    const unsubscribe = subscribeToStoreOrders(user.storeId, (ordersData) => {
      setOrders(ordersData);
      calculateStats(ordersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.storeId]);

  const calculateStats = (ordersData: Order[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = ordersData.filter(order => {
      const orderDate = order.createdAt instanceof Date 
        ? order.createdAt 
        : new Date(order.createdAt);
      return orderDate >= today;
    });

    const totalRevenue = ordersData.reduce((sum, order) => 
      order.status !== 'cancelled' ? sum + order.total : sum, 0
    );

    const todayRevenue = todayOrders.reduce((sum, order) => 
      order.status !== 'cancelled' ? sum + order.total : sum, 0
    );

    const completedOrders = ordersData.filter(o => o.status !== 'cancelled').length;

    setStats({
      totalOrders: ordersData.length,
      totalRevenue,
      averageTicket: completedOrders > 0 ? totalRevenue / completedOrders : 0,
      todayOrders: todayOrders.length,
      todayRevenue
    });
  };



  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatTime = (date: any) => {
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const handleCreateSampleData = async () => {
    if (!user?.storeId) return;
    
    setCreatingData(true);
    try {
      await createSampleData(user.storeId);
      toast({
        title: '✅ Dados criados!',
        description: 'Dados de exemplo foram adicionados ao seu cardápio'
      });
    } catch (error) {
      console.error('Erro ao criar dados:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao criar dados de exemplo',
        variant: 'destructive'
      });
    } finally {
      setCreatingData(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Olá, {store?.name || 'Lojista'}! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Acompanhe o desempenho da sua loja em tempo real
          </p>
        </div>
        
        {/* Botão para criar dados de exemplo (só aparece se não tiver itens no menu) */}
        {orders.length === 0 && (
          <Button 
            onClick={handleCreateSampleData} 
            disabled={creatingData}
            variant="outline"
          >
            {creatingData ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
            ) : (
              <Package className="h-4 w-4 mr-2" />
            )}
            {creatingData ? 'Criando...' : 'Criar Dados de Exemplo'}
          </Button>
        )}
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Vendas Hoje"
          value={formatCurrency(stats.todayRevenue)}
          description={`${stats.todayOrders} pedidos hoje`}
          icon={DollarSign}
        />

        <MetricCard
          title="Total de Pedidos"
          value={stats.totalOrders}
          description="Todos os tempos"
          icon={ShoppingBag}
        />

        <MetricCard
          title="Ticket Médio"
          value={formatCurrency(stats.averageTicket)}
          description="Por pedido"
          icon={TrendingUp}
        />

        <MetricCard
          title="Faturamento Total"
          value={formatCurrency(stats.totalRevenue)}
          description="Receita acumulada"
          icon={DollarSign}
        />
      </div>

      {/* Pedidos Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Pedidos Recentes</CardTitle>
          <CardDescription>
            Acompanhe os últimos pedidos da sua loja
          </CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>Nenhum pedido ainda</p>
              <p className="text-sm">Os pedidos aparecerão aqui em tempo real</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 5).map((order) => (
                <div 
                  key={order.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${
                      order.status === 'delivered' ? 'bg-green-100' :
                      order.status === 'cancelled' ? 'bg-red-100' :
                      'bg-blue-100'
                    }`}>
                      {order.status === 'delivered' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : order.status === 'cancelled' ? (
                        <XCircle className="h-5 w-5 text-red-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">Pedido #{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-gray-500">
                        {formatTime(order.createdAt)} • {order.items.length} itens
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(order.total)}</p>
                    <OrderStatusBadge status={order.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {orders.length > 5 && (
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => window.location.href = '/dashboard/orders'}
            >
              Ver todos os pedidos
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Informações da Loja */}
      {store && (
        <Card>
          <CardHeader>
            <CardTitle>Informações da Loja</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Nome</p>
                <p className="font-medium">{store.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Categoria</p>
                <p className="font-medium">{store.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Endereço</p>
                <p className="font-medium">
                  {store.address.street}, {store.address.number} - {store.address.city}/{store.address.state}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Taxa de Entrega</p>
                <p className="font-medium">{formatCurrency(store.delivery.deliveryFee)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tempo de Entrega</p>
                <p className="font-medium">{store.delivery.deliveryTime}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge className={store.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {store.isActive ? 'Ativa' : 'Inativa'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 