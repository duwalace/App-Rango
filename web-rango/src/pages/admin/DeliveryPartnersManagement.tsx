/**
 * DeliveryPartnersManagement.tsx
 * Painel Admin - Gestão de Entregadores (Nova Arquitetura)
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  Phone,
  Mail,
  MapPin,
  User,
  Car,
  AlertTriangle,
  Percent,
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { 
  DeliveryPartner, 
  DeliveryPartnerFilters,
  DeliveryPartnerStats,
  VEHICLE_TYPE_LABELS
} from "@/types/delivery";
import {
  getDeliveryPartners,
  getDeliveryPartnerStats,
  approveDeliveryPartner,
  rejectDeliveryPartner,
  suspendDeliveryPartner,
  reactivateDeliveryPartner
} from "@/services/deliveryPartnerService";

export default function DeliveryPartnersManagement() {
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [stats, setStats] = useState<DeliveryPartnerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("pending_approval");
  const [selectedPartner, setSelectedPartner] = useState<DeliveryPartner | null>(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    action: "approve" | "reject" | "suspend" | "reactivate" | null;
    partner: DeliveryPartner | null;
  }>({ open: false, action: null, partner: null });
  const [rejectionReason, setRejectionReason] = useState("");
  
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [partnersData, statsData] = await Promise.all([
        getDeliveryPartners(),
        getDeliveryPartnerStats()
      ]);
      
      setPartners(partnersData);
      setStats(statsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!actionDialog.partner || !user) return;

    try {
      await approveDeliveryPartner(actionDialog.partner.id, user.uid);

      toast({
        title: 'Entregador Aprovado',
        description: `${actionDialog.partner.full_name} foi aprovado com sucesso`,
      });

      setActionDialog({ open: false, action: null, partner: null });
      loadData();
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
    if (!actionDialog.partner || !rejectionReason.trim() || !user) {
      toast({
        title: 'Atenção',
        description: 'Por favor, informe o motivo da rejeição',
        variant: 'destructive',
      });
      return;
    }

    try {
      await rejectDeliveryPartner(actionDialog.partner.id, rejectionReason, user.uid);

      toast({
        title: 'Cadastro Rejeitado',
        description: `Cadastro de ${actionDialog.partner.full_name} foi rejeitado`,
      });

      setActionDialog({ open: false, action: null, partner: null });
      setRejectionReason("");
      loadData();
    } catch (error) {
      console.error('Erro ao rejeitar:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível rejeitar o cadastro',
        variant: 'destructive',
      });
    }
  };

  const handleSuspend = async () => {
    if (!actionDialog.partner || !user) return;

    try {
      await suspendDeliveryPartner(actionDialog.partner.id, "Suspenso pelo administrador", user.uid);

      toast({
        title: 'Entregador Suspenso',
        description: `${actionDialog.partner.full_name} foi suspenso`,
      });

      setActionDialog({ open: false, action: null, partner: null });
      loadData();
    } catch (error) {
      console.error('Erro ao suspender:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível suspender o entregador',
        variant: 'destructive',
      });
    }
  };

  const handleReactivate = async () => {
    if (!actionDialog.partner || !user) return;

    try {
      await reactivateDeliveryPartner(actionDialog.partner.id, user.uid);

      toast({
        title: 'Entregador Reativado',
        description: `${actionDialog.partner.full_name} foi reativado`,
      });

      setActionDialog({ open: false, action: null, partner: null });
      loadData();
    } catch (error) {
      console.error('Erro ao reativar:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível reativar o entregador',
        variant: 'destructive',
      });
    }
  };

  const filterPartners = (approvalStatus: string) => {
    let filtered = partners;
    
    // Filtrar por status de aprovação
    if (approvalStatus !== 'all') {
      filtered = filtered.filter(p => p.approval_status.status === approvalStatus);
    }
    
    // Filtrar por busca
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.full_name.toLowerCase().includes(search) ||
        p.email.toLowerCase().includes(search) ||
        p.phone.includes(search)
      );
    }
    
    return filtered;
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (partner: DeliveryPartner) => {
    const status = partner.approval_status.status;
    
    if (status === 'pending') {
      return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
    } else if (status === 'approved' && partner.status === 'active') {
      return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Ativo</Badge>;
    } else if (status === 'approved' && partner.status === 'suspended') {
      return <Badge variant="destructive"><Ban className="h-3 w-3 mr-1" />Suspenso</Badge>;
    } else if (status === 'rejected') {
      return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejeitado</Badge>;
    }
    
    return <Badge>-</Badge>;
  };

  const getOperationalBadge = (status: string) => {
    if (status === 'online_idle') {
      return <Badge variant="default" className="bg-green-500"><Activity className="h-3 w-3 mr-1" />Online</Badge>;
    } else if (status === 'on_delivery') {
      return <Badge variant="default" className="bg-blue-500"><Package className="h-3 w-3 mr-1" />Em entrega</Badge>;
    }
    return <Badge variant="secondary">Offline</Badge>;
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
        <Button onClick={loadData} variant="outline">
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
            <div className="text-2xl font-bold">{stats?.total_partners || 0}</div>
            <p className="text-xs text-muted-foreground">Cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pending_approval || 0}</div>
            <p className="text-xs text-muted-foreground">Aguardando</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.active_partners || 0}</div>
            <p className="text-xs text-muted-foreground">Aprovados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.online_partners || 0}</div>
            <p className="text-xs text-muted-foreground">Disponíveis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entregas</CardTitle>
            <Package className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.on_delivery_partners || 0}</div>
            <p className="text-xs text-muted-foreground">Agora</p>
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending_approval">
            Pendentes
            {stats && stats.pending_approval > 0 && (
              <Badge variant="destructive" className="ml-2">
                {stats.pending_approval}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Aprovados</TabsTrigger>
          <TabsTrigger value="rejected">Rejeitados</TabsTrigger>
          <TabsTrigger value="all">Todos</TabsTrigger>
        </TabsList>

        {["pending", "approved", "rejected", "all"].map((tab) => (
          <TabsContent key={tab} value={tab}>
            <Card>
              <CardHeader>
                <CardTitle>
                  {tab === "all" ? "Todos os Entregadores" : 
                   tab === "pending" ? "Aguardando Aprovação" :
                   tab === "approved" ? "Entregadores Aprovados" :
                   "Cadastros Rejeitados"}
                </CardTitle>
                <CardDescription>
                  {filterPartners(tab).length} entregador(es) encontrado(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Veículo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Operacional</TableHead>
                      <TableHead>Entregas</TableHead>
                      <TableHead>Avaliação</TableHead>
                      <TableHead>Cadastro</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filterPartners(tab).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                          Nenhum entregador encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      filterPartners(tab).map((partner) => (
                        <TableRow key={partner.id}>
                          <TableCell className="font-medium">{partner.full_name}</TableCell>
                          <TableCell>
                            <div className="text-sm space-y-1">
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                <span className="truncate max-w-[200px]">{partner.email}</span>
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                {partner.phone}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Car className="h-4 w-4" />
                              {VEHICLE_TYPE_LABELS[partner.vehicle.type]}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(partner)}</TableCell>
                          <TableCell>{getOperationalBadge(partner.operational_status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Package className="h-3 w-3" />
                              {partner.metrics.completed_deliveries}
                            </div>
                          </TableCell>
                          <TableCell>
                            {partner.metrics.average_rating > 0 ? (
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                {partner.metrics.average_rating.toFixed(1)}
                                <span className="text-xs text-muted-foreground">
                                  ({partner.metrics.total_ratings})
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(partner.created_at)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedPartner(partner);
                                  setDetailsDialog(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              
                              {partner.approval_status.status === 'pending' && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setActionDialog({ 
                                      open: true, 
                                      action: 'approve', 
                                      partner 
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
                                      partner 
                                    })}
                                  >
                                    <XCircle className="h-4 w-4 text-red-500" />
                                  </Button>
                                </>
                              )}
                              
                              {partner.status === 'active' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setActionDialog({ 
                                    open: true, 
                                    action: 'suspend', 
                                    partner 
                                  })}
                                >
                                  <Ban className="h-4 w-4 text-red-500" />
                                </Button>
                              )}
                              
                              {partner.status === 'suspended' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setActionDialog({ 
                                    open: true, 
                                    action: 'reactivate', 
                                    partner 
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Entregador</DialogTitle>
            <DialogDescription>
              Informações completas do cadastro
            </DialogDescription>
          </DialogHeader>

          {selectedPartner && (
            <div className="space-y-6">
              {/* Info básica */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {selectedPartner.full_name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedPartner.email}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Telefone</p>
                    <p className="font-medium">{selectedPartner.phone}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Veículo</p>
                    <p className="font-medium">{VEHICLE_TYPE_LABELS[selectedPartner.vehicle.type]}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Entregas Completas</p>
                    <p className="font-medium">{selectedPartner.metrics.completed_deliveries}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Métricas */}
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Package className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <div className="text-2xl font-bold">{selectedPartner.metrics.completed_deliveries}</div>
                    <p className="text-xs text-muted-foreground">Entregas</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Star className="h-8 w-8 mx-auto mb-2 text-yellow-500 fill-yellow-500" />
                    <div className="text-2xl font-bold">{selectedPartner.metrics.average_rating.toFixed(1)}</div>
                    <p className="text-xs text-muted-foreground">Avaliação</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Percent className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <div className="text-2xl font-bold">{selectedPartner.metrics.acceptance_rate.toFixed(0)}%</div>
                    <p className="text-xs text-muted-foreground">Aceitação</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <div className="text-2xl font-bold">R$ {selectedPartner.metrics.current_balance.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">Saldo</p>
                  </CardContent>
                </Card>
              </div>

              {/* Ações */}
              {selectedPartner.approval_status.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      setDetailsDialog(false);
                      setActionDialog({ open: true, action: 'approve', partner: selectedPartner });
                    }}
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Aprovar
                  </Button>
                  <Button
                    className="flex-1"
                    variant="destructive"
                    onClick={() => {
                      setDetailsDialog(false);
                      setActionDialog({ open: true, action: 'reject', partner: selectedPartner });
                    }}
                  >
                    <XCircle className="h-5 w-5 mr-2" />
                    Rejeitar
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Dialog */}
      <Dialog 
        open={actionDialog.open} 
        onOpenChange={(open) => {
          if (!open) {
            setActionDialog({ open: false, action: null, partner: null });
            setRejectionReason("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.action === 'approve' && 'Aprovar Entregador'}
              {actionDialog.action === 'reject' && 'Rejeitar Cadastro'}
              {actionDialog.action === 'suspend' && 'Suspender Entregador'}
              {actionDialog.action === 'reactivate' && 'Reativar Entregador'}
            </DialogTitle>
            <DialogDescription>
              {actionDialog.action === 'approve' && 
                'O entregador poderá começar a receber corridas.'}
              {actionDialog.action === 'reject' && 
                'Informe o motivo da rejeição.'}
              {actionDialog.action === 'suspend' && 
                'O entregador será suspenso e não poderá receber corridas.'}
              {actionDialog.action === 'reactivate' && 
                'O entregador voltará a ter acesso à plataforma.'}
            </DialogDescription>
          </DialogHeader>

          {actionDialog.action === 'reject' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Motivo da rejeição</label>
              <Textarea
                placeholder="Ex: Documentos inválidos, veículo não aprovado..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
              />
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setActionDialog({ open: false, action: null, partner: null });
                setRejectionReason("");
              }}
            >
              Cancelar
            </Button>
            <Button
              variant={actionDialog.action === 'approve' || actionDialog.action === 'reactivate' ? 'default' : 'destructive'}
              onClick={() => {
                if (actionDialog.action === 'approve') handleApprove();
                else if (actionDialog.action === 'reject') handleReject();
                else if (actionDialog.action === 'suspend') handleSuspend();
                else if (actionDialog.action === 'reactivate') handleReactivate();
              }}
            >
              {actionDialog.action === 'approve' && 'Aprovar'}
              {actionDialog.action === 'reject' && 'Rejeitar'}
              {actionDialog.action === 'suspend' && 'Suspender'}
              {actionDialog.action === 'reactivate' && 'Reativar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

