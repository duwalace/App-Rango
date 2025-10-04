/**
 * FinancialManagement.tsx
 * Módulo financeiro global da plataforma
 * Relatórios, transações e repasses para lojas
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  DollarSign,
  TrendingUp,
  Download,
  Calendar,
  FileText,
  RefreshCw
} from "lucide-react";
import { getFinancialTransactions, FinancialTransaction } from "@/services/adminService";
import { KpiCard } from "@/components/admin/KpiCard";
import { useToast } from "@/hooks/use-toast";

export default function FinancialManagement() {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'today' | '7days' | '30days' | 'all'>('30days');
  const { toast } = useToast();

  useEffect(() => {
    loadTransactions();
  }, [period]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      let startDate: Date | undefined;
      const now = new Date();

      if (period === 'today') {
        startDate = new Date(now.setHours(0, 0, 0, 0));
      } else if (period === '7days') {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (period === '30days') {
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      const data = await getFinancialTransactions(startDate);
      setTransactions(data);
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as transações',
        variant: 'destructive',
      });
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

  const formatDate = (date: any) => {
    if (!date) return '-';
    return date.toDate?.().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) || '-';
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      completed: { label: 'Concluído', variant: 'default' },
      pending: { label: 'Pendente', variant: 'secondary' },
      cancelled: { label: 'Cancelado', variant: 'destructive' },
    };
    const config = statusMap[status] || { label: status, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Calcular totais
  const totals = transactions.reduce((acc, t) => ({
    gmv: acc.gmv + t.total,
    platformRevenue: acc.platformRevenue + t.platformCommission + t.platformFee,
    storeAmount: acc.storeAmount + t.storeAmount,
  }), { gmv: 0, platformRevenue: 0, storeAmount: 0 });

  const handleExport = () => {
    // Implementar exportação CSV
    toast({
      title: 'Exportação Iniciada',
      description: 'O relatório está sendo gerado...',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dados financeiros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Financeiro Global</h1>
          <p className="text-muted-foreground">Relatórios financeiros e gestão de repasses</p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="7days">Últimos 7 dias</SelectItem>
              <SelectItem value="30days">Últimos 30 dias</SelectItem>
              <SelectItem value="all">Todos</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadTransactions} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPIs Financeiros */}
      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard
          title="GMV Total"
          value={formatCurrency(totals.gmv)}
          icon={TrendingUp}
          description={`${transactions.length} transações`}
          color="green"
        />

        <KpiCard
          title="Receita da Plataforma"
          value={formatCurrency(totals.platformRevenue)}
          icon={DollarSign}
          description="Comissões + Taxas"
          color="blue"
        />

        <KpiCard
          title="Total para Lojas"
          value={formatCurrency(totals.storeAmount)}
          icon={FileText}
          description="Valores a repassar"
          color="orange"
        />
      </div>

      {/* Tabela de Transações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Transações Detalhadas ({transactions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Pedido</TableHead>
                  <TableHead>Loja</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Comissão (10%)</TableHead>
                  <TableHead className="text-right">Taxa Fixa</TableHead>
                  <TableHead className="text-right">Para Loja</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      Nenhuma transação encontrada no período selecionado
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.slice(0, 50).map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-mono text-xs">
                        #{transaction.orderId.slice(0, 8)}
                      </TableCell>
                      <TableCell>{transaction.storeName}</TableCell>
                      <TableCell className="text-sm">{formatDate(transaction.createdAt)}</TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(transaction.total)}
                      </TableCell>
                      <TableCell className="text-right text-blue-600">
                        {formatCurrency(transaction.platformCommission)}
                      </TableCell>
                      <TableCell className="text-right text-blue-600">
                        {formatCurrency(transaction.platformFee)}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-green-600">
                        {formatCurrency(transaction.storeAmount)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {transactions.length > 50 && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Mostrando 50 de {transactions.length} transações. Use a exportação para ver todos os dados.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card de Resumo por Loja */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo por Loja</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(
              transactions.reduce((acc, t) => {
                if (!acc[t.storeId]) {
                  acc[t.storeId] = {
                    storeName: t.storeName,
                    total: 0,
                    platformRevenue: 0,
                    storeAmount: 0,
                    count: 0
                  };
                }
                acc[t.storeId].total += t.total;
                acc[t.storeId].platformRevenue += t.platformCommission + t.platformFee;
                acc[t.storeId].storeAmount += t.storeAmount;
                acc[t.storeId].count += 1;
                return acc;
              }, {} as Record<string, any>)
            ).slice(0, 10).map(([storeId, data]) => (
              <div key={storeId} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{data.storeName}</p>
                  <p className="text-sm text-muted-foreground">{data.count} pedidos</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-600">
                    {formatCurrency(data.storeAmount)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Total: {formatCurrency(data.total)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

