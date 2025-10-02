import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MapPin,
  Plus,
  Trash2,
  Save,
  DollarSign,
  Ruler,
  AlertCircle,
} from 'lucide-react';

interface DeliveryZone {
  id: string;
  name: string;
  radius: number;
  fee: number;
  minOrderValue: number;
  estimatedTime: number;
  isActive: boolean;
}

export default function DeliveryArea() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [deliveryEnabled, setDeliveryEnabled] = useState(true);
  const [storeAddress, setStoreAddress] = useState({
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    latitude: -23.5505,
    longitude: -46.6333,
  });

  const [zones, setZones] = useState<DeliveryZone[]>([
    {
      id: '1',
      name: 'Zona 1 - Próximo',
      radius: 2,
      fee: 5.0,
      minOrderValue: 20.0,
      estimatedTime: 30,
      isActive: true,
    },
    {
      id: '2',
      name: 'Zona 2 - Médio',
      radius: 5,
      fee: 8.0,
      minOrderValue: 30.0,
      estimatedTime: 45,
      isActive: true,
    },
    {
      id: '3',
      name: 'Zona 3 - Distante',
      radius: 10,
      fee: 12.0,
      minOrderValue: 50.0,
      estimatedTime: 60,
      isActive: false,
    },
  ]);

  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(80.0);

  useEffect(() => {
    loadDeliverySettings();
  }, [user?.storeId]);

  const loadDeliverySettings = async () => {
    setLoading(false);
  };

  const handleAddZone = () => {
    const newZone: DeliveryZone = {
      id: Date.now().toString(),
      name: `Zona ${zones.length + 1}`,
      radius: zones.length > 0 ? zones[zones.length - 1].radius + 3 : 2,
      fee: 5.0,
      minOrderValue: 20.0,
      estimatedTime: 30,
      isActive: true,
    };
    setZones([...zones, newZone]);
  };

  const handleRemoveZone = (id: string) => {
    setZones(zones.filter((zone) => zone.id !== id));
  };

  const handleUpdateZone = (id: string, field: keyof DeliveryZone, value: any) => {
    setZones(
      zones.map((zone) =>
        zone.id === id ? { ...zone, [field]: value } : zone
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      // Simular salvamento
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: '✅ Configurações salvas!',
        description: 'Área de entrega atualizada com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as configurações',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
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
          <h1 className="text-3xl font-bold">Área de Entrega</h1>
          <p className="text-muted-foreground mt-1">
            Configure zonas de entrega, taxas e raios de alcance
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>

      {/* Delivery Enable/Disable */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Entrega Ativa</CardTitle>
              <CardDescription>
                Ative ou desative o serviço de entrega da sua loja
              </CardDescription>
            </div>
            <Switch checked={deliveryEnabled} onCheckedChange={setDeliveryEnabled} />
          </div>
        </CardHeader>
      </Card>

      {/* Store Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Endereço da Loja
          </CardTitle>
          <CardDescription>
            Ponto de referência para calcular distâncias de entrega
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <Label>CEP</Label>
              <Input
                value={storeAddress.zipCode}
                onChange={(e) =>
                  setStoreAddress({ ...storeAddress, zipCode: e.target.value })
                }
                placeholder="00000-000"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <Label>Rua</Label>
              <Input
                value={storeAddress.street}
                onChange={(e) =>
                  setStoreAddress({ ...storeAddress, street: e.target.value })
                }
              />
            </div>
            <div className="col-span-1">
              <Label>Número</Label>
              <Input
                value={storeAddress.number}
                onChange={(e) =>
                  setStoreAddress({ ...storeAddress, number: e.target.value })
                }
              />
            </div>
            <div className="col-span-1">
              <Label>Bairro</Label>
              <Input
                value={storeAddress.neighborhood}
                onChange={(e) =>
                  setStoreAddress({ ...storeAddress, neighborhood: e.target.value })
                }
              />
            </div>
            <div className="col-span-1">
              <Label>Cidade</Label>
              <Input
                value={storeAddress.city}
                onChange={(e) =>
                  setStoreAddress({ ...storeAddress, city: e.target.value })
                }
              />
            </div>
            <div className="col-span-1">
              <Label>Estado</Label>
              <Select
                value={storeAddress.state}
                onValueChange={(value) =>
                  setStoreAddress({ ...storeAddress, state: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="UF" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SP">São Paulo</SelectItem>
                  <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                  <SelectItem value="MG">Minas Gerais</SelectItem>
                  <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Zones */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Ruler className="h-5 w-5" />
                Zonas de Entrega
              </CardTitle>
              <CardDescription>
                Configure raios de entrega e taxas por distância
              </CardDescription>
            </div>
            <Button onClick={handleAddZone} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Zona
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {zones.map((zone, index) => (
            <div
              key={zone.id}
              className="p-4 border rounded-lg space-y-4 bg-gray-50 dark:bg-gray-900/50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Input
                    value={zone.name}
                    onChange={(e) =>
                      handleUpdateZone(zone.id, 'name', e.target.value)
                    }
                    className="w-48 font-semibold"
                  />
                  <Switch
                    checked={zone.isActive}
                    onCheckedChange={(checked) =>
                      handleUpdateZone(zone.id, 'isActive', checked)
                    }
                  />
                  {zone.isActive ? (
                    <Badge variant="default">Ativa</Badge>
                  ) : (
                    <Badge variant="secondary">Inativa</Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveZone(zone.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-xs">Raio (km)</Label>
                  <div className="relative">
                    <Ruler className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      type="number"
                      value={zone.radius}
                      onChange={(e) =>
                        handleUpdateZone(zone.id, 'radius', parseFloat(e.target.value))
                      }
                      className="pl-9"
                      step="0.5"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Taxa de Entrega</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      type="number"
                      value={zone.fee}
                      onChange={(e) =>
                        handleUpdateZone(zone.id, 'fee', parseFloat(e.target.value))
                      }
                      className="pl-9"
                      step="0.50"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Pedido Mínimo</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      type="number"
                      value={zone.minOrderValue}
                      onChange={(e) =>
                        handleUpdateZone(
                          zone.id,
                          'minOrderValue',
                          parseFloat(e.target.value)
                        )
                      }
                      className="pl-9"
                      step="5.00"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Tempo Estimado (min)</Label>
                  <Input
                    type="number"
                    value={zone.estimatedTime}
                    onChange={(e) =>
                      handleUpdateZone(
                        zone.id,
                        'estimatedTime',
                        parseInt(e.target.value)
                      )
                    }
                    step="5"
                  />
                </div>
              </div>
            </div>
          ))}

          {zones.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma zona configurada</p>
              <Button onClick={handleAddZone} variant="outline" className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeira Zona
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Free Delivery */}
      <Card>
        <CardHeader>
          <CardTitle>Frete Grátis</CardTitle>
          <CardDescription>
            Defina um valor mínimo para oferecer entrega gratuita
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label>Valor mínimo para frete grátis</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  type="number"
                  value={freeDeliveryThreshold}
                  onChange={(e) =>
                    setFreeDeliveryThreshold(parseFloat(e.target.value))
                  }
                  className="pl-9"
                  step="5.00"
                />
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Pedidos acima de{' '}
              <strong>
                {freeDeliveryThreshold.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </strong>{' '}
              terão entrega gratuita, independente da zona.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 