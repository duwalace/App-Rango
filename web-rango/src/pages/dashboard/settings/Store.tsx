import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Store, Clock, MapPin, Phone, Mail, Camera, Save } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getStoreById, updateStore } from "@/services/storeService";
import { useToast } from "@/hooks/use-toast";

const StoreSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Estados para os dados da loja
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [storeData, setStoreData] = useState({
    name: "",
    description: "",
    category: "",
    phone: "",
    email: "",
    website: "",
    street: "",
    number: "",
    neighborhood: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const [operatingHours, setOperatingHours] = useState([
    { day: "Segunda-feira", key: "segunda-feira", open: "08:00", close: "22:00", isOpen: true },
    { day: "Terça-feira", key: "terça-feira", open: "08:00", close: "22:00", isOpen: true },
    { day: "Quarta-feira", key: "quarta-feira", open: "08:00", close: "22:00", isOpen: true },
    { day: "Quinta-feira", key: "quinta-feira", open: "08:00", close: "22:00", isOpen: true },
    { day: "Sexta-feira", key: "sexta-feira", open: "08:00", close: "23:00", isOpen: true },
    { day: "Sábado", key: "sábado", open: "10:00", close: "23:00", isOpen: true },
    { day: "Domingo", key: "domingo", open: "10:00", close: "21:00", isOpen: false },
  ]);

  const [isStoreActive, setIsStoreActive] = useState(true);

  // Carregar dados da loja
  useEffect(() => {
    const loadStoreData = async () => {
      if (!user?.storeId) {
        setLoading(false);
        return;
      }

      try {
        console.log('🔵 Carregando dados da loja:', user.storeId);
        const store = await getStoreById(user.storeId);
        
        if (store) {
          console.log('✅ Dados da loja carregados:', store);
          
          // Preencher formulário
          setStoreData({
            name: store.name || "",
            description: store.description || "",
            category: store.category || "",
            phone: store.contact?.phone || "",
            email: store.contact?.email || "",
            website: store.contact?.website || "",
            street: store.address?.street || "",
            number: store.address?.number || "",
            neighborhood: store.address?.neighborhood || "",
            city: store.address?.city || "",
            state: store.address?.state || "",
            zipCode: store.address?.zipCode || "",
          });

          // Preencher horários de funcionamento
          if (store.operatingHours) {
            const updatedHours = operatingHours.map(schedule => ({
              ...schedule,
              open: store.operatingHours[schedule.key]?.open || schedule.open,
              close: store.operatingHours[schedule.key]?.close || schedule.close,
              isOpen: store.operatingHours[schedule.key]?.isOpen ?? schedule.isOpen,
            }));
            setOperatingHours(updatedHours);
          }

          setIsStoreActive(store.isActive);
        }
      } catch (error) {
        console.error('❌ Erro ao carregar dados da loja:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar dados da loja",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadStoreData();
  }, [user?.storeId, toast]);

  // Atualizar horário específico
  const updateSchedule = (index: number, field: string, value: any) => {
    const updatedHours = [...operatingHours];
    updatedHours[index] = { ...updatedHours[index], [field]: value };
    setOperatingHours(updatedHours);
  };

  // Salvar alterações
  const handleSave = async () => {
    if (!user?.storeId) {
      toast({
        title: "Erro",
        description: "ID da loja não encontrado",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      console.log('🔵 Salvando alterações da loja...');

      // Converter horários para o formato do Firebase
      const operatingHoursForFirebase = operatingHours.reduce((acc, schedule) => {
        acc[schedule.key] = {
          open: schedule.open,
          close: schedule.close,
          isOpen: schedule.isOpen,
        };
        return acc;
      }, {} as any);

      const updateData = {
        name: storeData.name.trim(),
        description: storeData.description.trim(),
        category: storeData.category.trim(),
        contact: {
          phone: storeData.phone.trim(),
          email: storeData.email.trim(),
          website: storeData.website.trim() || undefined,
        },
        address: {
          street: storeData.street.trim(),
          number: storeData.number.trim(),
          neighborhood: storeData.neighborhood.trim(),
          city: storeData.city.trim(),
          state: storeData.state.trim(),
          zipCode: storeData.zipCode.trim(),
        },
        operatingHours: operatingHoursForFirebase,
        isActive: isStoreActive,
      };

      await updateStore(user.storeId, updateData);
      
      console.log('✅ Loja atualizada com sucesso!');
      toast({
        title: "✅ Configurações salvas!",
        description: "As informações da sua loja foram atualizadas e já estão visíveis no app",
      });

    } catch (error) {
      console.error('❌ Erro ao salvar:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações da loja",
        variant: "destructive",
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configurações da Loja</h1>
          <p className="text-muted-foreground mt-2">
            Configure as informações básicas da sua loja. Alterações aparecerão no app instantaneamente.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Informações Básicas */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="storeName">Nome da Loja</Label>
              <Input 
                id="storeName" 
                value={storeData.name}
                onChange={(e) => setStoreData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Terraço Gourmet"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="storeDescription">Descrição</Label>
              <Textarea 
                id="storeDescription" 
                value={storeData.description}
                onChange={(e) => setStoreData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva sua loja e especialidades..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="storeCategory">Categoria</Label>
              <Input 
                id="storeCategory" 
                value={storeData.category}
                onChange={(e) => setStoreData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="Ex: Restaurante • Comida Caseira"
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Loja Aberta</p>
                <p className="text-sm text-muted-foreground">Status atual da loja no app</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={isStoreActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                  {isStoreActive ? "Aberta" : "Fechada"}
                </Badge>
                <Switch 
                  checked={isStoreActive}
                  onCheckedChange={setIsStoreActive}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contato */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Informações de Contato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input 
                id="phone" 
                value={storeData.phone}
                onChange={(e) => setStoreData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input 
                id="email" 
                type="email" 
                value={storeData.email}
                onChange={(e) => setStoreData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="contato@minhalojajalopila.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Site (opcional)</Label>
              <Input 
                id="website" 
                value={storeData.website}
                onChange={(e) => setStoreData(prev => ({ ...prev, website: e.target.value }))}
                placeholder="www.minhalojajalopila.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input 
                  placeholder="Rua"
                  value={storeData.street}
                  onChange={(e) => setStoreData(prev => ({ ...prev, street: e.target.value }))}
                />
                <Input 
                  placeholder="Número"
                  value={storeData.number}
                  onChange={(e) => setStoreData(prev => ({ ...prev, number: e.target.value }))}
                />
                <Input 
                  placeholder="Bairro"
                  value={storeData.neighborhood}
                  onChange={(e) => setStoreData(prev => ({ ...prev, neighborhood: e.target.value }))}
                />
                <Input 
                  placeholder="CEP"
                  value={storeData.zipCode}
                  onChange={(e) => setStoreData(prev => ({ ...prev, zipCode: e.target.value }))}
                />
                <Input 
                  placeholder="Cidade"
                  value={storeData.city}
                  onChange={(e) => setStoreData(prev => ({ ...prev, city: e.target.value }))}
                />
                <Input 
                  placeholder="Estado"
                  value={storeData.state}
                  onChange={(e) => setStoreData(prev => ({ ...prev, state: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Horário de Funcionamento */}
        <Card className="shadow-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Horário de Funcionamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {operatingHours.map((schedule, index) => (
                <div key={schedule.key} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Switch 
                      checked={schedule.isOpen}
                      onCheckedChange={(checked) => updateSchedule(index, 'isOpen', checked)}
                    />
                    <span className="font-medium min-w-[120px]">{schedule.day}</span>
                  </div>
                  
                  {schedule.isOpen ? (
                    <div className="flex items-center gap-2">
                      <Input 
                        type="time" 
                        value={schedule.open}
                        onChange={(e) => updateSchedule(index, 'open', e.target.value)}
                        className="w-24"
                      />
                      <span className="text-muted-foreground">às</span>
                      <Input 
                        type="time" 
                        value={schedule.close}
                        onChange={(e) => updateSchedule(index, 'close', e.target.value)}
                        className="w-24"
                      />
                    </div>
                  ) : (
                    <Badge variant="secondary">Fechado</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Nota sobre sincronização */}
      <Card className="shadow-card border-l-4 border-l-blue-500">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <h3 className="font-semibold">✨ Sincronização em Tempo Real</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Todas as alterações feitas aqui aparecerão <strong>instantaneamente</strong> no app mobile dos seus clientes. 
            Não é necessário republicar ou aguardar aprovação.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StoreSettings; 