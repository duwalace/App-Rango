import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, CreditCard, Wallet, Download } from "lucide-react";

const Financial = () => {
  const financialData = [
    { month: "Jan", receita: 15430, despesas: 8200 },
    { month: "Fev", receita: 18250, despesas: 9100 },
    { month: "Mar", receita: 21400, despesas: 10300 },
    { month: "Abr", receita: 19800, despesas: 9800 },
    { month: "Mai", receita: 23650, despesas: 11200 },
    { month: "Jun", receita: 26100, despesas: 12400 },
  ];

  const kpis = [
    {
      title: "Receita Total",
      value: "R$ 124,630",
      change: "+18.2%",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Despesas Totais", 
      value: "R$ 61,000",
      change: "+12.1%",
      icon: CreditCard,
      color: "text-red-600",
    },
    {
      title: "Lucro Líquido",
      value: "R$ 63,630",
      change: "+25.3%",
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      title: "Margem de Lucro",
      value: "51.1%",
      change: "+3.2%",
      icon: Wallet,
      color: "text-blue-600",
    },
  ];

  const expenses = [
    { category: "Ingredientes", amount: "R$ 28,500", percentage: 47 },
    { category: "Pessoal", amount: "R$ 18,300", percentage: 30 },
    { category: "Aluguel", amount: "R$ 8,500", percentage: 14 },
    { category: "Marketing", amount: "R$ 3,200", percentage: 5 },
    { category: "Outros", amount: "R$ 2,500", percentage: 4 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Relatório Financeiro</h1>
          <p className="text-muted-foreground mt-2">
            Visão completa das finanças do seu negócio
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4" />
            Exportar PDF
          </Button>
          <Button>Gerar Relatório</Button>
        </div>
      </div>

      {/* KPIs Financeiros */}
      <div className="grid md:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <Card key={kpi.title} className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.title}</p>
                  <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                  <span className={`text-xs font-medium ${kpi.color}`}>
                    {kpi.change} vs. mês anterior
                  </span>
                </div>
                <kpi.icon className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Gráfico de Receita vs Despesas */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Receita vs Despesas (6 meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {financialData.map((data) => (
                <div key={data.month} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{data.month}</span>
                    <span className="text-muted-foreground">
                      R$ {(data.receita - data.despesas).toLocaleString()}
                    </span>
                  </div>
                  <div className="relative">
                    <div className="flex gap-1 h-8 rounded overflow-hidden">
                      <div 
                        className="bg-green-500 flex items-center justify-center text-xs text-white font-medium"
                        style={{ width: `${(data.receita / 30000) * 100}%` }}
                      >
                        R$ {(data.receita / 1000).toFixed(0)}k
                      </div>
                      <div 
                        className="bg-red-500 flex items-center justify-center text-xs text-white font-medium"
                        style={{ width: `${(data.despesas / 30000) * 100}%` }}
                      >
                        R$ {(data.despesas / 1000).toFixed(0)}k
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Receita</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Despesas</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Breakdown de Despesas */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Distribuição de Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expenses.map((expense) => (
                <div key={expense.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{expense.category}</span>
                    <span className="text-sm text-muted-foreground">
                      {expense.amount} ({expense.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-smooth"
                      style={{ width: `${expense.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Total de Despesas</span>
                <span className="text-lg font-bold text-primary">R$ 61,000</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projeções */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Projeções para Próximo Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-2xl font-bold text-green-600">R$ 28,500</p>
              <p className="text-sm text-muted-foreground">Receita Projetada</p>
              <p className="text-xs text-green-600 mt-1">+9% crescimento estimado</p>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">R$ 13,200</p>
              <p className="text-sm text-muted-foreground">Despesas Estimadas</p>
              <p className="text-xs text-blue-600 mt-1">+6% vs. mês atual</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">R$ 15,300</p>
              <p className="text-sm text-muted-foreground">Lucro Estimado</p>
              <p className="text-xs text-yellow-600 mt-1">53.7% margem projetada</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Financial; 