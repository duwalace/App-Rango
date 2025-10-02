import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
  Bell,
  Send,
  Users,
  TrendingUp,
  Eye,
  Calendar,
  Plus,
  CheckCircle2,
  Clock,
} from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  audience: 'all' | 'vip' | 'new' | 'inactive';
  status: 'sent' | 'scheduled' | 'draft';
  sentAt?: Date;
  scheduledFor?: Date;
  opens: number;
  clicks: number;
}

export default function Notifications() {
  const { toast } = useToast();
  const [showNewModal, setShowNewModal] = useState(false);

  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    audience: 'all' as Notification['audience'],
    scheduleDate: '',
    scheduleTime: '',
  });

  const [notifications] = useState<Notification[]>([
    {
      id: '1',
      title: '🍕 Pizza em Dobro!',
      message: 'Compre 1 pizza e leve 2! Válido só hoje.',
      audience: 'all',
      status: 'sent',
      sentAt: new Date('2024-03-10T14:30:00'),
      opens: 234,
      clicks: 89,
    },
    {
      id: '2',
      title: '⭐ Você é VIP!',
      message: 'Ganhe 20% de desconto em qualquer pedido.',
      audience: 'vip',
      status: 'sent',
      sentAt: new Date('2024-03-09T10:00:00'),
      opens: 45,
      clicks: 32,
    },
    {
      id: '3',
      title: '🎁 Bem-vindo!',
      message: 'Primeiro pedido com 15% OFF. Use: BEMVINDO',
      audience: 'new',
      status: 'scheduled',
      scheduledFor: new Date('2024-03-12T09:00:00'),
      opens: 0,
      clicks: 0,
    },
  ]);

  const stats = {
    totalSent: 487,
    avgOpenRate: 42.3,
    avgClickRate: 18.7,
  };

  const audienceLabels = {
    all: 'Todos os Clientes',
    vip: 'Clientes VIP',
    new: 'Novos Clientes',
    inactive: 'Clientes Inativos',
  };

  const handleSendNotification = async () => {
    if (!newNotification.title || !newNotification.message) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha título e mensagem',
        variant: 'destructive',
      });
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: '✅ Notificação enviada!',
        description: `Enviada para ${audienceLabels[newNotification.audience]}`,
      });

      setShowNewModal(false);
      setNewNotification({
        title: '',
        message: '',
        audience: 'all',
        scheduleDate: '',
        scheduleTime: '',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar a notificação',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (notification: Notification) => {
    if (notification.status === 'sent') {
      return (
        <Badge variant="default" className="gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Enviada
        </Badge>
      );
    }
    if (notification.status === 'scheduled') {
      return (
        <Badge variant="secondary" className="gap-1">
          <Clock className="h-3 w-3" />
          Agendada
        </Badge>
      );
    }
    return <Badge variant="outline">Rascunho</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notificações Push</h1>
          <p className="text-muted-foreground mt-1">
            Envie mensagens diretas para os clientes no app
          </p>
        </div>
        <Button onClick={() => setShowNewModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Notificação
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Enviadas</p>
                <p className="text-2xl font-bold mt-1">{stats.totalSent}</p>
              </div>
              <Send className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Abertura</p>
                <p className="text-2xl font-bold mt-1 text-green-600">
                  {stats.avgOpenRate}%
                </p>
              </div>
              <Eye className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Cliques</p>
                <p className="text-2xl font-bold mt-1 text-purple-600">
                  {stats.avgClickRate}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notification History */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Notificações</CardTitle>
          <CardDescription>
            Acompanhe o desempenho de cada notificação enviada
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{notification.title}</p>
                    {getStatusBadge(notification)}
                    <Badge variant="outline" className="text-xs">
                      {audienceLabels[notification.audience]}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                    {notification.status === 'sent' && notification.sentAt && (
                      <>
                        <span>
                          Enviada em{' '}
                          {new Date(notification.sentAt).toLocaleString('pt-BR')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {notification.opens} aberturas
                        </span>
                        <span>
                          {notification.clicks} cliques (
                          {((notification.clicks / notification.opens) * 100).toFixed(
                            1
                          )}
                          %)
                        </span>
                      </>
                    )}
                    {notification.status === 'scheduled' &&
                      notification.scheduledFor && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Agendada para{' '}
                          {new Date(notification.scheduledFor).toLocaleString(
                            'pt-BR'
                          )}
                        </span>
                      )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Templates Sugeridos</CardTitle>
          <CardDescription>Use estes modelos como inspiração</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900">
            <p className="font-medium">🎉 Promoção Relâmpago</p>
            <p className="text-sm text-muted-foreground">
              &quot;Só por 2 horas! 30% OFF em todo o cardápio. Aproveite agora!&quot;
            </p>
          </div>

          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
            <p className="font-medium">😋 Novo Item no Cardápio</p>
            <p className="text-sm text-muted-foreground">
              &quot;Acabou de chegar! Experimente nosso novo X-Burger Especial com 15%
              OFF.&quot;
            </p>
          </div>

          <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900">
            <p className="font-medium">⏰ Hora do Almoço</p>
            <p className="text-sm text-muted-foreground">
              &quot;Está com fome? Peça agora e ganhe frete grátis! Válido até
              14h.&quot;
            </p>
          </div>

          <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900">
            <p className="font-medium">💝 Sentimos Sua Falta</p>
            <p className="text-sm text-muted-foreground">
              &quot;Faz tempo que você não pede! Volte e ganhe 20% OFF no próximo
              pedido.&quot;
            </p>
          </div>
        </CardContent>
      </Card>

      {/* New Notification Modal */}
      <Dialog open={showNewModal} onOpenChange={setShowNewModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nova Notificação Push</DialogTitle>
            <DialogDescription>
              Crie e envie uma notificação para os clientes
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Título *</Label>
              <Input
                value={newNotification.title}
                onChange={(e) =>
                  setNewNotification({ ...newNotification, title: e.target.value })
                }
                placeholder="Ex: 🍕 Pizza em Dobro!"
                maxLength={50}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {newNotification.title.length}/50 caracteres
              </p>
            </div>

            <div>
              <Label>Mensagem *</Label>
              <Textarea
                value={newNotification.message}
                onChange={(e) =>
                  setNewNotification({ ...newNotification, message: e.target.value })
                }
                placeholder="Ex: Compre 1 pizza e leve 2! Válido só hoje."
                rows={3}
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {newNotification.message.length}/200 caracteres
              </p>
            </div>

            <div>
              <Label>Público-Alvo</Label>
              <Select
                value={newNotification.audience}
                onValueChange={(value: any) =>
                  setNewNotification({ ...newNotification, audience: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Todos os Clientes
                    </div>
                  </SelectItem>
                  <SelectItem value="vip">Clientes VIP</SelectItem>
                  <SelectItem value="new">Novos Clientes</SelectItem>
                  <SelectItem value="inactive">Clientes Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Agendar Data (opcional)</Label>
                <Input
                  type="date"
                  value={newNotification.scheduleDate}
                  onChange={(e) =>
                    setNewNotification({
                      ...newNotification,
                      scheduleDate: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label>Horário</Label>
                <Input
                  type="time"
                  value={newNotification.scheduleTime}
                  onChange={(e) =>
                    setNewNotification({
                      ...newNotification,
                      scheduleTime: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSendNotification}>
              <Send className="h-4 w-4 mr-2" />
              {newNotification.scheduleDate ? 'Agendar' : 'Enviar Agora'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 