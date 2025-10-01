import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, CheckCircle, AlertCircle, TestTube, UserPlus, ShoppingBag } from "lucide-react";
import { seedStoreData, createSampleOrder } from "@/utils/seedData";
import { testFirebaseConnection } from "@/utils/testFirebase";
import { createStoreOwnerUser } from "@/utils/createStoreOwner";
import { generateSampleOrders } from "@/utils/generateSampleOrders";
import { useToast } from "@/hooks/use-toast";

const SeedData = () => {
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(false);
  const [testing, setTesting] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [userCreated, setUserCreated] = useState(false);
  const [generatingOrders, setGeneratingOrders] = useState(false);
  const [ordersGenerated, setOrdersGenerated] = useState(false);
  const [storeData, setStoreData] = useState<{storeId: string, ownerEmail: string, password: string} | null>(null);
  const { toast } = useToast();

  const handleSeedData = async () => {
    setLoading(true);
    try {
      const result = await seedStoreData();
      setStoreData(result);
      setCreated(true);
      toast({
        title: "Sucesso!",
        description: "Dados de exemplo criados com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar dados de exemplo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async () => {
    if (!storeData) return;
    
    setLoading(true);
    try {
      await createSampleOrder(storeData.storeId);
      toast({
        title: "Sucesso!",
        description: "Pedido de exemplo criado!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar pedido de exemplo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestFirebase = async () => {
    setTesting(true);
    try {
      const success = await testFirebaseConnection();
      if (success) {
        toast({
          title: "Sucesso!",
          description: "Firebase está funcionando corretamente!",
        });
      } else {
        toast({
          title: "Erro",
          description: "Problema na conexão com Firebase",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao testar Firebase",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const handleCreateUser = async () => {
    setCreatingUser(true);
    try {
      const result = await createStoreOwnerUser();
      setUserCreated(true);
      toast({
        title: "Sucesso!",
        description: "Usuário criado com sucesso!",
      });
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        toast({
          title: "Usuário já existe",
          description: "O usuário joao@pizzariadojoao.com já existe. Use a senha que você definiu anteriormente.",
        });
        setUserCreated(true);
      } else {
        toast({
          title: "Erro",
          description: "Erro ao criar usuário: " + error.message,
          variant: "destructive",
        });
      }
    } finally {
      setCreatingUser(false);
    }
  };

  const handleGenerateOrders = async () => {
    if (!storeData?.storeId) {
      toast({
        title: "Erro",
        description: "Primeiro crie os dados da loja",
        variant: "destructive",
      });
      return;
    }

    setGeneratingOrders(true);
    try {
      await generateSampleOrders(storeData.storeId);
      setOrdersGenerated(true);
      toast({
        title: "Sucesso!",
        description: "Pedidos de exemplo criados com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar pedidos de exemplo",
        variant: "destructive",
      });
    } finally {
      setGeneratingOrders(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Configuração de Dados de Exemplo
          </h1>
          <p className="text-muted-foreground">
            Popule o Firebase com dados de exemplo para testar a integração
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Dados da Loja
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Loja de Exemplo</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Pizzaria do João</li>
                  <li>• Cardápio completo com categorias</li>
                  <li>• Itens com preços e descrições</li>
                  <li>• Configurações de entrega</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Funcionalidades</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Gestão de cardápio</li>
                  <li>• Controle de pedidos</li>
                  <li>• Sincronização em tempo real</li>
                  <li>• Interface responsiva</li>
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t space-y-2">
              <Button 
                onClick={handleTestFirebase}
                disabled={testing}
                variant="outline"
                className="w-full"
              >
                {testing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                    Testando...
                  </>
                ) : (
                  <>
                    <TestTube className="h-4 w-4 mr-2" />
                    Testar Conexão Firebase
                  </>
                )}
              </Button>
              
              <Button 
                onClick={handleCreateUser}
                disabled={creatingUser || userCreated}
                variant="outline"
                className="w-full"
              >
                {creatingUser ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                    Criando usuário...
                  </>
                ) : userCreated ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Usuário criado!
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Criar Usuário (joao@pizzariadojoao.com)
                  </>
                )}
              </Button>
              
              <Button 
                onClick={handleSeedData}
                disabled={loading || created}
                className="w-full"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Criando dados...
                  </>
                ) : created ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Dados criados!
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4 mr-2" />
                    Criar Dados de Exemplo
                  </>
                )}
              </Button>
              
              {created && storeData && (
                <Button 
                  onClick={handleGenerateOrders}
                  disabled={generatingOrders || ordersGenerated}
                  variant="outline"
                  className="w-full"
                >
                  {generatingOrders ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                      Criando pedidos...
                    </>
                  ) : ordersGenerated ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Pedidos criados!
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Criar Pedidos de Exemplo
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {created && storeData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                Dados Criados com Sucesso!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Informações da Loja</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">ID da Loja</Badge>
                      <code className="text-sm">{storeData.storeId}</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Email do Dono</Badge>
                      <code className="text-sm">{storeData.ownerEmail}</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Senha</Badge>
                      <code className="text-sm">{storeData.password}</code>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Próximos Passos</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>1. Faça login com: {storeData.ownerEmail}</li>
                    <li>2. Use a senha: {storeData.password}</li>
                    <li>3. Acesse o dashboard</li>
                    <li>4. Gerencie o cardápio</li>
                    <li>5. Monitore os pedidos</li>
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button 
                  onClick={handleCreateOrder}
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                      Criando pedido...
                    </>
                  ) : (
                    <>
                      <Database className="h-4 w-4 mr-2" />
                      Criar Pedido de Exemplo
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <AlertCircle className="h-5 w-5" />
              Instruções de Teste
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">1. Teste no Dashboard Web</h3>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Acesse a página de login</li>
                  <li>• Email: joao@pizzariadojoao.com</li>
                  <li>• Senha: 123456</li>
                  <li>• Explore as funcionalidades do dashboard</li>
                  <li>• Teste a gestão de cardápio e pedidos</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">2. Teste no App Mobile</h3>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Execute o app-rango</li>
                  <li>• Faça login como cliente</li>
                  <li>• Navegue pelos restaurantes</li>
                  <li>• Teste o carrinho e pedidos</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">3. Sincronização</h3>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Alterações no web aparecem no app</li>
                  <li>• Pedidos são sincronizados em tempo real</li>
                  <li>• Status dos pedidos atualiza automaticamente</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SeedData;
