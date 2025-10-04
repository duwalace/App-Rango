/**
 * KpiCard.tsx
 * Componente reutilizável para exibir KPIs (Key Performance Indicators)
 * Design limpo com densidade de informação otimizada
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  badges?: Array<{
    label: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
    icon?: LucideIcon;
  }>;
  color?: "default" | "green" | "blue" | "orange" | "red";
  className?: string;
}

const colorClasses = {
  default: "text-foreground",
  green: "text-green-600 dark:text-green-400",
  blue: "text-blue-600 dark:text-blue-400",
  orange: "text-orange-600 dark:text-orange-400",
  red: "text-red-600 dark:text-red-400",
};

export function KpiCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  badges,
  color = "default",
  className
}: KpiCardProps) {
  return (
    <Card className={cn("transition-all hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className={cn("text-3xl font-bold mb-2", colorClasses[color])}>
          {value}
        </div>

        {description && (
          <p className="text-xs text-muted-foreground mb-3">
            {description}
          </p>
        )}

        {trend && (
          <div className="flex items-center gap-1 text-xs mb-2">
            {trend.isPositive ? (
              <TrendingUp className="h-3 w-3 text-green-600" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-600" />
            )}
            <span className={trend.isPositive ? "text-green-600" : "text-red-600"}>
              {trend.value > 0 ? "+" : ""}{trend.value}%
            </span>
            <span className="text-muted-foreground">{trend.label}</span>
          </div>
        )}

        {badges && badges.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {badges.map((badge, index) => {
              const BadgeIcon = badge.icon;
              return (
                <Badge key={index} variant={badge.variant || "default"} className="text-xs">
                  {BadgeIcon && <BadgeIcon className="h-3 w-3 mr-1" />}
                  {badge.label}
                </Badge>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

