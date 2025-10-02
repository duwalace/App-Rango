import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, Copy, Trash2, Plus } from "lucide-react";
import { useState } from "react";

interface ComplementItem {
  id: string;
  name: string;
  price: number;
  active: boolean;
}

interface ComplementGroupCardProps {
  groupName: string;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

export const ComplementGroupCard = ({
  groupName,
  onDelete,
  onDuplicate,
}: ComplementGroupCardProps) => {
  const [items, setItems] = useState<ComplementItem[]>([
    { id: "1", name: "Queijo extra", price: 3.50, active: true },
    { id: "2", name: "Bacon", price: 4.00, active: true },
  ]);

  return (
    <Card className="p-6 space-y-6 shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">{groupName}</h3>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-muted rounded-lg transition-smooth">
            <Link className="h-4 w-4 text-muted-foreground" />
          </button>
          <button 
            onClick={onDuplicate}
            className="p-2 hover:bg-muted rounded-lg transition-smooth"
          >
            <Copy className="h-4 w-4 text-muted-foreground" />
          </button>
          <button 
            onClick={onDelete}
            className="p-2 hover:bg-destructive/10 rounded-lg transition-smooth"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </button>
        </div>
      </div>

      {/* Configuration */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Tipo</label>
          <Select defaultValue="opcional">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="obrigatorio">Obrigatório</SelectItem>
              <SelectItem value="opcional">Opcional</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Qtd. Mínima</label>
          <Input type="number" defaultValue="0" min="0" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Qtd. Máxima</label>
          <Input type="number" defaultValue="1" min="1" />
        </div>
      </div>

      {/* Items table */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-foreground">Itens</h4>
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Nome</th>
                <th className="text-right p-3 text-sm font-medium text-muted-foreground">Preço</th>
                <th className="text-center p-3 text-sm font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-smooth">
                  <td className="p-3 text-sm text-foreground">{item.name}</td>
                  <td className="p-3 text-sm text-right text-foreground">
                    R$ {item.price.toFixed(2)}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        item.active
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {item.active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <Button variant="outline-primary" size="sm" className="w-full">
          <Plus className="h-4 w-4" />
          Adicionar item
        </Button>
      </div>
    </Card>
  );
};
