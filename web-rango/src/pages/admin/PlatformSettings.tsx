/**
 * PlatformSettings.tsx
 * Configurações globais da plataforma
 * Taxas, comissões e configurações operacionais
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  Percent, 
  DollarSign,
  Save,
  RefreshCw
} from "lucide-react";
import { getPlatformConfig, updatePlatformConfig, PlatformConfig } from "@/services/adminService";
import { useToast } from "@/hooks/use-toast";
import { KpiCard } from "@/components/admin/KpiCard";

export default function PlatformSettings() {
  const [config, setConfig] = useState<PlatformConfig>({
    commissionRate: 10,
    platformFee: 2,
    minimumOrderValue: 10,
    deliveryFeeBase: 5,
    termsOfService: '',
    privacyPolicy: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const data = await getPlatformConfig();
      setConfig(data);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as configurações',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePlatformConfig(config);
      toast({
        title: 'Sucesso',
        description: 'Configurações atualizadas com sucesso',
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as configurações',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configurações da Plataforma</h1>
          <p className="text-muted-foreground">Gerencie taxas, comissões e configurações globais</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadConfig} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Recarregar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </div>

      {/* Preview das Configurações Atuais */}
      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard
          title="Comissão"
          value={`${config.commissionRate}%`}
          icon={Percent}
          description="Percentual por pedido"
          color="blue"
        />
        <KpiCard
          title="Taxa Fixa"
          value={formatCurrency(config.platformFee)}
          icon={DollarSign}
          description="Por pedido"
          color="green"
        />
        <KpiCard
          title="Pedido Mínimo"
          value={formatCurrency(config.minimumOrderValue)}
          icon={DollarSign}
          description="Valor mínimo"
          color="orange"
        />
        <KpiCard
          title="Taxa de Entrega"
          value={formatCurrency(config.deliveryFeeBase)}
          icon={DollarSign}
          description="Valor base"
          color="default"
        />
      </div>

      <Tabs defaultValue="financial" className="w-full">
        <TabsList>
          <TabsTrigger value="financial">
            <DollarSign className="h-4 w-4 mr-2" />
            Financeiro
          </TabsTrigger>
          <TabsTrigger value="operational">
            <Settings className="h-4 w-4 mr-2" />
            Operacional
          </TabsTrigger>
        </TabsList>

        {/* TAB: FINANCEIRO */}
        <TabsContent value="financial">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Financeiras</CardTitle>
              <CardDescription>
                Defina as taxas e comissões cobradas pela plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Comissão */}
              <div className="space-y-2">
                <Label htmlFor="commissionRate">
                  Taxa de Comissão (%)
                </Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="commissionRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={config.commissionRate}
                    onChange={(e) => setConfig({ ...config, commissionRate: parseFloat(e.target.value) })}
                    className="max-w-xs"
                  />
                  <span className="text-sm text-muted-foreground">
                    Percentual do valor do pedido
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Ex: Um pedido de R$ 100,00 gera R$ {(100 * config.commissionRate / 100).toFixed(2)} de comissão
                </p>
              </div>

              {/* Taxa Fixa */}
              <div className="space-y-2">
                <Label htmlFor="platformFee">
                  Taxa Fixa por Pedido (R$)
                </Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="platformFee"
                    type="number"
                    min="0"
                    step="0.01"
                    value={config.platformFee}
                    onChange={(e) => setConfig({ ...config, platformFee: parseFloat(e.target.value) })}
                    className="max-w-xs"
                  />
                  <span className="text-sm text-muted-foreground">
                    Valor fixo cobrado por transação
                  </span>
                </div>
              </div>

              {/* Valor Mínimo */}
              <div className="space-y-2">
                <Label htmlFor="minimumOrderValue">
                  Valor Mínimo do Pedido (R$)
                </Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="minimumOrderValue"
                    type="number"
                    min="0"
                    step="1"
                    value={config.minimumOrderValue}
                    onChange={(e) => setConfig({ ...config, minimumOrderValue: parseFloat(e.target.value) })}
                    className="max-w-xs"
                  />
                  <span className="text-sm text-muted-foreground">
                    Pedidos abaixo deste valor não são permitidos
                  </span>
                </div>
              </div>

              {/* Simulador de Receita */}
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-base">Simulador de Receita</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium">Pedido de R$ 50</p>
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(50 * (config.commissionRate / 100) + config.platformFee)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Pedido de R$ 100</p>
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(100 * (config.commissionRate / 100) + config.platformFee)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Pedido de R$ 200</p>
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(200 * (config.commissionRate / 100) + config.platformFee)}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Receita estimada por pedido com as configurações atuais
                  </p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: OPERACIONAL */}
        <TabsContent value="operational">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Operacionais</CardTitle>
              <CardDescription>
                Defina parâmetros operacionais da plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Taxa de Entrega Base */}
              <div className="space-y-2">
                <Label htmlFor="deliveryFeeBase">
                  Taxa de Entrega Base (R$)
                </Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="deliveryFeeBase"
                    type="number"
                    min="0"
                    step="0.50"
                    value={config.deliveryFeeBase}
                    onChange={(e) => setConfig({ ...config, deliveryFeeBase: parseFloat(e.target.value) })}
                    className="max-w-xs"
                  />
                  <span className="text-sm text-muted-foreground">
                    Valor base sugerido para entrega
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Este valor é uma sugestão inicial. Cada loja pode definir sua própria taxa.
                </p>
              </div>

              {/* Informações Adicionais */}
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-base">Informações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total de Lojas Ativas:</span>
                    <span className="font-medium">Carregando...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pedidos Processados (Mês):</span>
                    <span className="font-medium">Carregando...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Receita Total (Mês):</span>
                    <span className="font-medium text-green-600">Carregando...</span>
                  </div>
                </CardContent>
              </Card>

              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-2">Termos e Políticas</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  A gestão de termos de serviço e políticas de privacidade será implementada em breve.
                </p>
                <Button variant="outline" disabled>
                  Gerenciar Termos
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Aviso de Segurança */}
      <Card className="border-yellow-500/50 bg-yellow-500/5">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Aviso Importante
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Alterações nas configurações financeiras afetam <strong>todas as lojas</strong> da plataforma. 
            Mudanças significativas podem impactar contratos existentes e devem ser comunicadas com antecedência.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

