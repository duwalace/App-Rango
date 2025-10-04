/**
 * OperationsSupport.tsx
 * Ferramentas operacionais e de suporte para o super admin
 * Busca universal de pedidos e fila de aprovações
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Search,
  Package,
  Store,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  MapPin
} from "lucide-react";
import { findOrderById, getPendingStores, updateStoreStatus } from "@/services/adminService";
import { useToast } from "@/hooks/use-toast";

export default function OperationsSupport() {
  const [orderId, setOrderId] = useState("");
  const [orderResult, setOrderResult] = useState<any | null>(null);
  const [searchingOrder, setSearchingOrder] = useState(false);
  const [orderDialog, setOrderDialog] = useState(false);
  
  const [pendingStores, setPendingStores] = useState<any[]>([]);
  const [loadingStores, setLoadingStores] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    loadPendingStores();
  }, []);

  const loadPendingStores = async () => {
    setLoadingStores(true);
    try {
      const stores = await getPendingStores();
      setPendingStores(stores);
    } catch (error) {
      console.error('Erro ao carregar lojas pendentes:', error);
    } finally {
      setLoadingStores(false);
    }
  };

  const handleSearchOrder = async () => {
    if (!orderId.trim()) {
      toast({
        title: 'Atenção',
        description: 'Digite um ID de pedido para buscar',
        variant: 'destructive',
      });
      return;
    }

    setSearchingOrder(true);
    try {
      const order = await findOrderById(orderId.trim());
      setOrderResult(order);
      setOrderDialog(true);
    } catch (error) {
      console.error('Erro ao buscar pedido:', error);
      toast({
        title: 'Pedido não encontrado',
        description: `Nenhum pedido com o ID "${orderId}" foi encontrado`,
        variant: 'destructive',
      });
    } finally {
      setSearchingOrder(false);
    }
  };

  const handleApproveStore = async (storeId: string, storeName: string) => {
    try {
      await updateStoreStatus(storeId, 'approved', true);
      toast({
        title: 'Loja Aprovada',
        description: `${storeName} foi aprovada com sucesso`,
      });
      loadPendingStores();
    } catch (error) {
      console.error('Erro ao aprovar loja:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível aprovar a loja',
        variant: 'destructive',
      });
    }
  };

  const handleRejectStore = async (storeId: string, storeName: string) => {
    try {
      await updateStoreStatus(storeId, 'rejected', false);
      toast({
        title: 'Loja Rejeitada',
        description: `${storeName} foi rejeitada`,
        variant: 'destructive',
      });
      loadPendingStores();
    } catch (error) {
      console.error('Erro ao rejeitar loja:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível rejeitar a loja',
        variant: 'destructive',
      });
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

  const getOrderStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
      pending: { label: 'Pendente', variant: 'secondary' },
      confirmed: { label: 'Confirmado', variant: 'default' },
      preparing: { label: 'Preparando', variant: 'default' },
      ready: { label: 'Pronto', variant: 'default' },
      delivering: { label: 'Em Entrega', variant: 'default' },
      delivered: { label: 'Entregue', variant: 'default' },
      cancelled: { label: 'Cancelado', variant: 'destructive' },
    };
    const config = statusMap[status] || { label: status, variant: 'secondary' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Operações e Suporte</h1>
        <p className="text-muted-foreground">Ferramentas para gerenciar operações diárias</p>
      </div>

      {/* Busca Universal de Pedidos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Busca Universal de Pedidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Digite o ID do pedido..."
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchOrder()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearchOrder} disabled={searchingOrder}>
              {searchingOrder ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Buscar Pedido
                </>
              )}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Busque pedidos de qualquer loja da plataforma instantaneamente
          </p>
        </CardContent>
      </Card>

      {/* Fila de Aprovação de Lojas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Lojas Pendentes de Aprovação
              <Badge variant="secondary">{pendingStores.length}</Badge>
            </CardTitle>
            <Button onClick={loadPendingStores} variant="outline" size="sm">
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingStores ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : pendingStores.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma loja pendente de aprovação</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome da Loja</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Data de Cadastro</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingStores.map((store) => (
                  <TableRow key={store.id}>
                    <TableCell className="font-medium">{store.name}</TableCell>
                    <TableCell>{store.category || '-'}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{store.contact?.phone || '-'}</div>
                        <div className="text-muted-foreground">{store.contact?.email || '-'}</div>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(store.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleApproveStore(store.id, store.name)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Aprovar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRejectStore(store.id, store.name)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Rejeitar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Alertas Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Nenhum alerta no momento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pedidos Atrasados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Nenhum pedido atrasado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Entregadores Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Sistema de rastreamento em desenvolvimento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Dialog de Detalhes do Pedido */}
      <Dialog open={orderDialog} onOpenChange={setOrderDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Pedido</DialogTitle>
            <DialogDescription>
              Informações completas do pedido #{orderResult?.id?.slice(0, 8)}
            </DialogDescription>
          </DialogHeader>
          {orderResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">ID do Pedido</p>
                  <p className="text-sm text-muted-foreground font-mono">{orderResult.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  {getOrderStatusBadge(orderResult.status || 'pending')}
                </div>
                <div>
                  <p className="text-sm font-medium">Loja</p>
                  <p className="text-sm text-muted-foreground">{orderResult.storeName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Cliente</p>
                  <p className="text-sm text-muted-foreground">{orderResult.customerName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Data/Hora</p>
                  <p className="text-sm text-muted-foreground">{formatDate(orderResult.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Total</p>
                  <p className="text-sm font-semibold text-green-600">
                    {formatCurrency(orderResult.total || 0)}
                  </p>
                </div>
              </div>

              {orderResult.items && orderResult.items.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Itens do Pedido</p>
                  <div className="border rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
                    {orderResult.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.name}</span>
                        <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {orderResult.deliveryAddress && (
                <div>
                  <p className="text-sm font-medium mb-1">Endereço de Entrega</p>
                  <p className="text-sm text-muted-foreground">
                    {orderResult.deliveryAddress.street}, {orderResult.deliveryAddress.number}
                    {orderResult.deliveryAddress.complement && ` - ${orderResult.deliveryAddress.complement}`}
                    <br />
                    {orderResult.deliveryAddress.neighborhood} - {orderResult.deliveryAddress.city}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

