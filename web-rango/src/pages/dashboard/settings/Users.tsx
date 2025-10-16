import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  getStoreTeamMembers,
  inviteTeamMember,
  updateMemberRole,
  removeTeamMember,
  getPendingInvites,
  type TeamMember,
} from '@/services/userManagementService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  UserPlus,
  Mail,
  Shield,
  Trash2,
  MoreVertical,
  Crown,
  User,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';

const roleLabels = {
  owner: 'Proprietário',
  admin: 'Administrador',
  manager: 'Gerente',
  staff: 'Equipe',
};

const roleDescriptions = {
  owner: 'Acesso total e controle sobre configurações da loja',
  admin: 'Pode gerenciar produtos, pedidos e equipe',
  manager: 'Pode gerenciar produtos e pedidos',
  staff: 'Pode visualizar e atualizar status de pedidos',
};

export default function Users() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TeamMember | null>(null);

  const [inviteData, setInviteData] = useState({
    email: '',
    name: '',
    role: 'staff' as TeamMember['role'],
  });

  const [team, setTeam] = useState<TeamMember[]>([]);
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);

  useEffect(() => {
    if (user?.storeId) {
      loadTeam();
    }
  }, [user?.storeId]);

  const loadTeam = async () => {
    if (!user?.storeId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('📋 Carregando equipe da loja:', user.storeId);

      const [members, invites] = await Promise.all([
        getStoreTeamMembers(user.storeId),
        getPendingInvites(user.storeId),
      ]);

      setTeam(members);
      setPendingInvites(invites);
      
      console.log('✅ Equipe carregada:', members.length, 'membros');
      console.log('✅ Convites pendentes:', invites.length);
    } catch (error) {
      console.error('❌ Erro ao carregar equipe:', error);
      toast({
        title: 'Erro ao carregar equipe',
        description: 'Não foi possível carregar os membros da equipe',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteData.email || !inviteData.name) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha nome e email',
        variant: 'destructive',
      });
      return;
    }

    if (!user?.storeId) {
      toast({
        title: 'Erro',
        description: 'Loja não identificada',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      
      await inviteTeamMember({
        email: inviteData.email,
        name: inviteData.name,
        role: inviteData.role,
        storeId: user.storeId,
      });

      toast({
        title: '✅ Convite enviado!',
        description: `Um convite foi criado para ${inviteData.email}`,
      });

      setShowInviteModal(false);
      setInviteData({ email: '', name: '', role: 'staff' });
      
      // Recarregar a lista
      await loadTeam();
    } catch (error: any) {
      console.error('❌ Erro ao enviar convite:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível enviar o convite',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!deleteTarget) return;

    try {
      setLoading(true);
      
      await removeTeamMember(deleteTarget.id);

      toast({
        title: '✅ Usuário removido',
        description: `${deleteTarget.name} foi removido da equipe`,
      });

      setDeleteTarget(null);
      
      // Recarregar a lista
      await loadTeam();
    } catch (error: any) {
      console.error('❌ Erro ao remover usuário:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível remover o usuário',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: TeamMember['role']) => {
    try {
      setLoading(true);
      
      await updateMemberRole(memberId, newRole);

      toast({
        title: '✅ Permissão atualizada',
        description: 'As permissões foram atualizadas com sucesso',
      });
      
      // Recarregar a lista
      await loadTeam();
    } catch (error: any) {
      console.error('❌ Erro ao atualizar permissões:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível atualizar as permissões',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: TeamMember['role']) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4" />;
      case 'admin':
        return <Shield className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: TeamMember['status']) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="default" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Ativo
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            Pendente
          </Badge>
        );
      case 'suspended':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Suspenso
          </Badge>
        );
    }
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Usuários</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie a equipe que tem acesso ao dashboard
          </p>
        </div>
        <Button onClick={() => setShowInviteModal(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Convidar Usuário
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total de Usuários</div>
            <div className="text-2xl font-bold mt-1">{team.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Ativos</div>
            <div className="text-2xl font-bold text-green-600 mt-1">
              {team.filter((m) => m.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Pendentes</div>
            <div className="text-2xl font-bold text-orange-600 mt-1">
              {team.filter((m) => m.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle>Membros da Equipe</CardTitle>
          <CardDescription>
            Gerencie permissões e acesso dos membros da equipe
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {team.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-semibold text-primary">
                    {member.name.charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{member.name}</span>
                    {member.role === 'owner' && (
                      <Badge variant="secondary" className="gap-1">
                        <Crown className="h-3 w-3" />
                        Dono
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    {member.email}
                  </div>
                </div>

                {/* Status */}
                <div>{getStatusBadge(member.status)}</div>

                {/* Role */}
                {member.role !== 'owner' ? (
                  <Select
                    value={member.role}
                    onValueChange={(value) =>
                      handleUpdateRole(member.id, value as TeamMember['role'])
                    }
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          {getRoleIcon('admin')}
                          {roleLabels.admin}
                        </div>
                      </SelectItem>
                      <SelectItem value="manager">
                        <div className="flex items-center gap-2">
                          {getRoleIcon('manager')}
                          {roleLabels.manager}
                        </div>
                      </SelectItem>
                      <SelectItem value="staff">
                        <div className="flex items-center gap-2">
                          {getRoleIcon('staff')}
                          {roleLabels.staff}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="outline" className="w-48 justify-center gap-2">
                    {getRoleIcon('owner')}
                    {roleLabels.owner}
                  </Badge>
                )}

                {/* Actions */}
                {member.role !== 'owner' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteTarget(member)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Permissions Info */}
      <Card>
        <CardHeader>
          <CardTitle>Níveis de Permissão</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(roleLabels).map(([role, label]) => (
            <div key={role} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
              <div className="mt-0.5">{getRoleIcon(role as TeamMember['role'])}</div>
              <div className="flex-1">
                <div className="font-medium">{label}</div>
                <div className="text-sm text-muted-foreground">
                  {roleDescriptions[role as keyof typeof roleDescriptions]}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Invite Modal */}
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convidar Novo Usuário</DialogTitle>
            <DialogDescription>
              Envie um convite por email para adicionar um membro à equipe
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Nome Completo *</Label>
              <Input
                value={inviteData.name}
                onChange={(e) =>
                  setInviteData({ ...inviteData, name: e.target.value })
                }
                placeholder="João Silva"
              />
            </div>

            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={inviteData.email}
                onChange={(e) =>
                  setInviteData({ ...inviteData, email: e.target.value })
                }
                placeholder="joao@exemplo.com"
              />
            </div>

            <div>
              <Label>Nível de Permissão</Label>
              <Select
                value={inviteData.role}
                onValueChange={(value) =>
                  setInviteData({ ...inviteData, role: value as TeamMember['role'] })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">{roleLabels.admin}</SelectItem>
                  <SelectItem value="manager">{roleLabels.manager}</SelectItem>
                  <SelectItem value="staff">{roleLabels.staff}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">
                {roleDescriptions[inviteData.role]}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleInvite}>Enviar Convite</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Usuário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover <strong>{deleteTarget?.name}</strong> da equipe?
              Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              className="bg-red-600 hover:bg-red-700"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 