import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

const DeliveryArea = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">Área de entrega</h1>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Gestão de Área de Entrega
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Defina as áreas onde seu restaurante realiza entregas.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryArea;
