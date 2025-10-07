import { useState, useEffect } from 'react';
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
  Ticket,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  getStorePromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  togglePromotionStatus,
  generateCouponCode,
  type Promotion,
  type PromotionType,
} from '@/services/promotionService';

const Promotions = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [loading, setLoading] = useState(true);
  const [promotions, setPromotions] = useState<Promotion[]>([]);

  const [newPromotion, setNewPromotion] = useState({
    name: '',
    description: '',
    type: 'percentage' as PromotionType,
    code: '',
    discountValue: 0,
    minOrderValue: 0,
    maxDiscount: 0,
    buyQuantity: 2,
    getQuantity: 1,
    startDate: '',
    endDate: '',
    usageLimit: 0,
    userLimit: 1,
  });

  // Carregar promoções
  useEffect(() => {
    if (user?.storeId) {
      loadPromotions();
    }
  }, [user]);

  const loadPromotions = async () => {
    if (!user?.storeId) return;

    try {
      setLoading(true);
      const data = await getStorePromotions(user.storeId);
      setPromotions(data);
    } catch (error) {
      console.error('Erro ao carregar promoções:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as promoções',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const [_mockPromotions] = useState<any[]>([
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

  const handleCreatePromotion = async () => {
    if (!newPromotion.name || !newPromotion.startDate || !newPromotion.endDate) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha nome, data de início e fim',
        variant: 'destructive',
      });
      return;
    }

    if (!user?.storeId || !user?.uid) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createPromotion({
        storeId: user.storeId,
        name: newPromotion.name,
        description: newPromotion.description,
        type: newPromotion.type,
        code: newPromotion.code || undefined,
        discountValue: newPromotion.discountValue,
        minOrderValue: newPromotion.minOrderValue || undefined,
        maxDiscount: newPromotion.maxDiscount || undefined,
        buyQuantity: newPromotion.buyQuantity,
        getQuantity: newPromotion.getQuantity,
        startDate: new Date(newPromotion.startDate),
        endDate: new Date(newPromotion.endDate),
        usageLimit: newPromotion.usageLimit || undefined,
        userLimit: newPromotion.userLimit,
        createdBy: user.uid,
      });

      toast({
        title: '✅ Promoção criada!',
        description: `${newPromotion.name} foi criada com sucesso`,
      });

      loadPromotions();
      setShowCreateModal(false);
      setNewPromotion({
        name: '',
        description: '',
        type: 'percentage',
        code: '',
        discountValue: 0,
        minOrderValue: 0,
        maxDiscount: 0,
        buyQuantity: 2,
        getQuantity: 1,
        startDate: '',
        endDate: '',
        usageLimit: 0,
        userLimit: 1,
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível criar a promoção',
        variant: 'destructive',
      });
    }
  };

  const handleTogglePromotion = async (id: string, currentStatus: boolean) => {
    try {
      await togglePromotionStatus(id, !currentStatus);
      toast({
        title: '✅ Status atualizado',
        description: `Promoção ${!currentStatus ? 'ativada' : 'desativada'} com sucesso`,
      });
      loadPromotions();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status',
        variant: 'destructive',
      });
    }
  };

  const handleDeletePromotion = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta promoção?')) {
      return;
    }

    try {
      await deletePromotion(id);
      toast({
        title: '✅ Promoção excluída',
        description: 'A promoção foi removida com sucesso',
      });
      loadPromotions();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a promoção',
        variant: 'destructive',
      });
    }
  };

  const handleGenerateCode = () => {
    const code = generateCouponCode(newPromotion.name.substring(0, 3));
    setNewPromotion({ ...newPromotion, code });
  };

  const getTypeIcon = (type: PromotionType) => {
    switch (type) {
      case 'percentage':
        return <Percent className="h-4 w-4" />;
      case 'fixed':
        return <DollarSign className="h-4 w-4" />;
      case 'freeDelivery':
        return <Truck className="h-4 w-4" />;
      case 'buyXgetY':
        return <Gift className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: PromotionType) => {
    const labels = {
      percentage: 'Desconto %',
      fixed: 'Desconto Fixo',
      freeDelivery: 'Frete Grátis',
      buyXgetY: 'Compre X Leve Y',
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
        return `${promo.discountValue}% OFF`;
      case 'fixed':
        return `R$ ${(promo.discountValue || 0).toFixed(2)} OFF`;
      case 'freeDelivery':
        return 'Frete Grátis';
      case 'buyXgetY':
        return `Leve ${promo.buyQuantity} Pague ${(promo.buyQuantity || 0) - (promo.getQuantity || 0)}`;
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
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Carregando promoções...</p>
            </div>
          ) : promotions.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">
                Nenhuma promoção criada ainda
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Crie sua primeira promoção para atrair mais clientes
              </p>
            </div>
          ) : (
            promotions.map((promotion) => (
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
                    onCheckedChange={() => handleTogglePromotion(promotion.id, promotion.isActive)}
                    disabled={promotion.status === 'expired'}
                  />
                </div>
              </div>

              {/* Código do Cupom */}
              {promotion.code && (
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200">
                  <Ticket className="h-4 w-4 text-blue-600" />
                  <span className="font-mono font-bold text-blue-600">{promotion.code}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto"
                    onClick={() => {
                      navigator.clipboard.writeText(promotion.code!);
                      toast({ title: 'Código copiado!' });
                    }}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              )}

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
                  {promotion.maxDiscount && promotion.type === 'percentage' && (
                    <span>Máx: R$ {promotion.maxDiscount.toFixed(2)}</span>
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
          ))
        )}
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

              {/* Código do Cupom */}
              <div>
                <Label>Código do Cupom (opcional)</Label>
                <div className="flex gap-2">
                  <Input
                    value={newPromotion.code}
                    onChange={(e) =>
                      setNewPromotion({ ...newPromotion, code: e.target.value.toUpperCase() })
                    }
                    placeholder="Ex: BLACKFRIDAY"
                    maxLength={15}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGenerateCode}
                  >
                    Gerar
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Deixe em branco para promoção automática (sem cupom)
                </p>
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
                    <SelectItem value="freeDelivery">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        Frete Grátis
                      </div>
                    </SelectItem>
                    <SelectItem value="buyXgetY">
                      <div className="flex items-center gap-2">
                        <Gift className="h-4 w-4" />
                        Leve X Pague Y
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newPromotion.type !== 'freeDelivery' && newPromotion.type !== 'buyXgetY' && (
                <div>
                  <Label>
                    Valor do Desconto *{' '}
                    {newPromotion.type === 'percentage' && '(%)'}
                    {newPromotion.type === 'fixed' && '(R$)'}
                  </Label>
                  <Input
                    type="number"
                    value={newPromotion.discountValue}
                    onChange={(e) =>
                      setNewPromotion({
                        ...newPromotion,
                        discountValue: parseFloat(e.target.value),
                      })
                    }
                    placeholder="0"
                    step={newPromotion.type === 'percentage' ? '1' : '0.01'}
                  />
                </div>
              )}
            </div>

            {/* Buy X Get Y */}
            {newPromotion.type === 'buyXgetY' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Quantidade para Comprar *</Label>
                  <Input
                    type="number"
                    value={newPromotion.buyQuantity}
                    onChange={(e) =>
                      setNewPromotion({
                        ...newPromotion,
                        buyQuantity: parseInt(e.target.value),
                      })
                    }
                    min="1"
                  />
                </div>
                <div>
                  <Label>Quantidade Grátis *</Label>
                  <Input
                    type="number"
                    value={newPromotion.getQuantity}
                    onChange={(e) =>
                      setNewPromotion({
                        ...newPromotion,
                        getQuantity: parseInt(e.target.value),
                      })
                    }
                    min="1"
                  />
                </div>
              </div>
            )}

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
            <div className="grid grid-cols-3 gap-4">
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
                  step="0.01"
                />
              </div>

              {newPromotion.type === 'percentage' && (
                <div>
                  <Label>Desconto Máximo (R$)</Label>
                  <Input
                    type="number"
                    value={newPromotion.maxDiscount}
                    onChange={(e) =>
                      setNewPromotion({
                        ...newPromotion,
                        maxDiscount: parseFloat(e.target.value),
                      })
                    }
                    placeholder="Ilimitado"
                    step="0.01"
                  />
                </div>
              )}

              <div>
                <Label>Limite Total de Uso</Label>
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
