import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Package, TrendingUp, Loader2, Download, ArrowUpDown } from 'lucide-react';
import {
  BarChart,
  Bar,
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
  getProductAnalytics,
  getPresetDateRanges,
  exportToCSV,
  type DateRange,
  type ProductAnalytics,
} from '@/services/analyticsService';

type SortField = 'productName' | 'quantitySold' | 'revenue' | 'ordersCount';
type SortDirection = 'asc' | 'desc';

const Items = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>(getPresetDateRanges().thisMonth);
  const [analytics, setAnalytics] = useState<ProductAnalytics | null>(null);
  const [sortField, setSortField] = useState<SortField>('revenue');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  useEffect(() => {
    if (user?.storeId) {
      loadProductAnalytics();
    }
  }, [user?.storeId, dateRange]);

  const loadProductAnalytics = async () => {
    if (!user?.storeId) return;

    try {
      setLoading(true);
      console.log('📦 Carregando análise de produtos...');

      const data = await getProductAnalytics(user.storeId, dateRange);
      setAnalytics(data);

      console.log('✅ Análise de produtos carregada');
    } catch (error) {
      console.error('❌ Erro ao carregar análise:', error);
      toast({
        title: 'Erro ao carregar dados',
        description: 'Não foi possível carregar a análise de produtos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!analytics || analytics.products.length === 0) {
      toast({
        title: 'Nenhum dado para exportar',
        description: 'Não há produtos vendidos no período',
        variant: 'destructive',
      });
      return;
    }

    const dataToExport = analytics.products.map((product) => ({
      Produto: product.productName,
      Categoria: product.category,
      'Quantidade Vendida': product.quantitySold,
      Faturamento: product.revenue.toFixed(2),
      'Pedidos': product.ordersCount,
    }));

    exportToCSV(dataToExport, `analise-produtos-${new Date().toISOString().split('T')[0]}`);

    toast({
      title: '✅ Exportado com sucesso!',
      description: `${analytics.products.length} produtos exportados para CSV`,
    });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortedProducts = () => {
    if (!analytics) return [];

    const sorted = [...analytics.products].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'productName':
          comparison = a.productName.localeCompare(b.productName);
          break;
        case 'quantitySold':
          comparison = a.quantitySold - b.quantitySold;
          break;
        case 'revenue':
          comparison = a.revenue - b.revenue;
          break;
        case 'ordersCount':
          comparison = a.ordersCount - b.ordersCount;
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center text-muted-foreground py-12">
        Nenhum dado disponível para o período selecionado
      </div>
    );
  }

  const sortedProducts = getSortedProducts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Análise de Itens</h1>
          <p className="text-muted-foreground mt-1">
            Entenda quais produtos têm melhor desempenho
          </p>
        </div>
        <div className="flex gap-2">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Produtos</p>
                <p className="text-2xl font-bold mt-2">{analytics.products.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Itens Vendidos</p>
                <p className="text-2xl font-bold mt-2">
                  {analytics.products.reduce((sum, p) => sum + p.quantitySold, 0)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Faturamento Total</p>
                <p className="text-2xl font-bold mt-2">
                  {formatCurrency(analytics.products.reduce((sum, p) => sum + p.revenue, 0))}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico Top 10 */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Produtos por Faturamento</CardTitle>
          <CardDescription>Os produtos que mais geram receita</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={analytics.topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="productName"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => `Produto: ${label}`}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#10b981" name="Faturamento" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              Nenhum dado disponível
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabela de Produtos */}
      <Card>
        <CardHeader>
          <CardTitle>Todos os Produtos</CardTitle>
          <CardDescription>
            {sortedProducts.length} produto(s) vendido(s) no período
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedProducts.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort('productName')}
                        className="h-8 px-2"
                      >
                        Produto
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort('quantitySold')}
                        className="h-8 px-2"
                      >
                        Qtd Vendida
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort('revenue')}
                        className="h-8 px-2"
                      >
                        Faturamento
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort('ordersCount')}
                        className="h-8 px-2"
                      >
                        Pedidos
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedProducts.map((product) => (
                    <TableRow key={product.productId}>
                      <TableCell className="font-medium">{product.productName}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {product.category}
                      </TableCell>
                      <TableCell className="text-right">{product.quantitySold}</TableCell>
                      <TableCell className="text-right font-semibold text-green-600">
                        {formatCurrency(product.revenue)}
                      </TableCell>
                      <TableCell className="text-right">{product.ordersCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-12">
              Nenhum produto vendido no período selecionado
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Items;
