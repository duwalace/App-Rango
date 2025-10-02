import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  UserPlus,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Star,
  Crown,
  Calendar,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CustomerAnalytics {
  id: string;
  name: string;
  email: string;
  orders: number;
  totalSpent: number;
  averageOrder: number;
  lastOrder: Date;
  segment: 'vip' | 'regular' | 'new';
}

export default function CustomersReport() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');

  const [customers] = useState<CustomerAnalytics[]>([
    {
      id: '1',
      name: 'Carlos Silva',
      email: 'carlos@email.com',
      orders: 28,
      totalSpent: 1456.0,
      averageOrder: 52.0,
      lastOrder: new Date('2024-03-10'),
      segment: 'vip',
    },
    {
      id: '2',
      name: 'Ana Santos',
      email: 'ana@email.com',
      orders: 19,
      totalSpent: 987.5,
      averageOrder: 51.97,
      lastOrder: new Date('2024-03-09'),
      segment: 'vip',
    },
    {
      id: '3',
      name: 'Pedro Oliveira',
      email: 'pedro@email.com',
      orders: 12,
      totalSpent: 624.0,
      averageOrder: 52.0,
      lastOrder: new Date('2024-03-08'),
      segment: 'regular',
    },
    {
      id: '4',
      name: 'Maria Costa',
      email: 'maria@email.com',
      orders: 3,
      totalSpent: 187.5,
      averageOrder: 62.5,
      lastOrder: new Date('2024-03-10'),
      segment: 'new',
    },
    {
      id: '5',
      name: 'João Ferreira',
      email: 'joao@email.com',
      orders: 15,
      totalSpent: 780.0,
      averageOrder: 52.0,
      lastOrder: new Date('2024-03-07'),
      segment: 'regular',
    },
  ]);

  const stats = {
    totalCustomers: 243,
    newThisMonth: 18,
    vipCustomers: 12,
    avgLifetimeValue: 425.8,
  };

  const vipCustomers = customers.filter((c) => c.segment === 'vip');
  const newCustomers = customers.filter((c) => c.segment === 'new');

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
          <h1 className="text-3xl font-bold">Análise de Clientes</h1>
          <p className="text-muted-foreground mt-1">
            Comportamento e segmentação da base de clientes
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Clientes</p>
                <p className="text-2xl font-bold mt-1">{stats.totalCustomers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Novos este Mês</p>
                <p className="text-2xl font-bold mt-1 text-green-600">
                  +{stats.newThisMonth}
                </p>
              </div>
              <UserPlus className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Clientes VIP</p>
                <p className="text-2xl font-bold mt-1 text-yellow-600">
                  {stats.vipCustomers}
                </p>
              </div>
              <Crown className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">LTV Médio</p>
                <p className="text-2xl font-bold mt-1">
                  {stats.avgLifetimeValue.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* VIP Customers */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-600" />
                Clientes VIP
              </CardTitle>
              <CardDescription>Seus melhores clientes (10+ pedidos)</CardDescription>
            </div>
            <Badge variant="secondary">{vipCustomers.length} clientes</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {vipCustomers.map((customer, index) => (
            <div
              key={customer.id}
              className="flex items-center gap-4 p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-950/20"
            >
              <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <Crown className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-sm text-muted-foreground">{customer.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      {customer.totalSpent.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {customer.orders} pedidos
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Ticket Médio: </span>
                    <span className="font-medium">
                      {customer.averageOrder.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Último Pedido: </span>
                    <span className="font-medium">
                      {new Date(customer.lastOrder).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* New Customers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-green-600" />
              Novos Clientes
            </CardTitle>
            <CardDescription>Clientes com menos de 5 pedidos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {newCustomers.map((customer) => (
              <div
                key={customer.id}
                className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900"
              >
                <div>
                  <p className="font-medium">{customer.name}</p>
                  <p className="text-xs text-muted-foreground">{customer.email}</p>
                </div>
                <div className="text-right">
                  <Badge variant="default" className="gap-1">
                    <ShoppingBag className="h-3 w-3" />
                    {customer.orders} pedidos
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {customer.totalSpent.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Customer Segments */}
        <Card>
          <CardHeader>
            <CardTitle>Segmentação de Clientes</CardTitle>
            <CardDescription>Distribuição por comportamento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium">VIP (10+ pedidos)</span>
                </div>
                <span className="text-sm font-semibold">{vipCustomers.length}</span>
              </div>
              <Progress
                value={(vipCustomers.length / customers.length) * 100}
                className="h-2"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Regular (5-10 pedidos)</span>
                </div>
                <span className="text-sm font-semibold">
                  {customers.filter((c) => c.segment === 'regular').length}
                </span>
              </div>
              <Progress
                value={
                  (customers.filter((c) => c.segment === 'regular').length /
                    customers.length) *
                  100
                }
                className="h-2"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Novo (&lt;5 pedidos)</span>
                </div>
                <span className="text-sm font-semibold">{newCustomers.length}</span>
              </div>
              <Progress
                value={(newCustomers.length / customers.length) * 100}
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Customers */}
      <Card>
        <CardHeader>
          <CardTitle>Todos os Clientes</CardTitle>
          <CardDescription>Base completa ordenada por valor gasto</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...customers].sort((a, b) => b.totalSpent - a.totalSpent).map((customer) => (
              <div
                key={customer.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-semibold text-primary">
                      {customer.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{customer.name}</p>
                      {customer.segment === 'vip' && (
                        <Crown className="h-4 w-4 text-yellow-600" />
                      )}
                      {customer.segment === 'new' && (
                        <Badge variant="default" className="text-xs">
                          Novo
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{customer.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Pedidos</p>
                    <p className="font-semibold">{customer.orders}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Total Gasto</p>
                    <p className="font-semibold text-green-600">
                      {customer.totalSpent.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Ticket Médio</p>
                    <p className="font-semibold">
                      {customer.averageOrder.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 