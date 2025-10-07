/**
 * DeliveryManagement.tsx
 * Painel Admin - Gestão completa de entregadores
 * Aprovação de cadastros, monitoramento em tempo real, histórico
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Bike,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Activity,
  Clock,
  Star,
  DollarSign,
  Package,
  Ban,
  Shield,
  RefreshCw,
  FileText,
  Phone,
  Mail,
  MapPin,
  TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { collection, query, where, getDocs, doc, updateDoc, onSnapshot, getDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface DeliveryPerson {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  vehicle: {
    type: 'bike' | 'motorcycle' | 'car';
    plate?: string;
  };
  documents: {
    cnh?: string;
    profilePhoto?: string;
    vehicleDocument?: string;
  };
  address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'blocked';
  availability: 'online' | 'offline';
  stats: {
    totalEarnings: number;
    completedDeliveries: number;
    rating: number;
    reviewCount: number;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  rejectionReason?: string;
}

interface Trip {
  id: string;
  deliveryPersonId: string | null;
  deliveryPersonName: string | null;
  orderId: string;
  storeId: string;
  storeName: string;
  deliveryFee: number;
  totalValue: number;
  status: 'pending' | 'assigned' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled' | 'rejected';
  createdAt: Timestamp;
  deliveryTime: Timestamp | null;
}

export default function DeliveryManagement() {
  const [deliveryPersons, setDeliveryPersons] = useState<DeliveryPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryPerson | null>(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    action: "approve" | "reject" | "block" | "unblock" | null;
    delivery: DeliveryPerson | null;
  }>({ open: false, action: null, delivery: null });
  const [rejectionReason, setRejectionReason] = useState("");
  const [deliveryTrips, setDeliveryTrips] = useState<Trip[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadDeliveryPersons();
  }, []);

  const loadDeliveryPersons = async () => {
    setLoading(true);
    try {
      const deliveryCollection = collection(db, 'deliveryPersons');
      const querySnapshot = await getDocs(deliveryCollection);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DeliveryPerson[];
      
      setDeliveryPersons(data);
    } catch (error) {
      console.error('Erro ao carregar entregadores:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os entregadores',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (delivery: DeliveryPerson) => {
    setSelectedDelivery(delivery);
    
    // Carregar histórico de corridas do entregador
    try {
      const tripsQuery = query(
        collection(db, 'trips'),
        where('deliveryPersonId', '==', delivery.id)
      );
      const tripsSnapshot = await getDocs(tripsQuery);
      const trips = tripsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Trip[];
      
      setDeliveryTrips(trips.sort((a, b) => 
        b.createdAt.toMillis() - a.createdAt.toMillis()
      ));
    } catch (error) {
      console.error('Erro ao carregar corridas:', error);
    }
    
    setDetailsDialog(true);
  };

  const handleApprove = async () => {
    if (!actionDialog.delivery) return;

    try {
      const deliveryRef = doc(db, 'deliveryPersons', actionDialog.delivery.id);
      await updateDoc(deliveryRef, {
        status: 'approved',
        updatedAt: Timestamp.now()
      });

      toast({
        title: 'Entregador Aprovado',
        description: `${actionDialog.delivery.name} foi aprovado com sucesso`,
      });

      setActionDialog({ open: false, action: null, delivery: null });
      loadDeliveryPersons();
    } catch (error) {
      console.error('Erro ao aprovar:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível aprovar o entregador',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async () => {
    if (!actionDialog.delivery || !rejectionReason.trim()) {
      toast({
        title: 'Atenção',
        description: 'Por favor, informe o motivo da rejeição',
        variant: 'destructive',
      });
      return;
    }

    try {
      const deliveryRef = doc(db, 'deliveryPersons', actionDialog.delivery.id);
      await updateDoc(deliveryRef, {
        status: 'rejected',
        rejectionReason: rejectionReason,
        updatedAt: Timestamp.now()
      });

      toast({
        title: 'Cadastro Rejeitado',
        description: `Cadastro de ${actionDialog.delivery.name} foi rejeitado`,
      });

      setActionDialog({ open: false, action: null, delivery: null });
      setRejectionReason("");
      loadDeliveryPersons();
    } catch (error) {
      console.error('Erro ao rejeitar:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível rejeitar o cadastro',
        variant: 'destructive',
      });
    }
  };

  const handleBlock = async () => {
    if (!actionDialog.delivery) return;

    try {
      const deliveryRef = doc(db, 'deliveryPersons', actionDialog.delivery.id);
      const newStatus = actionDialog.action === 'block' ? 'blocked' : 'approved';
      
      await updateDoc(deliveryRef, {
        status: newStatus,
        availability: 'offline', // Força offline ao bloquear
        updatedAt: Timestamp.now()
      });

      toast({
        title: actionDialog.action === 'block' ? 'Entregador Bloqueado' : 'Entregador Desbloqueado',
        description: `${actionDialog.delivery.name} foi ${actionDialog.action === 'block' ? 'bloqueado' : 'desbloqueado'}`,
      });

      setActionDialog({ open: false, action: null, delivery: null });
      loadDeliveryPersons();
    } catch (error) {
      console.error('Erro ao bloquear/desbloquear:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível executar a ação',
        variant: 'destructive',
      });
    }
  };

  const filterDeliveryPersons = (status: string) => {
    let filtered = deliveryPersons;
    
    if (status !== 'all') {
      filtered = filtered.filter(d => d.status === status);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(d =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.phone.includes(searchTerm)
      );
    }
    
    return filtered;
  };

  const formatDate = (timestamp: Timestamp | null | undefined) => {
    if (!timestamp) return '-';
    return timestamp.toDate().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string; icon: any }> = {
      pending: { variant: 'default', label: 'Pendente', icon: Clock },
      approved: { variant: 'default', label: 'Aprovado', icon: CheckCircle },
      rejected: { variant: 'destructive', label: 'Rejeitado', icon: XCircle },
      blocked: { variant: 'destructive', label: 'Bloqueado', icon: Ban }
    };
    
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getAvailabilityBadge = (availability: string) => {
    if (availability === 'online') {
      return <Badge variant="default"><Activity className="h-3 w-3 mr-1" />Online</Badge>;
    }
    return <Badge variant="secondary">Offline</Badge>;
  };

  const getVehicleLabel = (type: string) => {
    const labels: Record<string, string> = {
      bike: 'Bicicleta',
      motorcycle: 'Moto',
      car: 'Carro'
    };
    return labels[type] || type;
  };

  const getTripStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      pending: { variant: 'secondary', label: 'Pendente' },
      assigned: { variant: 'default', label: 'Atribuída' },
      accepted: { variant: 'default', label: 'Aceita' },
      picked_up: { variant: 'default', label: 'Coletada' },
      delivered: { variant: 'default', label: 'Entregue' },
      cancelled: { variant: 'destructive', label: 'Cancelada' },
      rejected: { variant: 'destructive', label: 'Rejeitada' }
    };
    
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Estatísticas gerais
  const stats = {
    total: deliveryPersons.length,
    pending: deliveryPersons.filter(d => d.status === 'pending').length,
    approved: deliveryPersons.filter(d => d.status === 'approved').length,
    online: deliveryPersons.filter(d => d.availability === 'online').length,
    blocked: deliveryPersons.filter(d => d.status === 'blocked').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando entregadores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Entregadores</h1>
          <p className="text-muted-foreground">Aprove cadastros, monitore performance e gerencie a frota</p>
        </div>
        <Button onClick={loadDeliveryPersons} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Bike className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Entregadores cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Aguardando aprovação</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">Ativos na plataforma</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.online}</div>
            <p className="text-xs text-muted-foreground">Disponíveis agora</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bloqueados</CardTitle>
            <Ban className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.blocked}</div>
            <p className="text-xs text-muted-foreground">Suspensos</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="pending">
            Pendentes
            {stats.pending > 0 && (
              <Badge variant="destructive" className="ml-2 animate-pulse">
                {stats.pending}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Aprovados</TabsTrigger>
          <TabsTrigger value="rejected">Rejeitados</TabsTrigger>
          <TabsTrigger value="blocked">Bloqueados</TabsTrigger>
          <TabsTrigger value="all">Todos</TabsTrigger>
        </TabsList>

        {["pending", "approved", "rejected", "blocked", "all"].map((status) => (
          <TabsContent key={status} value={status}>
            <Card>
              <CardHeader>
                <CardTitle>
                  {status === "all" ? "Todos os Entregadores" : 
                   status === "pending" ? "Aguardando Aprovação" :
                   status === "approved" ? "Entregadores Aprovados" :
                   status === "rejected" ? "Cadastros Rejeitados" :
                   "Entregadores Bloqueados"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Veículo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Disponibilidade</TableHead>
                      <TableHead>Corridas</TableHead>
                      <TableHead>Avaliação</TableHead>
                      <TableHead>Cadastro</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filterDeliveryPersons(status).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                          Nenhum entregador encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      filterDeliveryPersons(status).map((delivery) => (
                        <TableRow key={delivery.id}>
                          <TableCell className="font-medium">{delivery.name}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {delivery.email}
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                {delivery.phone}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Bike className="h-4 w-4" />
                              {getVehicleLabel(delivery.vehicle.type)}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(delivery.status)}</TableCell>
                          <TableCell>{getAvailabilityBadge(delivery.availability)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Package className="h-3 w-3" />
                              {delivery.stats?.completedDeliveries || 0}
                            </div>
                          </TableCell>
                          <TableCell>
                            {delivery.stats?.rating > 0 ? (
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                {delivery.stats.rating.toFixed(1)}
                                <span className="text-xs text-muted-foreground">
                                  ({delivery.stats.reviewCount})
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">Sem avaliações</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(delivery.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetails(delivery)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              
                              {delivery.status === 'pending' && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setActionDialog({ 
                                      open: true, 
                                      action: 'approve', 
                                      delivery 
                                    })}
                                  >
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setActionDialog({ 
                                      open: true, 
                                      action: 'reject', 
                                      delivery 
                                    })}
                                  >
                                    <XCircle className="h-4 w-4 text-red-500" />
                                  </Button>
                                </>
                              )}
                              
                              {delivery.status === 'approved' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setActionDialog({ 
                                    open: true, 
                                    action: 'block', 
                                    delivery 
                                  })}
                                >
                                  <Ban className="h-4 w-4 text-red-500" />
                                </Button>
                              )}
                              
                              {delivery.status === 'blocked' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setActionDialog({ 
                                    open: true, 
                                    action: 'unblock', 
                                    delivery 
                                  })}
                                >
                                  <Shield className="h-4 w-4 text-green-500" />
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
        ))}
      </Tabs>

      {/* Details Dialog */}
      <Dialog open={detailsDialog} onOpenChange={setDetailsDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Entregador</DialogTitle>
            <DialogDescription>
              Informações completas e histórico de corridas
            </DialogDescription>
          </DialogHeader>

          {selectedDelivery && (
            <div className="space-y-6">
              {/* Dados Pessoais */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Dados Pessoais
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Nome:</span>
                    <p className="font-medium">{selectedDelivery.name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">CPF:</span>
                    <p className="font-medium">{selectedDelivery.cpf}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p className="font-medium">{selectedDelivery.email}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Telefone:</span>
                    <p className="font-medium">{selectedDelivery.phone}</p>
                  </div>
                </div>
              </div>

              {/* Endereço */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Endereço
                </h3>
                <p className="text-sm">
                  {selectedDelivery.address.street}, {selectedDelivery.address.number} - {selectedDelivery.address.neighborhood}
                  <br />
                  {selectedDelivery.address.city}/{selectedDelivery.address.state} - CEP: {selectedDelivery.address.zipCode}
                </p>
              </div>

              {/* Veículo */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Bike className="h-4 w-4" />
                  Veículo
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Tipo:</span>
                    <p className="font-medium">{getVehicleLabel(selectedDelivery.vehicle.type)}</p>
                  </div>
                  {selectedDelivery.vehicle.plate && (
                    <div>
                      <span className="text-muted-foreground">Placa:</span>
                      <p className="font-medium">{selectedDelivery.vehicle.plate}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Estatísticas */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Performance
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <Package className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                        <div className="text-2xl font-bold">{selectedDelivery.stats?.completedDeliveries || 0}</div>
                        <p className="text-xs text-muted-foreground">Entregas</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <DollarSign className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                        <div className="text-2xl font-bold">R$ {selectedDelivery.stats?.totalEarnings?.toFixed(2) || '0.00'}</div>
                        <p className="text-xs text-muted-foreground">Ganhos</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <Star className="h-5 w-5 mx-auto mb-2 text-yellow-400 fill-yellow-400" />
                        <div className="text-2xl font-bold">{selectedDelivery.stats?.rating?.toFixed(1) || '0.0'}</div>
                        <p className="text-xs text-muted-foreground">Avaliação</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <Activity className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                        <div className="text-2xl font-bold">{selectedDelivery.stats?.reviewCount || 0}</div>
                        <p className="text-xs text-muted-foreground">Reviews</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Histórico de Corridas */}
              <div>
                <h3 className="font-semibold mb-3">Histórico de Corridas ({deliveryTrips.length})</h3>
                {deliveryTrips.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma corrida registrada
                  </p>
                ) : (
                  <div className="max-h-60 overflow-y-auto border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Loja</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Taxa</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {deliveryTrips.map((trip) => (
                          <TableRow key={trip.id}>
                            <TableCell className="text-sm">{formatDate(trip.createdAt)}</TableCell>
                            <TableCell className="text-sm">{trip.storeName}</TableCell>
                            <TableCell className="text-sm">R$ {trip.totalValue.toFixed(2)}</TableCell>
                            <TableCell className="text-sm font-medium text-green-600">
                              R$ {trip.deliveryFee.toFixed(2)}
                            </TableCell>
                            <TableCell>{getTripStatusBadge(trip.status)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              {/* Status Info */}
              {selectedDelivery.status === 'rejected' && selectedDelivery.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <h4 className="font-semibold text-red-800 mb-1">Motivo da Rejeição</h4>
                  <p className="text-sm text-red-700">{selectedDelivery.rejectionReason}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Dialogs */}
      <Dialog 
        open={actionDialog.open} 
        onOpenChange={(open) => {
          if (!open) {
            setActionDialog({ open: false, action: null, delivery: null });
            setRejectionReason("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.action === 'approve' && 'Aprovar Entregador'}
              {actionDialog.action === 'reject' && 'Rejeitar Cadastro'}
              {actionDialog.action === 'block' && 'Bloquear Entregador'}
              {actionDialog.action === 'unblock' && 'Desbloquear Entregador'}
            </DialogTitle>
            <DialogDescription>
              {actionDialog.action === 'approve' && 
                'Ao aprovar, o entregador poderá começar a receber corridas.'}
              {actionDialog.action === 'reject' && 
                'Informe o motivo da rejeição. O entregador será notificado.'}
              {actionDialog.action === 'block' && 
                'O entregador será bloqueado e não poderá receber novas corridas.'}
              {actionDialog.action === 'unblock' && 
                'O entregador voltará a ter acesso à plataforma.'}
            </DialogDescription>
          </DialogHeader>

          {actionDialog.action === 'reject' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Motivo da rejeição</label>
              <Input
                placeholder="Ex: Documentos inválidos, veículo não aprovado..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setActionDialog({ open: false, action: null, delivery: null });
                setRejectionReason("");
              }}
            >
              Cancelar
            </Button>
            <Button
              variant={actionDialog.action === 'approve' || actionDialog.action === 'unblock' ? 'default' : 'destructive'}
              onClick={() => {
                if (actionDialog.action === 'approve') handleApprove();
                else if (actionDialog.action === 'reject') handleReject();
                else if (actionDialog.action === 'block' || actionDialog.action === 'unblock') handleBlock();
              }}
            >
              {actionDialog.action === 'approve' && 'Aprovar'}
              {actionDialog.action === 'reject' && 'Rejeitar'}
              {actionDialog.action === 'block' && 'Bloquear'}
              {actionDialog.action === 'unblock' && 'Desbloquear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
