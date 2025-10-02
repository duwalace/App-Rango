import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProductFormData, DietaryFlag } from '@/types/menu-advanced';
import { useAuth } from '@/contexts/AuthContext';
import { getStoreCategories } from '@/services/menuService';
import { MenuCategory } from '@/types/shared';
import { Loader2 } from 'lucide-react';

interface BasicInfoStepProps {
  data: Partial<ProductFormData>;
  onUpdate: (updates: Partial<ProductFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  data,
  onUpdate,
  onNext,
  onBack
}) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  
  useEffect(() => {
    loadCategories();
  }, []);
  
  const loadCategories = async () => {
    if (!user?.storeId) return;
    
    try {
      setIsLoadingCategories(true);
      const cats = await getStoreCategories(user.storeId);
      setCategories(cats);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setIsLoadingCategories(false);
    }
  };
  
  const dietaryOptions: { value: DietaryFlag; label: string }[] = [
    { value: 'vegetarian', label: 'Vegetariano' },
    { value: 'vegan', label: 'Vegano' },
    { value: 'gluten-free', label: 'Sem Glúten' },
    { value: 'lactose-free', label: 'Sem Lactose' },
    { value: 'low-carb', label: 'Low Carb' },
    { value: 'keto', label: 'Cetogênico' },
    { value: 'organic', label: 'Orgânico' },
    { value: 'sugar-free', label: 'Sem Açúcar' },
  ];
  
  const toggleDietaryFlag = (flag: DietaryFlag) => {
    const current = data.dietaryFlags || [];
    const updated = current.includes(flag)
      ? current.filter(f => f !== flag)
      : [...current, flag];
    onUpdate({ dietaryFlags: updated });
  };
  
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-6">
          {/* Nome do Produto */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Produto *</Label>
            <Input
              id="name"
              placeholder="Ex: X-Burguer Especial"
              value={data.name || ''}
              onChange={(e) => onUpdate({ name: e.target.value })}
            />
          </div>
          
          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              placeholder="Descreva o produto, ingredientes, diferenciais..."
              rows={4}
              value={data.description || ''}
              onChange={(e) => onUpdate({ description: e.target.value })}
            />
            <p className="text-sm text-muted-foreground">
              {(data.description || '').length} caracteres
            </p>
          </div>
          
          {/* Categoria */}
          <div className="space-y-2">
            <Label htmlFor="category">Categoria *</Label>
            {isLoadingCategories ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando categorias...
              </div>
            ) : categories.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                Nenhuma categoria encontrada. Crie categorias primeiro.
              </div>
            ) : (
              <Select
                value={data.categoryId || ''}
                onValueChange={(value) => onUpdate({ categoryId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          
          {/* Tempo de Preparo e Porção */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prep-time">Tempo de Preparo (min)</Label>
              <Input
                id="prep-time"
                type="number"
                min="1"
                placeholder="15"
                value={data.preparationTime || ''}
                onChange={(e) => onUpdate({ preparationTime: parseInt(e.target.value) || 15 })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="serving">Porção (opcional)</Label>
              <Input
                id="serving"
                placeholder="Ex: Serve 2 pessoas"
                value={data.servingSize || ''}
                onChange={(e) => onUpdate({ servingSize: e.target.value })}
              />
            </div>
          </div>
          
          {/* Flags Dietéticas */}
          <div className="space-y-3">
            <Label>Restrições Alimentares (opcional)</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {dietaryOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleDietaryFlag(option.value)}
                  className={`
                    px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${
                      data.dietaryFlags?.includes(option.value)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>
      
      {/* Navegação */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Cancelar
        </Button>
        <Button onClick={onNext}>
          Continuar
        </Button>
      </div>
    </div>
  );
}; 