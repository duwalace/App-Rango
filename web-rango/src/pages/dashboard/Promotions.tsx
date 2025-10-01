import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tag } from "lucide-react";

const Promotions = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">Promoções</h1>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Gestão de Promoções
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Crie e gerencie promoções para atrair mais clientes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Promotions;
