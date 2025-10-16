import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Users,
  UserPlus,
  Activity,
  TrendingUp,
  Search,
  Filter,
  Download,
  MoreVertical,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ShoppingBag,
  DollarSign,
  Star,
  Tag,
  Clock,
  MessageSquare,
  Gift,
  Crown,
  Sparkles,
  UserCheck,
  UserX,
  Plus,
  X,
  ChevronDown,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  getStoreCustomers,
  calculateCustomerStats,
  getCustomerOrders,
  updateCustomerNotes as saveCustomerNotes,
  getCustomerNotes,
  exportCustomersToCSV,
  type Customer,
  type CustomerOrder,
} from '@/services/customersService';

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export default function Customers() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [segmentFilter, setSegmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [customerNotes, setCustomerNotes] = useState('');
  const [customerTags, setCustomerTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Carregar clientes ao montar o componente
  useEffect(() => {
    if (user?.storeId) {
      loadCustomers();
    }
  }, [user]);

  const loadCustomers = async () => {
    if (!user?.storeId) return;

    try {
      setLoading(true);
      const data = await getStoreCustomers(user.storeId);
      setCustomers(data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      toast({
        title: '❌ Erro',
        description: 'Não foi possível carregar os clientes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Mock Data (removido - agora usa dados reais)
  const [mockCustomers] = useState<Customer[]>([
    {
      id: '1',
      name: 'Ana Silva Santos',
      email: 'ana.silva@email.com',
      phone: '(11) 98765-4321',
      address: 'Rua das Flores, 123 - São Paulo, SP',
      createdAt: new Date('2023-01-15'),
      lastOrderAt: new Date('2024-02-01'),
      totalOrders: 42,
      totalSpent: 2450.80,
      averageTicket: 58.35,
      segment: 'vip',
      status: 'active',
      tags: ['VIP', 'Delivery', 'Pizza Lover'],
      notes: 'Cliente preferencial. Gosta de pizzas com borda recheada.',
      favoriteItems: ['Pizza Margherita', 'Refrigerante 2L'],
      rating: 5,
    },
    {
      id: '2',
      name: 'Carlos Eduardo Souza',
      email: 'carlos.souza@email.com',
      phone: '(11) 97654-3210',
      address: 'Av. Paulista, 1000 - São Paulo, SP',
      createdAt: new Date('2023-06-20'),
      lastOrderAt: new Date('2024-01-30'),
      totalOrders: 18,
      totalSpent: 890.50,
      averageTicket: 49.47,
      segment: 'regular',
      status: 'active',
      tags: ['Regular', 'Almoço'],
      notes: '',
      favoriteItems: ['Hambúrguer Artesanal', 'Batata Frita'],
      rating: 4,
    },
    {
      id: '3',
      name: 'Mariana Costa Lima',
      email: 'mariana.lima@email.com',
      phone: '(21) 99876-5432',
      address: 'Rua do Comércio, 456 - Rio de Janeiro, RJ',
      createdAt: new Date('2024-01-10'),
      lastOrderAt: new Date('2024-01-28'),
      totalOrders: 3,
      totalSpent: 145.90,
      averageTicket: 48.63,
      segment: 'new',
      status: 'active',
      tags: ['Novo Cliente'],
      notes: 'Pediu cupom de desconto.',
      favoriteItems: ['Salada Caesar'],
      rating: 5,
    },
    {
      id: '4',
      name: 'Pedro Henrique Oliveira',
      email: 'pedro.oliveira@email.com',
      phone: '(11) 96543-2109',
      address: 'Rua Augusta, 789 - São Paulo, SP',
      createdAt: new Date('2022-08-05'),
      lastOrderAt: new Date('2023-10-15'),
      totalOrders: 8,
      totalSpent: 320.00,
      averageTicket: 40.00,
      segment: 'inactive',
      status: 'inactive',
      tags: ['Inativo'],
      notes: 'Cliente sem pedidos há mais de 3 meses.',
      favoriteItems: [],
      rating: 3,
    },
    {
      id: '5',
      name: 'Juliana Fernandes Rocha',
      email: 'juliana.rocha@email.com',
      phone: '(11) 95432-1098',
      address: 'Rua dos Pinheiros, 321 - São Paulo, SP',
      createdAt: new Date('2023-03-12'),
      lastOrderAt: new Date('2024-02-02'),
      totalOrders: 35,
      totalSpent: 1680.00,
      averageTicket: 48.00,
      segment: 'vip',
      status: 'active',
      tags: ['VIP', 'Vegetariana', 'Retirada'],
      notes: 'Prefere opções vegetarianas. Sempre retira no local.',
      favoriteItems: ['Pizza Vegetariana', 'Suco Natural'],
      rating: 5,
    },
    {
      id: '6',
      name: 'Roberto Carlos Martins',
      email: 'roberto.martins@email.com',
      phone: '(11) 94321-0987',
      address: 'Av. Brigadeiro, 555 - São Paulo, SP',
      createdAt: new Date('2023-09-01'),
      lastOrderAt: new Date('2024-01-25'),
      totalOrders: 12,
      totalSpent: 560.00,
      averageTicket: 46.67,
      segment: 'regular',
      status: 'active',
      tags: ['Regular', 'Final de Semana'],
      notes: '',
      favoriteItems: ['Churrasco', 'Cerveja'],
      rating: 4,
    },
  ]);

  // Stats
  const stats = useMemo(() => {
    return calculateCustomerStats(customers);
  }, [customers]);

  // Filtered Customers
  const filteredCustomers = useMemo(() => {
    let filtered = [...customers];

    // Search
    if (searchQuery) {
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery)
      );
    }

    // Segment
    if (segmentFilter !== 'all') {
      filtered = filtered.filter(c => c.segment === segmentFilter);
    }

    // Status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    return filtered.sort((a, b) => b.totalSpent - a.totalSpent);
  }, [customers, searchQuery, segmentFilter, statusFilter]);

  const getSegmentBadge = (segment: Customer['segment']) => {
    const config = {
      vip: { label: 'VIP', icon: Crown, className: 'bg-purple-100 text-purple-700 border-purple-300' },
      regular: { label: 'Regular', icon: UserCheck, className: 'bg-blue-100 text-blue-700 border-blue-300' },
      new: { label: 'Novo', icon: Sparkles, className: 'bg-green-100 text-green-700 border-green-300' },
      inactive: { label: 'Inativo', icon: UserX, className: 'bg-gray-100 text-gray-700 border-gray-300' },
    };

    const { label, icon: Icon, className } = config[segment];

    return (
      <Badge variant="outline" className={`gap-1 ${className}`}>
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const handleOpenDetails = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDetailsModal(true);
    
    // Carregar notas salvas do Firebase
    const savedNotes = await getCustomerNotes(customer.id);
    if (savedNotes) {
      setCustomerNotes(savedNotes.notes);
      setCustomerTags(savedNotes.tags);
    } else {
      setCustomerNotes(customer.notes);
      setCustomerTags(customer.tags);
    }

    // Carregar histórico de pedidos
    if (user?.storeId) {
      setLoadingOrders(true);
      try {
        const orders = await getCustomerOrders(user.storeId, customer.id);
        setCustomerOrders(orders);
      } catch (error) {
        console.error('Erro ao carregar pedidos:', error);
      } finally {
        setLoadingOrders(false);
      }
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !customerTags.includes(newTag.trim())) {
      setCustomerTags([...customerTags, newTag.trim()]);
      setNewTag('');
      toast({ title: '✅ Tag adicionada!' });
    }
  };

  const handleRemoveTag = (tag: string) => {
    setCustomerTags(customerTags.filter(t => t !== tag));
    toast({ title: '✅ Tag removida!' });
  };

  const handleSaveNotes = async () => {
    if (!selectedCustomer) return;

    try {
      await saveCustomerNotes(selectedCustomer.id, customerNotes, customerTags);
      toast({ title: '✅ Notas salvas com sucesso!' });
      setShowDetailsModal(false);
    } catch (error) {
      toast({
        title: '❌ Erro',
        description: 'Não foi possível salvar as notas',
        variant: 'destructive',
      });
    }
  };

  const handleExport = () => {
    exportCustomersToCSV(filteredCustomers);
    toast({ 
      title: '✅ Exportação concluída', 
      description: 'O arquivo CSV foi baixado com sucesso' 
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Carregando base de clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Base de Clientes (CRM)</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie e analise sua base de clientes
          </p>
        </div>
        <Button onClick={handleExport} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar Dados
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-lg border-2">
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

        <Card className="shadow-lg border-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Novos (30 dias)</p>
                <p className="text-2xl font-bold mt-1">{stats.newThisMonth}</p>
              </div>
              <UserPlus className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Clientes Ativos</p>
                <p className="text-2xl font-bold mt-1">{stats.activeCustomers}</p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ticket Médio</p>
                <p className="text-2xl font-bold mt-1">
                  {stats.averageTicket.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-lg border-2">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, email ou telefone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={segmentFilter} onValueChange={setSegmentFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Segmentos</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
                <SelectItem value="regular">Regular</SelectItem>
                <SelectItem value="new">Novo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Customers List */}
      <Card className="shadow-lg border-2">
        <CardHeader>
          <CardTitle className="text-2xl">Clientes</CardTitle>
          <CardDescription className="text-base">
            {filteredCustomers.length} {filteredCustomers.length === 1 ? 'cliente encontrado' : 'clientes encontrados'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum cliente encontrado</h3>
              <p className="text-muted-foreground">
                Tente ajustar os filtros ou busca
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className="p-5 border-2 rounded-lg hover:shadow-md transition-all bg-white dark:bg-gray-800"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Customer Info */}
                    <div className="flex items-start gap-4 flex-1">
                      {/* Avatar */}
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-lg">
                          {customer.name.charAt(0).toUpperCase()}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-lg truncate">{customer.name}</h3>
                          {getSegmentBadge(customer.segment)}
                          {customer.rating === 5 && (
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{customer.email}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span>{customer.phone}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{customer.address.split('-')[0]}</span>
                          </div>
                        </div>

                        {/* Tags */}
                        {customer.tags.length > 0 && (
                          <div className="flex items-center gap-2 flex-wrap mb-3">
                            {customer.tags.map((tag, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                <Tag className="h-2 w-2 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Total Gasto</p>
                            <p className="font-bold text-green-600">
                              {customer.totalSpent.toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Pedidos</p>
                            <p className="font-bold">{customer.totalOrders}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Ticket Médio</p>
                            <p className="font-bold">
                              {customer.averageTicket.toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Último Pedido</p>
                            <p className="font-medium text-sm">
                              {customer.lastOrderAt
                                ? new Date(customer.lastOrderAt).toLocaleDateString('pt-BR')
                                : 'Nunca'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDetails(customer)}
                      >
                        Ver Detalhes
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Mail className="h-4 w-4 mr-2" />
                            Enviar Email
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Phone className="h-4 w-4 mr-2" />
                            Ligar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Gift className="h-4 w-4 mr-2" />
                            Enviar Cupom
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <UserX className="h-4 w-4 mr-2" />
                            Desativar Cliente
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {selectedCustomer?.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  {selectedCustomer?.name}
                  {selectedCustomer && getSegmentBadge(selectedCustomer.segment)}
                </div>
                <p className="text-sm text-muted-foreground font-normal">
                  Cliente desde {selectedCustomer?.createdAt.toLocaleDateString('pt-BR')}
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="info" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">Informações</TabsTrigger>
              <TabsTrigger value="orders">Histórico ({selectedCustomer?.totalOrders})</TabsTrigger>
              <TabsTrigger value="notes">Notas & Tags</TabsTrigger>
            </TabsList>

            {/* Tab: Info */}
            <TabsContent value="info" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contato</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedCustomer?.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedCustomer?.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedCustomer?.address}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Estatísticas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        <p className="text-sm text-muted-foreground">Total Gasto</p>
                      </div>
                      <p className="text-2xl font-bold text-green-600">
                        {selectedCustomer?.totalSpent.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </p>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2 mb-2">
                        <ShoppingBag className="h-5 w-5 text-blue-600" />
                        <p className="text-sm text-muted-foreground">Total de Pedidos</p>
                      </div>
                      <p className="text-2xl font-bold text-blue-600">
                        {selectedCustomer?.totalOrders}
                      </p>
                    </div>

                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-2 border-purple-200 dark:border-purple-800">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                        <p className="text-sm text-muted-foreground">Ticket Médio</p>
                      </div>
                      <p className="text-2xl font-bold text-purple-600">
                        {selectedCustomer?.averageTicket.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </p>
                    </div>

                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-2 border-orange-200 dark:border-orange-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-5 w-5 text-orange-600" />
                        <p className="text-sm text-muted-foreground">Último Pedido</p>
                      </div>
                      <p className="text-lg font-bold text-orange-600">
                        {selectedCustomer?.lastOrderAt
                          ? new Date(selectedCustomer.lastOrderAt).toLocaleDateString('pt-BR')
                          : 'Nunca'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {selectedCustomer?.favoriteItems && selectedCustomer.favoriteItems.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      Itens Favoritos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedCustomer.favoriteItems.map((item, idx) => (
                        <Badge key={idx} variant="secondary" className="text-sm">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Tab: Orders */}
            <TabsContent value="orders" className="space-y-3">
              {loadingOrders ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Carregando pedidos...</p>
                </div>
              ) : customerOrders.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-muted-foreground">Nenhum pedido encontrado</p>
                </div>
              ) : (
                customerOrders.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                            <ShoppingBag className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold">Pedido #{order.id.slice(-6).toUpperCase()}</p>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {order.date.toLocaleDateString('pt-BR')}
                              </span>
                              <span>{order.items} itens</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-green-600">
                            {order.total.toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            })}
                          </p>
                          <Badge variant="outline" className="mt-1">
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* Tab: Notes & Tags */}
            <TabsContent value="notes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tags</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {customerTags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="gap-1 text-sm">
                        <Tag className="h-3 w-3" />
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Nova tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    />
                    <Button onClick={handleAddTag} size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Notas Internas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Adicione observações sobre este cliente..."
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    rows={6}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
              Fechar
            </Button>
            <Button onClick={handleSaveNotes}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 