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
import {
  DollarSign,
  Download,
  Loader2,
  TrendingUp,
  TrendingDown,
  FileText,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { DateRangePicker } from '@/components/DateRangePicker';
import {
  getFinancialReport,
  getPresetDateRanges,
  exportToCSV,
  type DateRange,
  type FinancialReport,
} from '@/services/analyticsService';
import { Badge } from '@/components/ui/badge';

const Financial = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>(getPresetDateRanges().thisMonth);
  const [report, setReport] = useState<FinancialReport | null>(null);

  useEffect(() => {
    if (user?.storeId) {
      loadFinancialReport();
    }
  }, [user?.storeId, dateRange]);

  const loadFinancialReport = async () => {
    if (!user?.storeId) return;

    try {
      setLoading(true);
      console.log('💰 Carregando relatório financeiro...');

      const data = await getFinancialReport(user.storeId, dateRange);
      setReport(data);

      console.log('✅ Relatório financeiro carregado');
    } catch (error) {
      console.error('❌ Erro ao carregar relatório:', error);
      toast({
        title: 'Erro ao carregar dados',
        description: 'Não foi possível carregar o relatório financeiro',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!report || report.orders.length === 0) {
      toast({
        title: 'Nenhum dado para exportar',
        description: 'Não há pedidos no período selecionado',
        variant: 'destructive',
      });
      return;
    }

    const dataToExport = report.orders.map((order) => ({
      Data: order.date.toLocaleDateString('pt-BR'),
      'ID Pedido': order.id,
      Cliente: order.customerName,
      'Valor Itens': order.itemsTotal.toFixed(2),
      'Taxa Entrega': order.deliveryFee.toFixed(2),
      'Comissão (12%)': order.platformFee.toFixed(2),
      'Valor Líquido': order.netAmount.toFixed(2),
      Status: order.status,
    }));

    exportToCSV(dataToExport, `relatorio-financeiro-${new Date().toISOString().split('T')[0]}`);

    toast({
      title: '✅ Exportado com sucesso!',
      description: `${report.orders.length} pedidos exportados para CSV`,
    });
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
      completed: { label: 'Concluído', variant: 'default' },
      delivered: { label: 'Entregue', variant: 'default' },
      pending: { label: 'Pendente', variant: 'secondary' },
      cancelled: { label: 'Cancelado', variant: 'destructive' },
    };

    const statusInfo = statusMap[status] || { label: status, variant: 'secondary' };

    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center text-muted-foreground py-12">
        Nenhum dado disponível para o período selecionado
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Relatório Financeiro</h1>
          <p className="text-muted-foreground mt-1">
            Visão detalhada de todas as transações
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

      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Faturamento Bruto</p>
                <p className="text-2xl font-bold mt-2">
                  {formatCurrency(report.summary.grossRevenue)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Entrega</p>
                <p className="text-2xl font-bold mt-2">
                  {formatCurrency(report.summary.deliveryFee)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Comissão Plataforma</p>
                <p className="text-2xl font-bold mt-2 text-orange-600">
                  -{formatCurrency(report.summary.platformFee)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/30">
                <TrendingDown className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valor Líquido</p>
                <p className="text-2xl font-bold mt-2 text-green-600">
                  {formatCurrency(report.summary.netRevenue)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Pedidos */}
      <Card>
        <CardHeader>
          <CardTitle>Pedidos Detalhados</CardTitle>
          <CardDescription>
            {report.totalCount} pedido(s) encontrado(s) no período
          </CardDescription>
        </CardHeader>
        <CardContent>
          {report.orders.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="text-right">Valor Itens</TableHead>
                    <TableHead className="text-right">Taxa Entrega</TableHead>
                    <TableHead className="text-right">Comissão (12%)</TableHead>
                    <TableHead className="text-right">Valor Líquido</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.date.toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}...</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(order.itemsTotal)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(order.deliveryFee)}
                      </TableCell>
                      <TableCell className="text-right text-orange-600">
                        -{formatCurrency(order.platformFee)}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-green-600">
                        {formatCurrency(order.netAmount)}
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-12">
              Nenhum pedido encontrado no período selecionado
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informações Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Relatório</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <p className="text-muted-foreground">Comissão da Plataforma</p>
              <p className="font-medium mt-1">12% sobre o valor dos itens</p>
            </div>
            <div>
              <p className="text-muted-foreground">Taxa de Entrega</p>
              <p className="font-medium mt-1">100% para a loja</p>
            </div>
            <div>
              <p className="text-muted-foreground">Período do Relatório</p>
              <p className="font-medium mt-1">
                {dateRange.startDate.toLocaleDateString('pt-BR')} até{' '}
                {dateRange.endDate.toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Financial;
