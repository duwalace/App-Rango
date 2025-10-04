/**
 * AdminOverview.tsx
 * Dashboard principal do super administrador
 * Visão 360° da plataforma com KPIs, gráficos e atividades
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { 
  Store, 
  Users, 
  DollarSign,
  Package,
  Truck,
  Activity,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { 
  getPlatformStats, 
  getRevenueChartData,
  getRecentActivities,
  PlatformStats,
  RevenueDataPoint,
  ActivityEvent
} from "@/services/adminService";
import { KpiCard } from "@/components/admin/KpiCard";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { ActivityFeed } from "@/components/admin/ActivityFeed";
import { useToast } from "@/hooks/use-toast";

export default function AdminOverview() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueDataPoint[]>([]);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      // Carregar todas as métricas em paralelo
      const [statsData, chartData, activitiesData] = await Promise.all([
        getPlatformStats(),
        getRevenueChartData(30),
        getRecentActivities(15)
      ]);

      setStats(statsData);
      setRevenueData(chartData);
      setActivities(activitiesData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados da plataforma',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
    toast({
      title: 'Atualizado',
      description: 'Dados atualizados com sucesso',
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando estatísticas da plataforma...</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard da Plataforma</h1>
          <p className="text-muted-foreground">Visão completa e em tempo real de toda a operação Rappy</p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={refreshing}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* KPIs Principais - Linha 1 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total de Lojas"
          value={stats.totalStores}
          icon={Store}
          badges={[
            { label: `${stats.activeStores} Ativas`, variant: "default", icon: CheckCircle },
            ...(stats.pendingStores > 0 
              ? [{ label: `${stats.pendingStores} Pendentes`, variant: "secondary" as const, icon: AlertCircle }] 
              : [])
          ]}
        />

        <KpiCard
          title="Clientes Cadastrados"
          value={formatNumber(stats.totalCustomers)}
          icon={Users}
          description={`+${stats.newCustomersThisMonth} novos este mês`}
          color="blue"
        />

        <KpiCard
          title="Entregadores"
          value={stats.totalDeliveryPersons}
          icon={Truck}
          badges={[
            { label: `${stats.activeDeliveryPersons} Online`, variant: "default", icon: Activity }
          ]}
          color="orange"
        />

        <KpiCard
          title="Pedidos (24h)"
          value={stats.ordersLast24h}
          icon={Package}
          description={`${stats.ordersThisMonth} pedidos este mês`}
        />
      </div>

      {/* KPIs Financeiros - Linha 2 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="GMV Hoje"
          value={formatCurrency(stats.gmvToday)}
          icon={DollarSign}
          color="green"
          description="Faturamento Bruto"
        />

        <KpiCard
          title="GMV (7 dias)"
          value={formatCurrency(stats.gmvLast7Days)}
          icon={DollarSign}
          color="green"
        />

        <KpiCard
          title="Receita Hoje"
          value={formatCurrency(stats.platformRevenueToday)}
          icon={DollarSign}
          color="blue"
          description="Comissões + Taxas"
        />

        <KpiCard
          title="Receita (30 dias)"
          value={formatCurrency(stats.platformRevenueLast30Days)}
          icon={DollarSign}
          color="blue"
        />
      </div>

      {/* Gráfico de Receita */}
      <RevenueChart data={revenueData} />

      {/* Grid: Métricas Adicionais + Feed de Atividades */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Métricas Operacionais */}
        <div className="space-y-4">
          <KpiCard
            title="Ticket Médio"
            value={formatCurrency(stats.avgOrderValue)}
            description="Valor médio por pedido"
            color="green"
          />
          
          <KpiCard
            title="Taxa de Conversão"
            value={`${stats.conversionRate.toFixed(2)}%`}
            description="Pedidos por cliente"
            color="orange"
          />
        </div>

        {/* Feed de Atividades */}
        <ActivityFeed activities={activities} maxHeight="400px" />
      </div>
    </div>
  );
}

