/**
 * RevenueChart.tsx
 * Gráfico de receita usando Recharts
 * Mostra GMV vs Receita da Plataforma
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { TrendingUp } from "lucide-react";
import { RevenueDataPoint } from "@/services/adminService";

interface RevenueChartProps {
  data: RevenueDataPoint[];
  title?: string;
}

export function RevenueChart({ data, title = "Evolução de Receita (30 dias)" }: RevenueChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              className="text-xs"
            />
            <YAxis 
              tickFormatter={formatCurrency}
              className="text-xs"
            />
            <Tooltip 
              formatter={(value: number) => formatCurrency(value)}
              labelFormatter={formatDate}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="gmv" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              name="GMV (Faturamento Bruto)"
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="hsl(142 76% 36%)" 
              strokeWidth={2}
              name="Receita da Plataforma"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Legenda adicional */}
        <div className="flex items-center justify-center gap-6 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            <span>GMV Total</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-600"></div>
            <span>Receita (10% + R$2/pedido)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

