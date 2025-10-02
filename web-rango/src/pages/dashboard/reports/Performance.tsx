import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Clock, Star } from "lucide-react";

const Performance = () => {
  const kpis = [
    {
      title: "Vendas Hoje",
      value: "R$ 2,340",
      change: "+12.5%",
      isPositive: true,
      icon: DollarSign,
    },
    {
      title: "Pedidos Hoje",
      value: "47",
      change: "+8.3%",
      isPositive: true,
      icon: ShoppingBag,
    },
    {
      title: "Tempo Médio",
      value: "22 min",
      change: "-3.2%",
      isPositive: true,
      icon: Clock,
    },
    {
      title: "Avaliação Média",
      value: "4.8",
      change: "+0.2",
      isPositive: true,
      icon: Star,
    },
  ];

  const topProducts = [
    { name: "X-Burger Especial", sales: 23, revenue: "R$ 595,70" },
    { name: "Pizza Margherita", sales: 18, revenue: "R$ 810,00" },
    { name: "Hambúrguer Artesanal", sales: 15, revenue: "R$ 487,50" },
    { name: "Batata Frita Grande", sales: 31, revenue: "R$ 310,00" },
  ];

  const salesData = [
    { hour: "06:00", sales: 5 },
    { hour: "08:00", sales: 12 },
    { hour: "10:00", sales: 8 },
    { hour: "12:00", sales: 25 },
    { hour: "14:00", sales: 18 },
    { hour: "16:00", sales: 15 },
    { hour: "18:00", sales: 32 },
    { hour: "20:00", sales: 28 },
    { hour: "22:00", sales: 15 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Desempenho da Loja</h1>
          <p className="text-muted-foreground mt-2">
            Acompanhe as métricas principais do seu negócio
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Últimos 7 dias</Button>
          <Button variant="outline">Últimos 30 dias</Button>
          <Button>Exportar Relatório</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid md:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <Card key={kpi.title} className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.title}</p>
                  <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {kpi.isPositive ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                    <span className={`text-xs font-medium ${
                      kpi.isPositive ? "text-green-600" : "text-red-600"
                    }`}>
                      {kpi.change}
                    </span>
                  </div>
                </div>
                <kpi.icon className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Gráfico de Vendas por Hora */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Vendas por Horário</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {salesData.map((data) => (
                <div key={data.hour} className="flex items-center gap-4">
                  <span className="text-sm font-medium w-12">{data.hour}</span>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-smooth"
                      style={{ width: `${(data.sales / 35) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8">{data.sales}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Produtos */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Produtos Mais Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.sales} vendas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{product.revenue}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparativo de Períodos */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Comparativo de Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">R$ 45,230</p>
              <p className="text-sm text-muted-foreground">Este mês</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="text-xs text-green-600 font-medium">+15.3%</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">R$ 39,180</p>
              <p className="text-sm text-muted-foreground">Mês anterior</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">R$ 6,050</p>
              <p className="text-sm text-muted-foreground">Diferença</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="text-xs text-green-600 font-medium">Crescimento</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Performance; 