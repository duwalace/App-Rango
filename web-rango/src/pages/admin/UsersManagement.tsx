/**
 * UsersManagement.tsx
 * Gestão completa de usuários da plataforma
 * Clientes e Entregadores com ações administrativas
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Users, 
  Truck,
  Search,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  Activity,
  Package,
  RefreshCw
} from "lucide-react";
import { getAllUsers, getUserWithOrders, updateUserStatus, UserData } from "@/services/adminService";
import { useToast } from "@/hooks/use-toast";

export default function UsersManagement() {
  const [customers, setCustomers] = useState<UserData[]>([]);
  const [deliveryPersons, setDeliveryPersons] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userDetailsDialog, setUserDetailsDialog] = useState(false);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    action: "activate" | "deactivate" | null;
    user: UserData | null;
  }>({ open: false, action: null, user: null });
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const [customersData, deliveryData] = await Promise.all([
        getAllUsers('cliente'),
        getAllUsers('entregador')
      ]);

      setCustomers(customersData);
      setDeliveryPersons(deliveryData);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os usuários',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (userId: string) => {
    try {
      const userData = await getUserWithOrders(userId);
      setSelectedUser(userData);
      setUserDetailsDialog(true);
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os detalhes do usuário',
        variant: 'destructive',
      });
    }
  };

  const handleAction = async () => {
    if (!actionDialog.user || !actionDialog.action) return;

    try {
      const isActive = actionDialog.action === "activate";
      await updateUserStatus(actionDialog.user.id, isActive);

      toast({
        title: isActive ? 'Usuário Ativado' : 'Usuário Desativado',
        description: `${actionDialog.user.nome || actionDialog.user.email} foi ${isActive ? 'ativado' : 'desativado'}`,
      });

      setActionDialog({ open: false, action: null, user: null });
      loadUsers();
    } catch (error) {
      console.error('Erro ao executar ação:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível executar a ação',
        variant: 'destructive',
      });
    }
  };

  const filterUsers = (users: UserData[]) => {
    if (!searchTerm) return users;
    return users.filter(user =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.nome?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const formatDate = (date: any) => {
    if (!date) return '-';
    return date.toDate?.().toLocaleDateString('pt-BR') || '-';
  };

  const getStatusBadge = (user: UserData) => {
    if (user.isActive === false) {
      return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Inativo</Badge>;
    }
    if (user.isOnline) {
      return <Badge variant="default"><Activity className="h-3 w-3 mr-1" />Online</Badge>;
    }
    return <Badge variant="secondary"><CheckCircle className="h-3 w-3 mr-1" />Ativo</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando usuários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Usuários</h1>
          <p className="text-muted-foreground">Gerencie clientes e entregadores da plataforma</p>
        </div>
        <Button onClick={loadUsers} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      <Tabs defaultValue="customers" className="w-full">
        <TabsList>
          <TabsTrigger value="customers">
            <Users className="h-4 w-4 mr-2" />
            Clientes ({customers.length})
          </TabsTrigger>
          <TabsTrigger value="delivery">
            <Truck className="h-4 w-4 mr-2" />
            Entregadores ({deliveryPersons.length})
          </TabsTrigger>
        </TabsList>

        {/* TAB: CLIENTES */}
        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Lista de Clientes
                </CardTitle>
                <div className="relative w-72">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data de Cadastro</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filterUsers(customers).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        Nenhum cliente encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filterUsers(customers).map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.nome || 'N/A'}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone || '-'}</TableCell>
                        <TableCell>{getStatusBadge(user)}</TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetails(user.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {user.isActive === false ? (
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => setActionDialog({ open: true, action: "activate", user })}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Ativar
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setActionDialog({ open: true, action: "deactivate", user })}
                              >
                                <Ban className="h-4 w-4 mr-1" />
                                Desativar
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: ENTREGADORES */}
        <TabsContent value="delivery">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Lista de Entregadores
                </CardTitle>
                <div className="relative w-72">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data de Cadastro</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filterUsers(deliveryPersons).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        Nenhum entregador encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filterUsers(deliveryPersons).map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.nome || 'N/A'}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone || '-'}</TableCell>
                        <TableCell>{getStatusBadge(user)}</TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetails(user.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {user.isActive === false ? (
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => setActionDialog({ open: true, action: "activate", user })}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Ativar
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setActionDialog({ open: true, action: "deactivate", user })}
                              >
                                <Ban className="h-4 w-4 mr-1" />
                                Desativar
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de Detalhes do Usuário */}
      <Dialog open={userDetailsDialog} onOpenChange={setUserDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Usuário</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Nome</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.user.nome || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.user.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Role</p>
                  <Badge>{selectedUser.user.role}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  {getStatusBadge(selectedUser.user)}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-4 w-4" />
                  <p className="text-sm font-medium">Histórico de Pedidos ({selectedUser.orders.length})</p>
                </div>
                {selectedUser.orders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum pedido encontrado</p>
                ) : (
                  <div className="border rounded-lg p-3 max-h-64 overflow-y-auto">
                    {selectedUser.orders.slice(0, 5).map((order: any) => (
                      <div key={order.id} className="flex justify-between py-2 border-b last:border-b-0">
                        <span className="text-sm">Pedido #{order.id.slice(0, 8)}</span>
                        <span className="text-sm font-medium">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total || 0)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Ação */}
      <Dialog open={actionDialog.open} onOpenChange={(open) => !open && setActionDialog({ open: false, action: null, user: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Ação</DialogTitle>
            <DialogDescription>
              {actionDialog.action === "activate" && `Tem certeza que deseja ativar "${actionDialog.user?.nome || actionDialog.user?.email}"?`}
              {actionDialog.action === "deactivate" && `Tem certeza que deseja desativar "${actionDialog.user?.nome || actionDialog.user?.email}"? O usuário não poderá mais fazer login.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog({ open: false, action: null, user: null })}>
              Cancelar
            </Button>
            <Button onClick={handleAction}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

