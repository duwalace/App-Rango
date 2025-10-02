import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2 } from 'lucide-react';
import { ProductFormData, MenuItemVariation } from '@/types/menu-advanced';

interface PricingStepProps {
  data: Partial<ProductFormData>;
  onUpdate: (updates: Partial<ProductFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const PricingStep: React.FC<PricingStepProps> = ({
  data,
  onUpdate,
  onNext,
  onBack
}) => {
  const [variations, setVariations] = useState<MenuItemVariation[]>(
    data.variations || []
  );
  
  const addVariation = () => {
    const newVariation: MenuItemVariation = {
      id: `var-${Date.now()}`,
      name: '',
      description: '',
      priceModifier: 0,
      isAvailable: true,
      isDefault: variations.length === 0,
      order: variations.length
    };
    
    setVariations([...variations, newVariation]);
  };
  
  const updateVariation = (id: string, updates: Partial<MenuItemVariation>) => {
    setVariations(variations.map(v => 
      v.id === id ? { ...v, ...updates } : v
    ));
  };
  
  const deleteVariation = (id: string) => {
    setVariations(variations.filter(v => v.id !== id));
  };
  
  const handleContinue = () => {
    onUpdate({ variations });
    onNext();
  };
  
  return (
    <div className="space-y-6">
      {/* Preço Base */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Preço Base</h3>
            <p className="text-sm text-muted-foreground">
              Preço principal do produto
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="base-price">Preço (R$) *</Label>
            <Input
              id="base-price"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={data.basePrice || ''}
              onChange={(e) => onUpdate({ basePrice: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>
      </Card>
      
      {/* Variações */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Variações de Tamanho/Sabor</h3>
              <p className="text-sm text-muted-foreground">
                Opcional - Ex: Pequeno, Médio, Grande
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={addVariation}>
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          </div>
          
          {variations.length > 0 ? (
            <div className="space-y-3">
              {variations.map((variation) => (
                <Card key={variation.id} className="p-4">
                  <div className="grid md:grid-cols-12 gap-3">
                    <div className="md:col-span-4">
                      <Input
                        placeholder="Nome (ex: Médio)"
                        value={variation.name}
                        onChange={(e) => updateVariation(variation.id, { name: e.target.value })}
                      />
                    </div>
                    
                    <div className="md:col-span-3">
                      <Input
                        placeholder="Descrição"
                        value={variation.description}
                        onChange={(e) => updateVariation(variation.id, { description: e.target.value })}
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="+ R$"
                        value={variation.priceModifier}
                        onChange={(e) => 
                          updateVariation(variation.id, { priceModifier: parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>
                    
                    <div className="md:col-span-2 flex items-center justify-center gap-2">
                      <Switch
                        checked={variation.isAvailable}
                        onCheckedChange={(checked) =>
                          updateVariation(variation.id, { isAvailable: checked })
                        }
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteVariation(variation.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground mb-2">
                Nenhuma variação adicionada
              </p>
              <Button size="sm" variant="ghost" onClick={addVariation}>
                <Plus className="h-4 w-4 mr-1" />
                Adicionar Variação
              </Button>
            </div>
          )}
        </div>
      </Card>
      
      {/* Navegação */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Voltar
        </Button>
        <Button onClick={handleContinue}>
          Continuar
        </Button>
      </div>
    </div>
  );
}; 