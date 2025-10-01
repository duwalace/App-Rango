import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";

const Logistics = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-semibold text-foreground">Logística</h1>
        <Badge>Novo</Badge>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Gestão Logística
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Controle toda a logística de entregas e estoque.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Logistics;
