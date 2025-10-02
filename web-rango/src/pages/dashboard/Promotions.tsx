import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
  Tag,
  Plus,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Clock,
  Percent,
  Gift,
  Truck,
  ShoppingCart,
  Edit,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Promotion {
  id: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed' | 'free_shipping' | 'buy_x_get_y';
  value: number;
  minOrderValue?: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  status: 'scheduled' | 'active' | 'expired';
  usageCount: number;
  usageLimit?: number;
  categories?: string[];
}

const Promotions = () => {
  const { toast } = useToast();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);

  const [newPromotion, setNewPromotion] = useState({
    name: '',
    description: '',
    type: 'percentage' as Promotion['type'],
    value: 0,
    minOrderValue: 0,
    startDate: '',
    endDate: '',
    usageLimit: 0,
    categories: [] as string[],
  });

  const [promotions] = useState<Promotion[]>([
    {
      id: '1',
      name: 'Black Friday 2024',
      description: 'Desconto especial de Black Friday em todo o cardápio',
      type: 'percentage',
      value: 30,
      minOrderValue: 50,
      startDate: new Date('2024-11-29'),
      endDate: new Date('2024-12-01'),
      isActive: true,
      status: 'active',
      usageCount: 145,
      usageLimit: 500,
      categories: ['Todos'],
    },
    {
      id: '2',
      name: 'Frete Grátis - Terça',
      description: 'Frete grátis todas as terças-feiras',
      type: 'free_shipping',
      value: 0,
      minOrderValue: 30,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      isActive: true,
      status: 'active',
      usageCount: 89,
      categories: ['Delivery'],
    },
    {
      id: '3',
      name: 'Compre 2 Leve 3 - Pizzas',
      description: 'Na compra de 2 pizzas, leve 3',
      type: 'buy_x_get_y',
      value: 2,
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-03-31'),
      isActive: false,
      status: 'scheduled',
      usageCount: 0,
      usageLimit: 200,
      categories: ['Pizzas'],
    },
    {
      id: '4',
      name: 'R$ 15 OFF - Primeira Compra',
      description: 'Desconto de R$ 15 para novos clientes',
      type: 'fixed',
      value: 15,
      minOrderValue: 40,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-06-15'),
      isActive: false,
      status: 'expired',
      usageCount: 234,
      usageLimit: 300,
      categories: ['Novos Clientes'],
    },
  ]);

  const stats = {
    activePromotions: promotions.filter((p) => p.status === 'active').length,
    totalUsage: promotions.reduce((sum, p) => sum + p.usageCount, 0),
    estimatedRevenue: 45680.0,
    conversionRate: 23.5,
  };

  const handleCreatePromotion = () => {
    if (!newPromotion.name || !newPromotion.startDate || !newPromotion.endDate) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha nome, data de início e fim',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: '✅ Promoção criada!',
      description: `${newPromotion.name} foi criada com sucesso`,
    });

    setShowCreateModal(false);
    setNewPromotion({
      name: '',
      description: '',
      type: 'percentage',
      value: 0,
      minOrderValue: 0,
      startDate: '',
      endDate: '',
      usageLimit: 0,
      categories: [],
    });
  };

  const handleTogglePromotion = (id: string) => {
    toast({
      title: '✅ Status atualizado',
      description: 'Promoção foi ativada/desativada',
    });
  };

  const handleDeletePromotion = (id: string) => {
    toast({
      title: '✅ Promoção excluída',
      description: 'A promoção foi removida',
    });
  };

  const getTypeIcon = (type: Promotion['type']) => {
    switch (type) {
      case 'percentage':
        return <Percent className="h-4 w-4" />;
      case 'fixed':
        return <DollarSign className="h-4 w-4" />;
      case 'free_shipping':
        return <Truck className="h-4 w-4" />;
      case 'buy_x_get_y':
        return <Gift className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: Promotion['type']) => {
    const labels = {
      percentage: 'Desconto %',
      fixed: 'Desconto Fixo',
      free_shipping: 'Frete Grátis',
      buy_x_get_y: 'Compre X Leve Y',
    };
    return labels[type];
  };

  const getStatusBadge = (status: Promotion['status']) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="default" className="gap-1">
            <Sparkles className="h-3 w-3" />
            Ativa
          </Badge>
        );
      case 'scheduled':
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            Agendada
          </Badge>
        );
      case 'expired':
        return (
          <Badge variant="outline" className="gap-1 text-muted-foreground">
            <Calendar className="h-3 w-3" />
            Expirada
          </Badge>
        );
    }
  };

  const getPromotionValue = (promo: Promotion) => {
    switch (promo.type) {
      case 'percentage':
        return `${promo.value}% OFF`;
      case 'fixed':
        return `R$ ${promo.value.toFixed(2)} OFF`;
      case 'free_shipping':
        return 'Frete Grátis';
      case 'buy_x_get_y':
        return `Compre ${promo.value} Leve ${promo.value + 1}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Promoções</h1>
          <p className="text-muted-foreground mt-1">
            Crie e gerencie ofertas especiais para seus clientes
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Promoção
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-lg border-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Promoções Ativas</p>
                <p className="text-2xl font-bold mt-1">{stats.activePromotions}</p>
              </div>
              <Tag className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Usos Totais</p>
                <p className="text-2xl font-bold mt-1">{stats.totalUsage}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Receita Gerada</p>
                <p className="text-2xl font-bold mt-1">
                  {stats.estimatedRevenue.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa Conversão</p>
                <p className="text-2xl font-bold mt-1">{stats.conversionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Promoções */}
      <Card className="shadow-lg border-2">
        <CardHeader>
          <CardTitle className="text-2xl">Todas as Promoções</CardTitle>
          <CardDescription className="text-base">
            {promotions.length} promoção{promotions.length !== 1 ? 'ões' : ''} cadastrada
            {promotions.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {promotions.map((promotion) => (
            <div
              key={promotion.id}
              className="p-6 border-2 rounded-lg hover:shadow-md transition-shadow space-y-4"
            >
              {/* Header da Promoção */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      {getTypeIcon(promotion.type)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{promotion.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {promotion.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusBadge(promotion.status)}
                  <Switch
                    checked={promotion.isActive}
                    onCheckedChange={() => handleTogglePromotion(promotion.id)}
                    disabled={promotion.status === 'expired'}
                  />
                </div>
              </div>

              {/* Detalhes da Promoção */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Tipo</p>
                  <div className="flex items-center gap-1">
                    {getTypeIcon(promotion.type)}
                    <span className="text-sm font-medium">{getTypeLabel(promotion.type)}</span>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Valor</p>
                  <p className="text-sm font-bold text-primary">
                    {getPromotionValue(promotion)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Período</p>
                  <p className="text-sm font-medium">
                    {new Date(promotion.startDate).toLocaleDateString('pt-BR')} -{' '}
                    {new Date(promotion.endDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Uso</p>
                  <p className="text-sm font-medium">
                    {promotion.usageCount}
                    {promotion.usageLimit ? ` / ${promotion.usageLimit}` : ''}
                  </p>
                </div>
              </div>

              {/* Info Adicional */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {promotion.minOrderValue && (
                    <span>Pedido mín: R$ {promotion.minOrderValue.toFixed(2)}</span>
                  )}
                  {promotion.categories && promotion.categories.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Tag className="h-3 w-3" />
                      <span>{promotion.categories.join(', ')}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingPromotion(promotion);
                      setShowCreateModal(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeletePromotion(promotion.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Modal de Criar/Editar Promoção */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPromotion ? 'Editar Promoção' : 'Nova Promoção'}
            </DialogTitle>
            <DialogDescription>
              Crie ofertas especiais para aumentar suas vendas
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Nome e Descrição */}
            <div className="space-y-4">
              <div>
                <Label>Nome da Promoção *</Label>
                <Input
                  value={newPromotion.name}
                  onChange={(e) =>
                    setNewPromotion({ ...newPromotion, name: e.target.value })
                  }
                  placeholder="Ex: Black Friday 2024"
                />
              </div>

              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={newPromotion.description}
                  onChange={(e) =>
                    setNewPromotion({ ...newPromotion, description: e.target.value })
                  }
                  placeholder="Descreva os detalhes da promoção"
                  rows={2}
                />
              </div>
            </div>

            {/* Tipo e Valor */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo de Promoção *</Label>
                <Select
                  value={newPromotion.type}
                  onValueChange={(value: any) =>
                    setNewPromotion({ ...newPromotion, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">
                      <div className="flex items-center gap-2">
                        <Percent className="h-4 w-4" />
                        Desconto Percentual
                      </div>
                    </SelectItem>
                    <SelectItem value="fixed">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Desconto Fixo (R$)
                      </div>
                    </SelectItem>
                    <SelectItem value="free_shipping">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        Frete Grátis
                      </div>
                    </SelectItem>
                    <SelectItem value="buy_x_get_y">
                      <div className="flex items-center gap-2">
                        <Gift className="h-4 w-4" />
                        Compre X Leve Y
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newPromotion.type !== 'free_shipping' && (
                <div>
                  <Label>
                    Valor *{' '}
                    {newPromotion.type === 'percentage' && '(%)'}
                    {newPromotion.type === 'fixed' && '(R$)'}
                  </Label>
                  <Input
                    type="number"
                    value={newPromotion.value}
                    onChange={(e) =>
                      setNewPromotion({
                        ...newPromotion,
                        value: parseFloat(e.target.value),
                      })
                    }
                    placeholder="0"
                  />
                </div>
              )}
            </div>

            {/* Período */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data de Início *</Label>
                <Input
                  type="datetime-local"
                  value={newPromotion.startDate}
                  onChange={(e) =>
                    setNewPromotion({ ...newPromotion, startDate: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Data de Término *</Label>
                <Input
                  type="datetime-local"
                  value={newPromotion.endDate}
                  onChange={(e) =>
                    setNewPromotion({ ...newPromotion, endDate: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Regras */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Pedido Mínimo (R$)</Label>
                <Input
                  type="number"
                  value={newPromotion.minOrderValue}
                  onChange={(e) =>
                    setNewPromotion({
                      ...newPromotion,
                      minOrderValue: parseFloat(e.target.value),
                    })
                  }
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label>Limite de Uso</Label>
                <Input
                  type="number"
                  value={newPromotion.usageLimit}
                  onChange={(e) =>
                    setNewPromotion({
                      ...newPromotion,
                      usageLimit: parseInt(e.target.value),
                    })
                  }
                  placeholder="Ilimitado"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                setEditingPromotion(null);
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreatePromotion}>
              {editingPromotion ? 'Salvar Alterações' : 'Criar Promoção'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Promotions;
