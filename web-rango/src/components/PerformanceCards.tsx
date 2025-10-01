import { MessageSquare, CreditCard, Megaphone } from "lucide-react";
import { Card } from "@/components/ui/card";

const cards = [
  {
    icon: MessageSquare,
    title: "Mensagens da Chat",
    subtitle: "Confira as mensagens",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    icon: CreditCard,
    title: "Opções de pagamento",
    subtitle: "VR e VA liberados! Confira",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    icon: Megaphone,
    title: "Banners para ajudar",
    subtitle: "Confira a lista de banners",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
];

export function PerformanceCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card, index) => (
        <Card
          key={index}
          className="p-4 flex items-start gap-4 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className={`${card.iconBg} p-3 rounded-lg`}>
            <card.icon className={`h-6 w-6 ${card.iconColor}`} />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-foreground">{card.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{card.subtitle}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
