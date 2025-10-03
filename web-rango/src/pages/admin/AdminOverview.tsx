import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Store, 
  Users, 
  TrendingUp,
  DollarSign,
  Package,
  Truck,
  Activity,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface PlatformStats {
  totalStores: number;
  activeStores: number;
  pendingStores: number;
  totalCustomers: number;
  totalDeliveryPersons: number;
  activeDeliveryPersons: number;
  ordersLast24h: number;
  gmvToday: number;
  gmvMonth: number;
  platformRevenueToday: number;
  platformRevenueMonth: number;
}

export default function AdminOverview() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PlatformStats>({
    totalStores: 0,
    activeStores: 0,
    pendingStores: 0,
    totalCustomers: 0,
    totalDeliveryPersons: 0,
    activeDeliveryPersons: 0,
    ordersLast24h: 0,
    gmvToday: 0,
    gmvMonth: 0,
    platformRevenueToday: 0,
    platformRevenueMonth: 0,
  });

  useEffect(() => {
    loadPlatformStats();
  }, []);

  const loadPlatformStats = async () => {
    setLoading(true);
    try {
      // Buscar todas as lojas
      const storesSnapshot = await getDocs(collection(db, 'stores'));
      const totalStores = storesSnapshot.size;
      const activeStores = storesSnapshot.docs.filter(doc => doc.data().isActive === true).length;
      const pendingStores = storesSnapshot.docs.filter(doc => doc.data().status === 'pending').length;

      // Buscar todos os usuários por role
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const totalCustomers = usersSnapshot.docs.filter(doc => doc.data().role === 'cliente').length;
      const totalDeliveryPersons = usersSnapshot.docs.filter(doc => doc.data().role === 'entregador').length;
      const activeDeliveryPersons = usersSnapshot.docs.filter(doc => 
        doc.data().role === 'entregador' && doc.data().isOnline === true
      ).length;

      // Buscar pedidos das últimas 24h
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const ordersQuery = query(
        collection(db, 'orders'),
        where('createdAt', '>=', Timestamp.fromDate(yesterday))
      );
      const ordersSnapshot = await getDocs(ordersQuery);
      const ordersLast24h = ordersSnapshot.size;

      // Calcular GMV (Total de pedidos)
      let gmvToday = 0;
      let gmvMonth = 0;
      const todayStart = new Date(now.setHours(0, 0, 0, 0));
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      ordersSnapshot.docs.forEach(doc => {
        const order = doc.data();
        const orderDate = order.createdAt.toDate();
        
        if (orderDate >= todayStart) {
          gmvToday += order.total || 0;
        }
        if (orderDate >= monthStart) {
          gmvMonth += order.total || 0;
        }
      });

      // Calcular receita da plataforma (assumindo 10% de comissão + R$ 2 de taxa)
      const platformRevenueToday = gmvToday * 0.10 + (ordersLast24h * 2);
      const platformRevenueMonth = gmvMonth * 0.10 + (ordersSnapshot.size * 2);

      setStats({
        totalStores,
        activeStores,
        pendingStores,
        totalCustomers,
        totalDeliveryPersons,
        activeDeliveryPersons,
        ordersLast24h,
        gmvToday,
        gmvMonth,
        platformRevenueToday,
        platformRevenueMonth,
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando estatísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard da Plataforma</h1>
        <p className="text-muted-foreground">Visão geral de toda a plataforma Rappy</p>
      </div>

      {/* KPIs Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Lojas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Lojas</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStores}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="default" className="text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                {stats.activeStores} Ativas
              </Badge>
              {stats.pendingStores > 0 && (
                <Badge variant="secondary" className="text-xs">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {stats.pendingStores} Pendentes
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Clientes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Cadastrados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Total de usuários clientes
            </p>
          </CardContent>
        </Card>

        {/* Entregadores */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entregadores</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDeliveryPersons}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="default" className="text-xs">
                <Activity className="h-3 w-3 mr-1" />
                {stats.activeDeliveryPersons} Online
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Pedidos 24h */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos (24h)</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ordersLast24h}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Últimas 24 horas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Financeiro */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* GMV */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              GMV - Faturamento Bruto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Hoje</p>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(stats.gmvToday)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Este Mês</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.gmvMonth)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Receita da Plataforma */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Receita da Plataforma
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Hoje (Comissões + Taxas)</p>
                <p className="text-3xl font-bold text-blue-600">{formatCurrency(stats.platformRevenueToday)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Este Mês</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.platformRevenueMonth)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder para gráficos */}
      <Card>
        <CardHeader>
          <CardTitle>Gráficos e Métricas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">
              Gráficos de crescimento e mapa de calor serão implementados aqui
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

