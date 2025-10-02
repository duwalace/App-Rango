import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Star,
  AlertTriangle,
  Award,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ItemAnalytics {
  id: string;
  name: string;
  category: string;
  sales: number;
  revenue: number;
  averageRating: number;
  reviewCount: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

export default function ItemsReport() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');

  const [items] = useState<ItemAnalytics[]>([
    {
      id: '1',
      name: 'X-Burger Especial',
      category: 'Hambúrgueres',
      sales: 145,
      revenue: 5075.0,
      averageRating: 4.8,
      reviewCount: 89,
      trend: 'up',
      trendPercentage: 23,
    },
    {
      id: '2',
      name: 'Pizza Margherita',
      category: 'Pizzas',
      sales: 98,
      revenue: 3920.0,
      averageRating: 4.6,
      reviewCount: 62,
      trend: 'up',
      trendPercentage: 15,
    },
    {
      id: '3',
      name: 'Batata Frita Grande',
      category: 'Acompanhamentos',
      sales: 203,
      revenue: 2436.0,
      averageRating: 4.4,
      reviewCount: 128,
      trend: 'stable',
      trendPercentage: 2,
    },
    {
      id: '4',
      name: 'Coca-Cola 2L',
      category: 'Bebidas',
      sales: 187,
      revenue: 1683.0,
      averageRating: 4.9,
      reviewCount: 95,
      trend: 'up',
      trendPercentage: 8,
    },
    {
      id: '5',
      name: 'Salada Caesar',
      category: 'Saladas',
      sales: 34,
      revenue: 816.0,
      averageRating: 4.2,
      reviewCount: 21,
      trend: 'down',
      trendPercentage: -12,
    },
  ]);

  const stats = useMemo(() => {
    const totalSales = items.reduce((sum, item) => sum + item.sales, 0);
    const totalRevenue = items.reduce((sum, item) => sum + item.revenue, 0);
    const avgRating =
      items.reduce((sum, item) => sum + item.averageRating, 0) / items.length;

    return { totalSales, totalRevenue, avgRating };
  }, [items]);

  const topSellers = useMemo(() => {
    return [...items].sort((a, b) => b.sales - a.sales).slice(0, 5);
  }, [items]);

  const topRevenue = useMemo(() => {
    return [...items].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [items]);

  const lowPerformers = useMemo(() => {
    return [...items].sort((a, b) => a.sales - b.sales).slice(0, 3);
  }, [items]);

  useEffect(() => {
    setLoading(false);
  }, []);

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
          <h1 className="text-3xl font-bold">Análise de Itens</h1>
          <p className="text-muted-foreground mt-1">
            Performance de vendas e popularidade dos produtos
          </p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="90">Últimos 90 dias</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Vendas</p>
                <p className="text-2xl font-bold mt-1">{stats.totalSales}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Receita Total</p>
                <p className="text-2xl font-bold mt-1">
                  {stats.totalRevenue.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avaliação Média</p>
                <p className="text-2xl font-bold mt-1 flex items-center gap-1">
                  {stats.avgRating.toFixed(1)}
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Sellers */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-600" />
                Mais Vendidos
              </CardTitle>
              <CardDescription>Produtos com maior volume de vendas</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {topSellers.map((item, index) => (
            <div key={item.id} className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center font-bold text-yellow-600">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{item.sales} vendas</p>
                    <p className="text-sm text-muted-foreground">
                      {item.revenue.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Progress
                    value={(item.sales / topSellers[0].sales) * 100}
                    className="h-2"
                  />
                  {item.trend === 'up' && (
                    <Badge variant="default" className="gap-1 text-xs">
                      <TrendingUp className="h-3 w-3" />
                      {item.trendPercentage}%
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Revenue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Maior Receita
            </CardTitle>
            <CardDescription>Produtos que mais geram receita</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {topRevenue.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-sm font-bold text-green-600">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.sales} vendas
                    </p>
                  </div>
                </div>
                <p className="font-semibold text-green-600">
                  {item.revenue.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Low Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Atenção Necessária
            </CardTitle>
            <CardDescription>Produtos com baixo desempenho</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {lowPerformers.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900"
              >
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-orange-600">
                    {item.sales} vendas
                  </p>
                  {item.trend === 'down' && (
                    <Badge variant="destructive" className="gap-1 text-xs mt-1">
                      <TrendingDown className="h-3 w-3" />
                      {Math.abs(item.trendPercentage)}%
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* All Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Todos os Itens</CardTitle>
          <CardDescription>Performance completa de cada produto</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{item.name}</p>
                    <Badge variant="outline" className="text-xs">
                      {item.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{item.sales} vendas</span>
                    <span>
                      {item.revenue.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {item.averageRating} ({item.reviewCount})
                    </span>
                  </div>
                </div>
                {item.trend === 'up' && (
                  <Badge variant="default" className="gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {item.trendPercentage}%
                  </Badge>
                )}
                {item.trend === 'down' && (
                  <Badge variant="destructive" className="gap-1">
                    <TrendingDown className="h-3 w-3" />
                    {Math.abs(item.trendPercentage)}%
                  </Badge>
                )}
                {item.trend === 'stable' && (
                  <Badge variant="secondary">Estável</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 