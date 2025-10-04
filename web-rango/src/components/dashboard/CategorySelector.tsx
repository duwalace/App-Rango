/**
 * CategorySelector.tsx
 * Componente para seleção de categorias de loja
 * Lojistas podem selecionar múltiplas categorias para classificar seu estabelecimento
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tag, AlertCircle } from "lucide-react";
import { getActiveStoreTypes, StoreType } from "@/services/adminService";

interface CategorySelectorProps {
  selectedCategories: string[]; // Array de IDs das categorias selecionadas
  onChange: (categories: string[]) => void;
}

export function CategorySelector({ selectedCategories, onChange }: CategorySelectorProps) {
  const [availableTypes, setAvailableTypes] = useState<StoreType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      console.log('🔍 CategorySelector: Iniciando carregamento de categorias...');
      const types = await getActiveStoreTypes();
      console.log('✅ CategorySelector: Categorias carregadas:', types);
      setAvailableTypes(types);
    } catch (error) {
      console.error('❌ CategorySelector: Erro ao carregar categorias:', error);
      // Mostrar erro mesmo assim para não ficar travado
      setAvailableTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCategory = (categoryId: string) => {
    const isSelected = selectedCategories.includes(categoryId);
    
    if (isSelected) {
      // Remover categoria
      onChange(selectedCategories.filter(id => id !== categoryId));
    } else {
      // Adicionar categoria
      onChange([...selectedCategories, categoryId]);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Categorias da Loja
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (availableTypes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Categorias da Loja
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">Nenhuma categoria disponível no momento</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          Categorias da Loja
        </CardTitle>
        <CardDescription>
          Selecione as categorias que melhor descrevem seu estabelecimento. 
          Você pode selecionar múltiplas categorias.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Preview das categorias selecionadas */}
          {selectedCategories.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">Selecionadas:</span>
              {selectedCategories.map(categoryId => {
                const category = availableTypes.find(t => t.id === categoryId);
                return category ? (
                  <Badge key={categoryId} variant="default">
                    <span className="mr-1">{category.icon}</span>
                    {category.name}
                  </Badge>
                ) : null;
              })}
            </div>
          )}

          {/* Lista de checkboxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableTypes.map((type) => {
              const isChecked = selectedCategories.includes(type.id);
              
              return (
                <div
                  key={type.id}
                  className={`flex items-start space-x-3 p-3 rounded-lg border-2 transition-all cursor-pointer hover:bg-accent/50 ${
                    isChecked ? 'border-primary bg-primary/5' : 'border-muted'
                  }`}
                  onClick={() => handleToggleCategory(type.id)}
                >
                  <Checkbox
                    id={`category-${type.id}`}
                    checked={isChecked}
                    onCheckedChange={() => handleToggleCategory(type.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={`category-${type.id}`}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <span className="text-2xl">{type.icon}</span>
                      <span className="font-medium">{type.name}</span>
                    </Label>
                    {type.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {type.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Hint */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-xs text-blue-700 dark:text-blue-300">
              <p className="font-medium mb-1">Por que isso é importante?</p>
              <p>
                As categorias selecionadas ajudam os clientes a encontrar sua loja mais facilmente 
                através dos filtros de busca no aplicativo. Escolha todas as categorias relevantes 
                para maximizar sua visibilidade.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

