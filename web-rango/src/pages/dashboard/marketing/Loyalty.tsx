import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Gift,
  Star,
  Save,
  Plus,
  Trash2,
  TrendingUp,
  Users,
  Award,
} from 'lucide-react';

interface LoyaltyReward {
  id: string;
  name: string;
  pointsRequired: number;
  discount: number;
  isActive: boolean;
}

export default function Loyalty() {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [loyaltyEnabled, setLoyaltyEnabled] = useState(true);
  const [pointsPerReal, setPointsPerReal] = useState(1);
  const [welcomeBonus, setWelcomeBonus] = useState(50);

  const [rewards, setRewards] = useState<LoyaltyReward[]>([
    {
      id: '1',
      name: '5% de Desconto',
      pointsRequired: 100,
      discount: 5,
      isActive: true,
    },
    {
      id: '2',
      name: '10% de Desconto',
      pointsRequired: 250,
      discount: 10,
      isActive: true,
    },
    {
      id: '3',
      name: '15% de Desconto',
      pointsRequired: 500,
      discount: 15,
      isActive: true,
    },
    {
      id: '4',
      name: 'Frete Grátis',
      pointsRequired: 300,
      discount: 0,
      isActive: true,
    },
  ]);

  const stats = {
    totalMembers: 487,
    activeMembers: 234,
    rewardsRedeemed: 89,
  };

  const handleAddReward = () => {
    const newReward: LoyaltyReward = {
      id: Date.now().toString(),
      name: 'Nova Recompensa',
      pointsRequired: 100,
      discount: 5,
      isActive: true,
    };
    setRewards([...rewards, newReward]);
  };

  const handleRemoveReward = (id: string) => {
    setRewards(rewards.filter((r) => r.id !== id));
  };

  const handleUpdateReward = (
    id: string,
    field: keyof LoyaltyReward,
    value: any
  ) => {
    setRewards(
      rewards.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({
        title: '✅ Configurações salvas!',
        description: 'Programa de fidelidade atualizado com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Programa de Fidelidade</h1>
          <p className="text-muted-foreground mt-1">
            Configure pontos, recompensas e benefícios para clientes fiéis
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Membros</p>
                <p className="text-2xl font-bold mt-1">{stats.totalMembers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Membros Ativos</p>
                <p className="text-2xl font-bold mt-1 text-green-600">
                  {stats.activeMembers}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Recompensas Resgatadas</p>
                <p className="text-2xl font-bold mt-1 text-purple-600">
                  {stats.rewardsRedeemed}
                </p>
              </div>
              <Gift className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enable/Disable */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Programa Ativo</CardTitle>
              <CardDescription>
                Ative ou desative o programa de fidelidade
              </CardDescription>
            </div>
            <Switch
              checked={loyaltyEnabled}
              onCheckedChange={setLoyaltyEnabled}
            />
          </div>
        </CardHeader>
      </Card>

      {/* Points Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-600" />
            Configuração de Pontos
          </CardTitle>
          <CardDescription>
            Defina como os clientes ganham pontos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Pontos por Real Gasto</Label>
              <Input
                type="number"
                value={pointsPerReal}
                onChange={(e) => setPointsPerReal(parseFloat(e.target.value))}
                min="0"
                step="0.1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Exemplo: 1 ponto = R$ 1,00 gasto
              </p>
            </div>

            <div>
              <Label>Bônus de Boas-Vindas</Label>
              <Input
                type="number"
                value={welcomeBonus}
                onChange={(e) => setWelcomeBonus(parseInt(e.target.value))}
                min="0"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Pontos ganhos ao se cadastrar
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rewards */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-purple-600" />
                Recompensas Disponíveis
              </CardTitle>
              <CardDescription>
                Configure os prêmios que os clientes podem resgatar
              </CardDescription>
            </div>
            <Button onClick={handleAddReward} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Recompensa
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {rewards.map((reward) => (
            <div
              key={reward.id}
              className="p-4 border rounded-lg space-y-4 bg-gray-50 dark:bg-gray-900/50"
            >
              <div className="flex items-center justify-between">
                <Input
                  value={reward.name}
                  onChange={(e) =>
                    handleUpdateReward(reward.id, 'name', e.target.value)
                  }
                  className="max-w-xs font-semibold"
                />
                <div className="flex items-center gap-2">
                  <Switch
                    checked={reward.isActive}
                    onCheckedChange={(checked) =>
                      handleUpdateReward(reward.id, 'isActive', checked)
                    }
                  />
                  {reward.isActive ? (
                    <Badge variant="default">Ativa</Badge>
                  ) : (
                    <Badge variant="secondary">Inativa</Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveReward(reward.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Pontos Necessários</Label>
                  <div className="relative">
                    <Star className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      type="number"
                      value={reward.pointsRequired}
                      onChange={(e) =>
                        handleUpdateReward(
                          reward.id,
                          'pointsRequired',
                          parseInt(e.target.value)
                        )
                      }
                      className="pl-9"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Desconto (%)</Label>
                  <Input
                    type="number"
                    value={reward.discount}
                    onChange={(e) =>
                      handleUpdateReward(
                        reward.id,
                        'discount',
                        parseInt(e.target.value)
                      )
                    }
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            </div>
          ))}

          {rewards.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Gift className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma recompensa configurada</p>
              <Button onClick={handleAddReward} variant="outline" className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeira Recompensa
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* How it Works */}
      <Card>
        <CardHeader>
          <CardTitle>Como Funciona</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
              1
            </div>
            <div>
              <p className="font-medium">Cliente Ganha Pontos</p>
              <p className="text-sm text-muted-foreground">
                A cada compra, o cliente acumula {pointsPerReal} ponto(s) por real
                gasto. Novos clientes ganham {welcomeBonus} pontos de bônus.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30">
            <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
              2
            </div>
            <div>
              <p className="font-medium">Cliente Resgata Recompensas</p>
              <p className="text-sm text-muted-foreground">
                Quando acumular pontos suficientes, pode trocar por descontos ou
                benefícios disponíveis.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/30">
            <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
              3
            </div>
            <div>
              <p className="font-medium">Fidelização</p>
              <p className="text-sm text-muted-foreground">
                Clientes voltam mais vezes para acumular pontos e resgatar prêmios,
                aumentando a retenção.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 