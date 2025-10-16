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
  Loader2,
  Navigation,
} from 'lucide-react';
import {
  getDeliverySettings,
  saveDeliverySettings,
  updateStoreMainAddress,
  validateDeliverySettings,
  type DeliveryZone,
  type StoreAddress,
} from '@/services/deliveryAreaService';
import { fetchAddressByCEP, formatCEP } from '@/services/cepService';
import { geocodeAddress } from '@/services/geocodingService';

export default function DeliveryArea() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingCEP, setLoadingCEP] = useState(false);
  const [loadingGeocode, setLoadingGeocode] = useState(false);

  const [deliveryEnabled, setDeliveryEnabled] = useState(true);
  const [storeAddress, setStoreAddress] = useState<StoreAddress>({
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    latitude: -23.5505,
    longitude: -46.6333,
  });

  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(80.0);

  useEffect(() => {
    if (user?.storeId) {
      loadDeliverySettings();
    }
  }, [user?.storeId]);

  const loadDeliverySettings = async () => {
    if (!user?.storeId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('📋 Carregando configurações de entrega...');

      const settings = await getDeliverySettings(user.storeId);

      if (settings) {
        setDeliveryEnabled(settings.deliveryEnabled);
        setStoreAddress(settings.storeAddress);
        setZones(settings.zones);
        setFreeDeliveryThreshold(settings.freeDeliveryThreshold);
        console.log('✅ Configurações carregadas');
      } else {
        // Usar configurações padrão
        console.log('⚠️ Usando configurações padrão');
        setZones([
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
        ]);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar configurações:', error);
      toast({
        title: 'Erro ao carregar configurações',
        description: 'Não foi possível carregar as configurações de entrega',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCEPBlur = async () => {
    const cep = storeAddress.zipCode.replace(/\D/g, '');
    
    if (!cep || cep.length !== 8) {
      return;
    }

    setLoadingCEP(true);

    try {
      const address = await fetchAddressByCEP(cep);
      
      if (address) {
        setStoreAddress({
          ...storeAddress,
          street: address.street || storeAddress.street,
          neighborhood: address.neighborhood || storeAddress.neighborhood,
          city: address.city || storeAddress.city,
          state: address.state || storeAddress.state,
          zipCode: address.zipCode,
        });

        toast({
          title: '✅ CEP encontrado!',
          description: 'Endereço preenchido automaticamente',
        });

        // Auto-geocodificar após buscar CEP
        setTimeout(() => handleGeocode(), 500);
      }
    } catch (error: any) {
      toast({
        title: 'CEP não encontrado',
        description: error.message || 'Verifique o CEP digitado',
        variant: 'destructive',
      });
    } finally {
      setLoadingCEP(false);
    }
  };

  const handleGeocode = async () => {
    if (!storeAddress.street || !storeAddress.city || !storeAddress.state) {
      toast({
        title: 'Endereço incompleto',
        description: 'Preencha rua, cidade e estado primeiro',
        variant: 'destructive',
      });
      return;
    }

    setLoadingGeocode(true);

    try {
      const result = await geocodeAddress(
        storeAddress.street,
        storeAddress.number,
        storeAddress.neighborhood,
        storeAddress.city,
        storeAddress.state,
        storeAddress.zipCode
      );

      if (result && result.coordinates) {
        setStoreAddress({
          ...storeAddress,
          latitude: result.coordinates.lat,
          longitude: result.coordinates.lng,
        });
        
        toast({
          title: '📍 Localização encontrada!',
          description: `Coordenadas atualizadas`,
        });
      } else {
        toast({
          title: 'Localização não encontrada',
          description: 'Não foi possível obter as coordenadas deste endereço',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erro ao buscar localização',
        description: 'Tente novamente mais tarde',
        variant: 'destructive',
      });
    } finally {
      setLoadingGeocode(false);
    }
  };

  const formatCEPInput = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const limited = numbers.slice(0, 8);
    
    if (limited.length <= 5) {
      return limited;
    } else {
      return `${limited.slice(0, 5)}-${limited.slice(5, 8)}`;
    }
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
    if (!user?.storeId) {
      toast({
        title: 'Erro',
        description: 'Loja não identificada',
        variant: 'destructive',
      });
      return;
    }

    // Validar configurações
    const validation = validateDeliverySettings({
      deliveryEnabled,
      storeAddress,
      zones,
      freeDeliveryThreshold,
    });

    if (!validation.isValid) {
      toast({
        title: 'Configurações inválidas',
        description: validation.errors.join(', '),
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    try {
      console.log('💾 Salvando configurações de entrega...');

      // Salvar configurações de entrega
      await saveDeliverySettings(user.storeId, {
        deliveryEnabled,
        storeAddress,
        zones,
        freeDeliveryThreshold,
      });

      // Atualizar endereço principal da loja
      await updateStoreMainAddress(user.storeId, storeAddress);

      console.log('✅ Configurações salvas com sucesso');

      toast({
        title: '✅ Configurações salvas!',
        description: 'Área de entrega atualizada com sucesso.',
      });
    } catch (error: any) {
      console.error('❌ Erro ao salvar configurações:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível salvar as configurações',
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
              <div className="relative">
                <Input
                  value={storeAddress.zipCode}
                  onChange={(e) =>
                    setStoreAddress({ ...storeAddress, zipCode: formatCEPInput(e.target.value) })
                  }
                  onBlur={handleCEPBlur}
                  placeholder="00000-000"
                  maxLength={9}
                />
                {loadingCEP && (
                  <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-gray-400" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Digite o CEP e pressione Tab</p>
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
                  <SelectItem value="AC">Acre</SelectItem>
                  <SelectItem value="AL">Alagoas</SelectItem>
                  <SelectItem value="AP">Amapá</SelectItem>
                  <SelectItem value="AM">Amazonas</SelectItem>
                  <SelectItem value="BA">Bahia</SelectItem>
                  <SelectItem value="CE">Ceará</SelectItem>
                  <SelectItem value="DF">Distrito Federal</SelectItem>
                  <SelectItem value="ES">Espírito Santo</SelectItem>
                  <SelectItem value="GO">Goiás</SelectItem>
                  <SelectItem value="MA">Maranhão</SelectItem>
                  <SelectItem value="MT">Mato Grosso</SelectItem>
                  <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                  <SelectItem value="MG">Minas Gerais</SelectItem>
                  <SelectItem value="PA">Pará</SelectItem>
                  <SelectItem value="PB">Paraíba</SelectItem>
                  <SelectItem value="PR">Paraná</SelectItem>
                  <SelectItem value="PE">Pernambuco</SelectItem>
                  <SelectItem value="PI">Piauí</SelectItem>
                  <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                  <SelectItem value="RN">Rio Grande do Norte</SelectItem>
                  <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                  <SelectItem value="RO">Rondônia</SelectItem>
                  <SelectItem value="RR">Roraima</SelectItem>
                  <SelectItem value="SC">Santa Catarina</SelectItem>
                  <SelectItem value="SP">São Paulo</SelectItem>
                  <SelectItem value="SE">Sergipe</SelectItem>
                  <SelectItem value="TO">Tocantins</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Geolocalização */}
          <div className={`p-4 rounded-lg border ${storeAddress.latitude !== -23.5505 ? 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-900' : 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900'}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className={`h-5 w-5 ${storeAddress.latitude !== -23.5505 ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`} />
                  <h3 className={`font-semibold text-sm ${storeAddress.latitude !== -23.5505 ? 'text-green-900 dark:text-green-100' : 'text-blue-900 dark:text-blue-100'}`}>
                    {storeAddress.latitude !== -23.5505 ? 'Localização Confirmada' : 'Geolocalização'}
                  </h3>
                </div>
                <p className={`text-xs ${storeAddress.latitude !== -23.5505 ? 'text-green-700 dark:text-green-300' : 'text-blue-700 dark:text-blue-300'}`}>
                  {storeAddress.latitude !== -23.5505
                    ? `Coordenadas: ${storeAddress.latitude.toFixed(6)}, ${storeAddress.longitude.toFixed(6)}` 
                    : 'Busque as coordenadas da sua loja para calcular distâncias de entrega com precisão'
                  }
                </p>
                {storeAddress.latitude !== -23.5505 && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    ✓ Pronto para calcular zonas de entrega
                  </p>
                )}
              </div>
              <Button
                type="button"
                onClick={handleGeocode}
                disabled={loadingGeocode || !storeAddress.street || !storeAddress.city}
                variant="outline"
                size="sm"
                className={storeAddress.latitude !== -23.5505 ? 'border-green-300 text-green-700 hover:bg-green-100 dark:border-green-700 dark:text-green-400' : 'border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-400'}
              >
                {loadingGeocode ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Buscando...
                  </>
                ) : storeAddress.latitude !== -23.5505 ? (
                  <>
                    <Navigation className="h-4 w-4 mr-1" />
                    Atualizar
                  </>
                ) : (
                  <>
                    <Navigation className="h-4 w-4 mr-1" />
                    Buscar Coordenadas
                  </>
                )}
              </Button>
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