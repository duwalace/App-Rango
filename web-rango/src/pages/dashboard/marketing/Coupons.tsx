import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Ticket, Edit, Trash2, Copy } from "lucide-react";

const Coupons = () => {
  const coupons = [
    {
      id: "PRIMEIRA10",
      description: "10% de desconto para novos clientes",
      type: "Percentual",
      value: "10%",
      minOrder: "R$ 25,00",
      uses: 45,
      maxUses: 100,
      status: "Ativo",
      expiry: "31/03/2025",
    },
    {
      id: "FRETE15",
      description: "R$ 15 de desconto no frete",
      type: "Valor Fixo",
      value: "R$ 15,00",
      minOrder: "R$ 50,00",
      uses: 23,
      maxUses: 50,
      status: "Ativo",
      expiry: "28/02/2025",
    },
    {
      id: "PIZZA20",
      description: "20% off em pizzas",
      type: "Percentual",
      value: "20%",
      minOrder: "R$ 30,00",
      uses: 12,
      maxUses: 30,
      status: "Pausado",
      expiry: "15/04/2025",
    },
    {
      id: "COMBO50",
      description: "R$ 50 off em pedidos acima de R$ 150",
      type: "Valor Fixo",
      value: "R$ 50,00",
      minOrder: "R$ 150,00",
      uses: 8,
      maxUses: 20,
      status: "Ativo",
      expiry: "30/06/2025",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "Pausado":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "Expirado":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const stats = [
    { title: "Cupons Ativos", value: "3", change: "+1 este mês" },
    { title: "Desconto Total", value: "R$ 2,340", change: "+15%" },
    { title: "Taxa de Uso", value: "78%", change: "+12%" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cupons de Desconto</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie os cupons promocionais da sua loja
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          Criar Cupom
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <span className="text-xs text-green-600">{stat.change}</span>
                </div>
                <Ticket className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtros e Busca */}
      <Card className="shadow-card">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar cupons..." className="pl-10" />
            </div>
            <Button variant="outline">Todos os Status</Button>
            <Button variant="outline">Filtrar por Tipo</Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Cupons */}
      <div className="grid gap-4">
        {coupons.map((coupon) => (
          <Card key={coupon.id} className="shadow-card hover:shadow-card-hover transition-smooth">
            <CardContent className="p-6">
              <div className="grid lg:grid-cols-6 gap-4 items-center">
                <div className="lg:col-span-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Ticket className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-lg text-foreground">{coupon.id}</p>
                      <p className="text-sm text-muted-foreground">{coupon.description}</p>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Tipo</p>
                  <p className="font-medium">{coupon.type}</p>
                </div>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Desconto</p>
                  <p className="font-bold text-primary text-lg">{coupon.value}</p>
                  <p className="text-xs text-muted-foreground">Min: {coupon.minOrder}</p>
                </div>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Uso</p>
                  <p className="font-medium">{coupon.uses}/{coupon.maxUses}</p>
                  <div className="w-full bg-muted rounded-full h-1 mt-1">
                    <div
                      className="bg-primary h-1 rounded-full"
                      style={{ width: `${(coupon.uses / coupon.maxUses) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="text-center">
                  <Badge className={getStatusColor(coupon.status)}>
                    {coupon.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    Expira: {coupon.expiry}
                  </p>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" size="icon">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dicas para Cupons */}
      <Card className="shadow-card border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="text-lg">💡 Dicas para Cupons Eficazes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <ul className="space-y-2">
              <li>• Use códigos fáceis de lembrar</li>
              <li>• Defina um valor mínimo de pedido</li>
              <li>• Limite o número de usos</li>
            </ul>
            <ul className="space-y-2">
              <li>• Crie urgência com data de expiração</li>
              <li>• Teste diferentes tipos de desconto</li>
              <li>• Monitore a performance regularmente</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Coupons; 