import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  Loader2,
  Download,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { DateRangePicker } from '@/components/DateRangePicker';
import {
  getStorePerformance,
  getPresetDateRanges,
  type DateRange,
  type StorePerformance,
} from '@/services/analyticsService';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6'];

const Performance = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>(getPresetDateRanges().last7Days);
  const [performance, setPerformance] = useState<StorePerformance | null>(null);

  useEffect(() => {
    if (user?.storeId) {
      loadPerformance();
    }
  }, [user?.storeId, dateRange]);

  const loadPerformance = async () => {
    if (!user?.storeId) return;

    try {
      setLoading(true);
      console.log('📊 Carregando performance...');

      const data = await getStorePerformance(user.storeId, dateRange);
      setPerformance(data);

      console.log('✅ Performance carregada');
    } catch (error) {
      console.error('❌ Erro ao carregar performance:', error);
      toast({
        title: 'Erro ao carregar dados',
        description: 'Não foi possível carregar o desempenho da loja',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const formatNumber = (value: number) => {
    return value.toLocaleString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!performance) {
    return (
      <div className="text-center text-muted-foreground py-12">
        Nenhum dado disponível para o período selecionado
      </div>
    );
  }

  const kpis = [
    {
      title: 'Faturamento Bruto',
      value: formatCurrency(performance.revenue),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
    },
    {
      title: 'Total de Pedidos',
      value: formatNumber(performance.totalOrders),
      icon: ShoppingBag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    },
    {
      title: 'Ticket Médio',
      value: formatCurrency(performance.averageTicket),
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    },
    {
      title: 'Clientes Únicos',
      value: formatNumber(performance.newCustomers),
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Desempenho da Loja</h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe as métricas principais do seu negócio
          </p>
        </div>
        <div className="flex gap-2">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{kpi.title}</p>
                  <p className="text-2xl font-bold mt-2">{kpi.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${kpi.bgColor}`}>
                  <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução de Vendas */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução de Vendas</CardTitle>
            <CardDescription>Faturamento e pedidos por dia</CardDescription>
          </CardHeader>
          <CardContent>
            {performance.dailyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performance.dailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getDate()}/${date.getMonth() + 1}`;
                    }}
                  />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip
                    formatter={(value: number, name: string) => {
                      if (name === 'revenue') {
                        return [formatCurrency(value), 'Faturamento'];
                      }
                      return [value, 'Pedidos'];
                    }}
                    labelFormatter={(label) => {
                      const date = new Date(label);
                      return date.toLocaleDateString('pt-BR');
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Faturamento"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="orders"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Pedidos"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pedidos por Status */}
        <Card>
          <CardHeader>
            <CardTitle>Pedidos por Status</CardTitle>
            <CardDescription>Distribuição dos pedidos</CardDescription>
          </CardHeader>
          <CardContent>
            {performance.ordersByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={performance.ordersByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.status}: ${entry.count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {performance.ordersByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name, props: any) => [
                      `${value} pedidos (${props.payload.percentage.toFixed(1)}%)`,
                      props.payload.status,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Insights Rápidos */}
      <Card>
        <CardHeader>
          <CardTitle>Insights Rápidos</CardTitle>
          <CardDescription>Resumo do período selecionado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950/30">
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(performance.revenue)}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Faturamento Total
              </div>
              {performance.totalOrders > 0 && (
                <div className="flex items-center justify-center gap-1 mt-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-green-600">
                    {performance.totalOrders} pedidos
                  </span>
                </div>
              )}
            </div>

            <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30">
              <div className="text-3xl font-bold text-blue-600">
                {formatCurrency(performance.averageTicket)}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Ticket Médio</div>
              <div className="text-xs text-muted-foreground mt-2">
                Por pedido
              </div>
            </div>

            <div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-950/30">
              <div className="text-3xl font-bold text-purple-600">
                {performance.newCustomers}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Clientes Únicos
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                No período
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Performance;
