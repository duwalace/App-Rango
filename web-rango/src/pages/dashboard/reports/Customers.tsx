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
import { Users, UserPlus, Repeat, Loader2, Download, ArrowUpDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { DateRangePicker } from '@/components/DateRangePicker';
import {
  getCustomerAnalytics,
  getPresetDateRanges,
  exportToCSV,
  type DateRange,
  type CustomerAnalytics,
} from '@/services/analyticsService';
import { Badge } from '@/components/ui/badge';

type SortField = 'customerName' | 'totalOrders' | 'totalSpent' | 'lastOrderDate';
type SortDirection = 'asc' | 'desc';

const Customers = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>(getPresetDateRanges().thisMonth);
  const [analytics, setAnalytics] = useState<CustomerAnalytics | null>(null);
  const [sortField, setSortField] = useState<SortField>('totalSpent');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  useEffect(() => {
    if (user?.storeId) {
      loadCustomerAnalytics();
    }
  }, [user?.storeId, dateRange]);

  const loadCustomerAnalytics = async () => {
    if (!user?.storeId) return;

    try {
      setLoading(true);
      console.log('👥 Carregando análise de clientes...');

      const data = await getCustomerAnalytics(user.storeId, dateRange);
      setAnalytics(data);

      console.log('✅ Análise de clientes carregada');
    } catch (error) {
      console.error('❌ Erro ao carregar análise:', error);
      toast({
        title: 'Erro ao carregar dados',
        description: 'Não foi possível carregar a análise de clientes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!analytics || analytics.customers.length === 0) {
      toast({
        title: 'Nenhum dado para exportar',
        description: 'Não há clientes no período',
        variant: 'destructive',
      });
      return;
    }

    const dataToExport = analytics.customers.map((customer) => ({
      Cliente: customer.customerName,
      Email: customer.customerEmail,
      'Total de Pedidos': customer.totalOrders,
      'Total Gasto': customer.totalSpent.toFixed(2),
      'Último Pedido': customer.lastOrderDate.toLocaleDateString('pt-BR'),
      'Primeiro Pedido': customer.firstOrderDate.toLocaleDateString('pt-BR'),
    }));

    exportToCSV(dataToExport, `analise-clientes-${new Date().toISOString().split('T')[0]}`);

    toast({
      title: '✅ Exportado com sucesso!',
      description: `${analytics.customers.length} clientes exportados para CSV`,
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

  const getSortedCustomers = () => {
    if (!analytics) return [];

    const sorted = [...analytics.customers].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'customerName':
          comparison = a.customerName.localeCompare(b.customerName);
          break;
        case 'totalOrders':
          comparison = a.totalOrders - b.totalOrders;
          break;
        case 'totalSpent':
          comparison = a.totalSpent - b.totalSpent;
          break;
        case 'lastOrderDate':
          comparison = a.lastOrderDate.getTime() - b.lastOrderDate.getTime();
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

  const getCustomerBadge = (totalOrders: number) => {
    if (totalOrders >= 10) {
      return <Badge className="bg-purple-600">VIP</Badge>;
    } else if (totalOrders >= 5) {
      return <Badge className="bg-blue-600">Frequente</Badge>;
    } else if (totalOrders > 1) {
      return <Badge variant="secondary">Recorrente</Badge>;
    } else {
      return <Badge variant="outline">Novo</Badge>;
    }
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

  const sortedCustomers = getSortedCustomers();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Análise de Clientes</h1>
          <p className="text-muted-foreground mt-1">
            Identifique seus clientes mais valiosos
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
                <p className="text-sm text-muted-foreground">Total de Clientes</p>
                <p className="text-2xl font-bold mt-2">{analytics.summary.totalCustomers}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Novos Clientes</p>
                <p className="text-2xl font-bold mt-2">{analytics.summary.newCustomers}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics.summary.totalCustomers > 0
                    ? `${((analytics.summary.newCustomers / analytics.summary.totalCustomers) * 100).toFixed(1)}% do total`
                    : ''}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30">
                <UserPlus className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Clientes Recorrentes</p>
                <p className="text-2xl font-bold mt-2">{analytics.summary.recurringCustomers}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics.summary.totalCustomers > 0
                    ? `${((analytics.summary.recurringCustomers / analytics.summary.totalCustomers) * 100).toFixed(1)}% do total`
                    : ''}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30">
                <Repeat className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Clientes */}
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Clientes por Valor Gasto</CardTitle>
          <CardDescription>Seus clientes mais valiosos</CardDescription>
        </CardHeader>
        <CardContent>
          {sortedCustomers.slice(0, 5).length > 0 ? (
            <div className="space-y-4">
              {sortedCustomers.slice(0, 5).map((customer, index) => (
                <div
                  key={customer.customerId}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">#{index + 1}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{customer.customerName}</p>
                        {getCustomerBadge(customer.totalOrders)}
                      </div>
                      <p className="text-sm text-muted-foreground">{customer.customerEmail}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      {formatCurrency(customer.totalSpent)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {customer.totalOrders} pedido(s)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              Nenhum cliente encontrado
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabela de Todos os Clientes */}
      <Card>
        <CardHeader>
          <CardTitle>Todos os Clientes</CardTitle>
          <CardDescription>
            {sortedCustomers.length} cliente(s) encontrado(s) no período
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedCustomers.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort('customerName')}
                        className="h-8 px-2"
                      >
                        Cliente
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort('totalOrders')}
                        className="h-8 px-2"
                      >
                        Pedidos
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort('totalSpent')}
                        className="h-8 px-2"
                      >
                        Total Gasto
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort('lastOrderDate')}
                        className="h-8 px-2"
                      >
                        Último Pedido
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Classificação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedCustomers.map((customer) => (
                    <TableRow key={customer.customerId}>
                      <TableCell className="font-medium">
                        {customer.customerName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {customer.customerEmail || '-'}
                      </TableCell>
                      <TableCell className="text-right">{customer.totalOrders}</TableCell>
                      <TableCell className="text-right font-semibold text-green-600">
                        {formatCurrency(customer.totalSpent)}
                      </TableCell>
                      <TableCell className="text-right">
                        {customer.lastOrderDate.toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>{getCustomerBadge(customer.totalOrders)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-12">
              Nenhum cliente encontrado no período selecionado
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Customers;
