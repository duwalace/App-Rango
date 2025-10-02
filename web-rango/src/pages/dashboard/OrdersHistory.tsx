import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Search, TrendingUp, DollarSign, Package } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { subscribeToStoreOrders } from "@/services/orderService";
import { Order, OrderStatus } from "@/types/shared";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const OrdersHistory = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

  // Subscrever a todos os pedidos da loja em tempo real
  useEffect(() => {
    if (!user?.storeId) {
      setLoading(false);
      return;
    }

    console.log('🔵 OrdersHistory: Inscrevendo em pedidos da loja:', user.storeId);
    
    const unsubscribe = subscribeToStoreOrders(user.storeId, (orders) => {
      console.log('✅ OrdersHistory: Pedidos recebidos:', orders);
      setAllOrders(orders);
      setLoading(false);
    });

    return () => {
      console.log('🔴 OrdersHistory: Cancelando inscrição de pedidos');
      unsubscribe();
    };
  }, [user?.storeId]);

  // Helper functions
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDateTime = (date: any) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    return {
      date: dateObj.toLocaleDateString('pt-BR'),
      time: dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  // Filtrar pedidos concluídos (entregues, completos ou cancelados)
  const historyOrders = useMemo(() => {
    let filtered = allOrders.filter(order => 
      order.status === 'delivered' || 
      order.status === 'completed' || 
      order.status === 'cancelled'
    );

    // Filtrar por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Filtrar por busca
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(query) ||
        order.customerName?.toLowerCase().includes(query) ||
        order.customerId?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [allOrders, searchQuery, statusFilter]);

  // Calcular estatísticas
  const stats = useMemo(() => {
    const completedOrders = allOrders.filter(order => 
      order.status === 'delivered' || order.status === 'completed'
    );
    
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.total, 0);
    const averageTicket = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

    return [
      { 
        title: "Total de Pedidos", 
        value: completedOrders.length.toString(), 
        icon: Package
      },
      { 
        title: "Receita Total", 
        value: formatCurrency(totalRevenue), 
        icon: DollarSign
      },
      { 
        title: "Ticket Médio", 
        value: formatCurrency(averageTicket), 
        icon: TrendingUp
      },
    ];
  }, [allOrders]);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "delivered":
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    const labels: Record<OrderStatus, string> = {
      pending: "Pendente",
      confirmed: "Confirmado",
      preparing: "Preparando",
      ready: "Pronto",
      in_delivery: "Em Entrega",
      delivered: "Entregue",
      completed: "Concluído",
      cancelled: "Cancelado"
    };
    return labels[status] || status;
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Histórico de Pedidos</h1>
          <p className="text-muted-foreground mt-2">
            Visualize todos os pedidos realizados • {historyOrders.length} {historyOrders.length === 1 ? 'pedido' : 'pedidos'}
          </p>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtros */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Filtrar Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por cliente ou ID do pedido..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as OrderStatus | 'all')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="delivered">Entregues</SelectItem>
                <SelectItem value="completed">Concluídos</SelectItem>
                <SelectItem value="cancelled">Cancelados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Pedidos */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Pedidos ({historyOrders.length})</CardTitle>
            {searchQuery && (
              <Button variant="ghost" size="sm" onClick={() => setSearchQuery('')}>
                Limpar Busca
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {historyOrders.length > 0 ? (
            <div className="space-y-4">
              {historyOrders.map((order) => {
                const { date, time } = formatDateTime(order.createdAt);
                return (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-smooth"
                  >
                    <div className="grid md:grid-cols-4 gap-4 flex-1">
                      <div>
                        <p className="font-semibold text-foreground">#{order.id.slice(0, 8)}</p>
                        <p className="text-sm text-muted-foreground">{order.customerName || 'Cliente'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-foreground">
                          {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'itens'}
                        </p>
                        <p className="text-xs text-muted-foreground">{date} às {time}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusLabel(order.status)}
                        </Badge>
                        {order.rating && (
                          <span className="text-xs text-muted-foreground">
                            ⭐ {order.rating}/5
                          </span>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <p className="font-bold text-lg text-primary">{formatCurrency(order.total)}</p>
                      </div>
                    </div>
                    
                    <Button variant="ghost" size="sm">
                      Ver Detalhes
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? 'Nenhum pedido encontrado' : 'Nenhum pedido no histórico'}
              </h3>
              <p className="text-muted-foreground">
                {searchQuery 
                  ? 'Tente ajustar os filtros de busca' 
                  : 'Pedidos concluídos aparecerão aqui automaticamente'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdersHistory; 