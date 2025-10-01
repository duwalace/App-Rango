import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Store, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  DollarSign,
  Truck,
  Save,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { getStoreById, updateStore } from '@/services/storeService';
import { Store as StoreType, OperatingHours } from '@/types/shared';

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Segunda-feira' },
  { key: 'tuesday', label: 'Terça-feira' },
  { key: 'wednesday', label: 'Quarta-feira' },
  { key: 'thursday', label: 'Quinta-feira' },
  { key: 'friday', label: 'Sexta-feira' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' }
];

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [store, setStore] = useState<StoreType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Estados dos formulários
  const [storeForm, setStoreForm] = useState({
    name: '',
    description: '',
    category: '',
    logo: '',
    coverImage: ''
  });

  const [contactForm, setContactForm] = useState({
    phone: '',
    email: '',
    website: ''
  });

  const [addressForm, setAddressForm] = useState({
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: ''
  });

  const [deliveryForm, setDeliveryForm] = useState({
    deliveryTime: '',
    deliveryFee: '',
    freeDeliveryMinValue: '',
    deliveryRadius: ''
  });

  const [operatingHours, setOperatingHours] = useState<OperatingHours>({
    monday: { isOpen: false, openTime: '08:00', closeTime: '22:00' },
    tuesday: { isOpen: false, openTime: '08:00', closeTime: '22:00' },
    wednesday: { isOpen: false, openTime: '08:00', closeTime: '22:00' },
    thursday: { isOpen: false, openTime: '08:00', closeTime: '22:00' },
    friday: { isOpen: false, openTime: '08:00', closeTime: '22:00' },
    saturday: { isOpen: false, openTime: '08:00', closeTime: '22:00' },
    sunday: { isOpen: false, openTime: '08:00', closeTime: '22:00' }
  });

  const [storeActive, setStoreActive] = useState(true);

  // Carregar dados da loja
  useEffect(() => {
    if (!user?.storeId) return;

    const loadStore = async () => {
      try {
        console.log('🔵 Carregando dados da loja:', user.storeId);
        const storeData = await getStoreById(user.storeId);
        
        if (storeData) {
          setStore(storeData);
          
          // Preencher formulários
          setStoreForm({
            name: storeData.name,
            description: storeData.description,
            category: storeData.category,
            logo: storeData.logo || '',
            coverImage: storeData.coverImage || ''
          });

          setContactForm({
            phone: storeData.contact.phone,
            email: storeData.contact.email,
            website: storeData.contact.website || ''
          });

          setAddressForm({
            street: storeData.address.street,
            number: storeData.address.number,
            neighborhood: storeData.address.neighborhood,
            city: storeData.address.city,
            state: storeData.address.state,
            zipCode: storeData.address.zipCode
          });

          setDeliveryForm({
            deliveryTime: storeData.delivery.deliveryTime,
            deliveryFee: storeData.delivery.deliveryFee.toString(),
            freeDeliveryMinValue: storeData.delivery.freeDeliveryMinValue.toString(),
            deliveryRadius: storeData.delivery.deliveryRadius.toString()
          });

          setOperatingHours(storeData.operatingHours);
          setStoreActive(storeData.isActive);
          
          console.log('✅ Dados da loja carregados');
        }
      } catch (error) {
        console.error('❌ Erro ao carregar loja:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao carregar dados da loja',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadStore();
  }, [user?.storeId, toast]);

  // Salvar alterações
  const handleSave = async () => {
    if (!store || !user?.storeId) return;

    setSaving(true);
    try {
      console.log('🔵 Salvando alterações da loja...');

      const updatedStore = {
        name: storeForm.name.trim(),
        description: storeForm.description.trim(),
        category: storeForm.category,
        logo: storeForm.logo,
        coverImage: storeForm.coverImage,
        contact: {
          phone: contactForm.phone,
          email: contactForm.email,
          website: contactForm.website
        },
        address: {
          street: addressForm.street,
          number: addressForm.number,
          neighborhood: addressForm.neighborhood,
          city: addressForm.city,
          state: addressForm.state,
          zipCode: addressForm.zipCode
        },
        delivery: {
          deliveryTime: deliveryForm.deliveryTime,
          deliveryFee: parseFloat(deliveryForm.deliveryFee),
          freeDeliveryMinValue: parseFloat(deliveryForm.freeDeliveryMinValue),
          deliveryRadius: parseInt(deliveryForm.deliveryRadius)
        },
        operatingHours,
        isActive: storeActive
      };

      await updateStore(user.storeId, updatedStore);
      
      console.log('✅ Loja atualizada com sucesso');
      toast({
        title: '✅ Configurações salvas!',
        description: 'As informações da sua loja foram atualizadas'
      });

      // Recarregar dados
      const updatedStoreData = await getStoreById(user.storeId);
      setStore(updatedStoreData);

    } catch (error) {
      console.error('❌ Erro ao salvar:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar configurações',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // Atualizar horário de funcionamento
  const updateOperatingHour = (day: string, field: string, value: any) => {
    setOperatingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day as keyof OperatingHours],
        [field]: value
      }
    }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 mx-auto mb-3 text-red-500" />
        <p className="text-gray-600">Erro ao carregar dados da loja</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configurações da Loja</h1>
          <p className="text-gray-600 mt-1">Gerencie as informações e configurações da sua loja</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={storeActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
            {storeActive ? 'Loja Ativa' : 'Loja Inativa'}
          </Badge>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Informações Básicas
            </CardTitle>
            <CardDescription>
              Dados principais da sua loja
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="storeName">Nome da Loja *</Label>
              <Input
                id="storeName"
                value={storeForm.name}
                onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                placeholder="Nome da sua loja"
              />
            </div>
            <div>
              <Label htmlFor="storeDescription">Descrição</Label>
              <Textarea
                id="storeDescription"
                value={storeForm.description}
                onChange={(e) => setStoreForm({ ...storeForm, description: e.target.value })}
                placeholder="Descrição da sua loja"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="storeCategory">Categoria</Label>
              <Input
                id="storeCategory"
                value={storeForm.category}
                onChange={(e) => setStoreForm({ ...storeForm, category: e.target.value })}
                placeholder="Ex: Restaurante, Lanchonete, Pizzaria"
              />
            </div>
            <div>
              <Label htmlFor="storeLogo">URL do Logo</Label>
              <Input
                id="storeLogo"
                value={storeForm.logo}
                onChange={(e) => setStoreForm({ ...storeForm, logo: e.target.value })}
                placeholder="https://exemplo.com/logo.jpg"
              />
            </div>
            <div>
              <Label htmlFor="storeCover">URL da Imagem de Capa</Label>
              <Input
                id="storeCover"
                value={storeForm.coverImage}
                onChange={(e) => setStoreForm({ ...storeForm, coverImage: e.target.value })}
                placeholder="https://exemplo.com/capa.jpg"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="storeActive"
                checked={storeActive}
                onCheckedChange={setStoreActive}
              />
              <Label htmlFor="storeActive">Loja ativa</Label>
            </div>
          </CardContent>
        </Card>

        {/* Contato */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Informações de Contato
            </CardTitle>
            <CardDescription>
              Como os clientes podem entrar em contato
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="contactPhone">Telefone *</Label>
              <Input
                id="contactPhone"
                value={contactForm.phone}
                onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                placeholder="(11) 99999-9999"
              />
            </div>
            <div>
              <Label htmlFor="contactEmail">E-mail *</Label>
              <Input
                id="contactEmail"
                type="email"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                placeholder="contato@minhaloja.com"
              />
            </div>
            <div>
              <Label htmlFor="contactWebsite">Website</Label>
              <Input
                id="contactWebsite"
                value={contactForm.website}
                onChange={(e) => setContactForm({ ...contactForm, website: e.target.value })}
                placeholder="https://www.minhaloja.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Endereço */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Endereço
            </CardTitle>
            <CardDescription>
              Localização da sua loja
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <Label htmlFor="addressStreet">Rua *</Label>
                <Input
                  id="addressStreet"
                  value={addressForm.street}
                  onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                  placeholder="Nome da rua"
                />
              </div>
              <div>
                <Label htmlFor="addressNumber">Número *</Label>
                <Input
                  id="addressNumber"
                  value={addressForm.number}
                  onChange={(e) => setAddressForm({ ...addressForm, number: e.target.value })}
                  placeholder="123"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="addressNeighborhood">Bairro *</Label>
              <Input
                id="addressNeighborhood"
                value={addressForm.neighborhood}
                onChange={(e) => setAddressForm({ ...addressForm, neighborhood: e.target.value })}
                placeholder="Nome do bairro"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="addressCity">Cidade *</Label>
                <Input
                  id="addressCity"
                  value={addressForm.city}
                  onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                  placeholder="Nome da cidade"
                />
              </div>
              <div>
                <Label htmlFor="addressState">Estado *</Label>
                <Input
                  id="addressState"
                  value={addressForm.state}
                  onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                  placeholder="SP"
                  maxLength={2}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="addressZip">CEP *</Label>
              <Input
                id="addressZip"
                value={addressForm.zipCode}
                onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                placeholder="12345-678"
              />
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Delivery */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Configurações de Delivery
            </CardTitle>
            <CardDescription>
              Configurações de entrega e taxas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="deliveryTime">Tempo de Entrega</Label>
              <Input
                id="deliveryTime"
                value={deliveryForm.deliveryTime}
                onChange={(e) => setDeliveryForm({ ...deliveryForm, deliveryTime: e.target.value })}
                placeholder="30-45 min"
              />
            </div>
            <div>
              <Label htmlFor="deliveryFee">Taxa de Entrega (R$)</Label>
              <Input
                id="deliveryFee"
                type="number"
                step="0.01"
                value={deliveryForm.deliveryFee}
                onChange={(e) => setDeliveryForm({ ...deliveryForm, deliveryFee: e.target.value })}
                placeholder="5.00"
              />
            </div>
            <div>
              <Label htmlFor="freeDelivery">Valor Mínimo para Frete Grátis (R$)</Label>
              <Input
                id="freeDelivery"
                type="number"
                step="0.01"
                value={deliveryForm.freeDeliveryMinValue}
                onChange={(e) => setDeliveryForm({ ...deliveryForm, freeDeliveryMinValue: e.target.value })}
                placeholder="30.00"
              />
            </div>
            <div>
              <Label htmlFor="deliveryRadius">Raio de Entrega (km)</Label>
              <Input
                id="deliveryRadius"
                type="number"
                value={deliveryForm.deliveryRadius}
                onChange={(e) => setDeliveryForm({ ...deliveryForm, deliveryRadius: e.target.value })}
                placeholder="10"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Horário de Funcionamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Horário de Funcionamento
          </CardTitle>
          <CardDescription>
            Configure os horários de abertura e fechamento para cada dia da semana
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {DAYS_OF_WEEK.map(day => (
              <div key={day.key} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="w-32">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={operatingHours[day.key as keyof OperatingHours].isOpen}
                      onCheckedChange={(checked) => updateOperatingHour(day.key, 'isOpen', checked)}
                    />
                    <Label className="font-medium">{day.label}</Label>
                  </div>
                </div>
                
                {operatingHours[day.key as keyof OperatingHours].isOpen ? (
                  <div className="flex items-center gap-2 flex-1">
                    <div>
                      <Label className="text-xs text-gray-500">Abertura</Label>
                      <Input
                        type="time"
                        value={operatingHours[day.key as keyof OperatingHours].openTime}
                        onChange={(e) => updateOperatingHour(day.key, 'openTime', e.target.value)}
                        className="w-24"
                      />
                    </div>
                    <span className="text-gray-400">até</span>
                    <div>
                      <Label className="text-xs text-gray-500">Fechamento</Label>
                      <Input
                        type="time"
                        value={operatingHours[day.key as keyof OperatingHours].closeTime}
                        onChange={(e) => updateOperatingHour(day.key, 'closeTime', e.target.value)}
                        className="w-24"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex-1">
                    <Badge variant="secondary">Fechado</Badge>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resumo das Configurações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Resumo das Configurações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-sm text-gray-600">Taxa de Entrega</p>
              <p className="font-bold">{formatCurrency(parseFloat(deliveryForm.deliveryFee) || 0)}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Truck className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="text-sm text-gray-600">Tempo de Entrega</p>
              <p className="font-bold">{deliveryForm.deliveryTime || 'Não definido'}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <MapPin className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <p className="text-sm text-gray-600">Raio de Entrega</p>
              <p className="font-bold">{deliveryForm.deliveryRadius || 0} km</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Clock className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <p className="text-sm text-gray-600">Dias Abertos</p>
              <p className="font-bold">
                {Object.values(operatingHours).filter(day => day.isOpen).length} dias
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
