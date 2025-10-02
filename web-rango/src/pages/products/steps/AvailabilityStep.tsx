import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProductFormData, StockUnit } from '@/types/menu-advanced';

interface AvailabilityStepProps {
  data: Partial<ProductFormData>;
  onUpdate: (updates: Partial<ProductFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const AvailabilityStep: React.FC<AvailabilityStepProps> = ({
  data,
  onUpdate,
  onNext,
  onBack
}) => {
  const stockControl = data.stockControl || {
    enabled: false,
    currentStock: 999,
    minStock: 10,
    maxStock: 1000,
    unit: 'unidades' as StockUnit,
    lastRestocked: new Date(),
    autoDisable: false
  };
  
  const availability = data.availability || {
    alwaysAvailable: true,
    schedules: []
  };
  
  const updateStockControl = (updates: Partial<typeof stockControl>) => {
    onUpdate({
      stockControl: { ...stockControl, ...updates }
    });
  };
  
  const updateAvailability = (updates: Partial<typeof availability>) => {
    onUpdate({
      availability: { ...availability, ...updates }
    });
  };
  
  const stockUnits: StockUnit[] = ['unidades', 'porcoes', 'kg', 'g', 'litros', 'ml'];
  
  return (
    <div className="space-y-6">
      {/* Disponibilidade */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Disponibilidade</h3>
            <p className="text-sm text-muted-foreground">
              Configure quando o produto está disponível
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Produto Disponível</Label>
              <p className="text-sm text-muted-foreground">
                Clientes podem ver e pedir este produto
              </p>
            </div>
            <Switch
              checked={data.isAvailable ?? true}
              onCheckedChange={(checked) => onUpdate({ isAvailable: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Sempre Disponível</Label>
              <p className="text-sm text-muted-foreground">
                Disponível em todos os horários
              </p>
            </div>
            <Switch
              checked={availability.alwaysAvailable}
              onCheckedChange={(checked) => 
                updateAvailability({ alwaysAvailable: checked })
              }
            />
          </div>
        </div>
      </Card>
      
      {/* Controle de Estoque */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Controle de Estoque</h3>
            <p className="text-sm text-muted-foreground">
              Gerencie a quantidade disponível
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Ativar Controle de Estoque</Label>
              <p className="text-sm text-muted-foreground">
                Rastrear quantidade disponível
              </p>
            </div>
            <Switch
              checked={stockControl.enabled}
              onCheckedChange={(checked) => 
                updateStockControl({ enabled: checked })
              }
            />
          </div>
          
          {stockControl.enabled && (
            <div className="grid md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="space-y-2">
                <Label>Estoque Atual</Label>
                <Input
                  type="number"
                  min="0"
                  value={stockControl.currentStock}
                  onChange={(e) => 
                    updateStockControl({ currentStock: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              
              <div className="space-y-2">
                <Label>Unidade</Label>
                <Select
                  value={stockControl.unit}
                  onValueChange={(value) => 
                    updateStockControl({ unit: value as StockUnit })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {stockUnits.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Estoque Mínimo (alerta)</Label>
                <Input
                  type="number"
                  min="0"
                  value={stockControl.minStock}
                  onChange={(e) => 
                    updateStockControl({ minStock: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              
              <div className="space-y-2">
                <Label>Estoque Máximo</Label>
                <Input
                  type="number"
                  min="0"
                  value={stockControl.maxStock}
                  onChange={(e) => 
                    updateStockControl({ maxStock: parseInt(e.target.value) || 1000 })
                  }
                />
              </div>
              
              <div className="md:col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Desabilitar Automaticamente</Label>
                    <p className="text-sm text-muted-foreground">
                      Marcar como indisponível quando estoque chegar a zero
                    </p>
                  </div>
                  <Switch
                    checked={stockControl.autoDisable ?? false}
                    onCheckedChange={(checked) => 
                      updateStockControl({ autoDisable: checked })
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
      
      {/* Navegação */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Voltar
        </Button>
        <Button onClick={onNext}>
          Continuar
        </Button>
      </div>
    </div>
  );
}; 