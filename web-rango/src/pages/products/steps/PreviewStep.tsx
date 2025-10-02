import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProductFormData } from '@/types/menu-advanced';
import { Edit, Check, Loader2, Star } from 'lucide-react';

interface PreviewStepProps {
  data: Partial<ProductFormData>;
  onSubmit: () => void;
  onBack: () => void;
  onEdit: (step: number) => void;
  isSubmitting: boolean;
}

export const PreviewStep: React.FC<PreviewStepProps> = ({
  data,
  onSubmit,
  onBack,
  onEdit,
  isSubmitting
}) => {
  const primaryImage = data.images?.find(img => img.isPrimary) || data.images?.[0];
  
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Revisar Produto</h2>
          <p className="text-muted-foreground mt-1">
            Confira todas as informações antes de criar
          </p>
        </div>
        
        {/* Preview Visual */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Imagem Principal */}
          <div>
            {primaryImage ? (
              <div className="aspect-square rounded-lg overflow-hidden">
                <img 
                  src={primaryImage.url}
                  alt={data.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-square rounded-lg bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">Sem imagem</p>
              </div>
            )}
            
            {data.images && data.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2 mt-2">
                {data.images.slice(1, 5).map((img, idx) => (
                  <div key={img.id} className="aspect-square rounded overflow-hidden">
                    <img 
                      src={img.thumbnailUrl}
                      alt={`${data.name} ${idx + 2}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Informações */}
          <div className="space-y-4">
            <div>
              <h3 className="text-2xl font-bold">{data.name}</h3>
              <p className="text-muted-foreground mt-1">{data.description}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-primary">
                R$ {(data.basePrice || 0).toFixed(2)}
              </span>
              {data.preparationTime && (
                <Badge variant="secondary">
                  ⏱️ {data.preparationTime} min
                </Badge>
              )}
            </div>
            
            {/* Flags Dietéticas */}
            {data.dietaryFlags && data.dietaryFlags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {data.dietaryFlags.map(flag => (
                  <Badge key={flag} variant="outline">
                    {flag}
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Disponibilidade */}
            <div className="flex items-center gap-2">
              {data.isAvailable ? (
                <Badge className="bg-green-500">Disponível</Badge>
              ) : (
                <Badge variant="destructive">Indisponível</Badge>
              )}
              {data.stockControl?.enabled && (
                <Badge variant="secondary">
                  Estoque: {data.stockControl.currentStock} {data.stockControl.unit}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>
      
      {/* Seções Editáveis */}
      <div className="space-y-4">
        {/* Variações */}
        {data.variations && data.variations.length > 0 && (
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">Variações ({data.variations.length})</h4>
              <Button size="sm" variant="ghost" onClick={() => onEdit(2)}>
                <Edit className="h-3 w-3 mr-1" />
                Editar
              </Button>
            </div>
            <div className="space-y-2">
              {data.variations.map(v => (
                <div key={v.id} className="flex items-center justify-between text-sm">
                  <span>{v.name}</span>
                  <span className="text-muted-foreground">
                    {v.priceModifier > 0 && '+'} 
                    R$ {v.priceModifier.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}
        
        {/* Complementos */}
        {data.complementGroups && data.complementGroups.length > 0 && (
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">
                Grupos de Complementos ({data.complementGroups.length})
              </h4>
              <Button size="sm" variant="ghost" onClick={() => onEdit(3)}>
                <Edit className="h-3 w-3 mr-1" />
                Editar
              </Button>
            </div>
            <div className="space-y-3">
              {data.complementGroups.map(group => (
                <div key={group.id} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{group.name}</span>
                    {group.isRequired && (
                      <Badge variant="secondary" className="text-xs">
                        Obrigatório
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground pl-2">
                    {group.complements.map(c => (
                      <div key={c.id} className="flex items-center justify-between">
                        <span>• {c.name}</span>
                        {c.price > 0 && (
                          <span>+ R$ {c.price.toFixed(2)}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
        
        {/* Galeria de Imagens */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold">
              Imagens ({data.images?.length || 0})
            </h4>
            <Button size="sm" variant="ghost" onClick={() => onEdit(4)}>
              <Edit className="h-3 w-3 mr-1" />
              Editar
            </Button>
          </div>
          {data.images && data.images.length > 0 ? (
            <div className="grid grid-cols-5 gap-2">
              {data.images.map((img, idx) => (
                <div key={img.id} className="aspect-square rounded overflow-hidden relative">
                  <img 
                    src={img.thumbnailUrl}
                    alt={`${data.name} ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {img.isPrimary && (
                    <div className="absolute top-1 right-1">
                      <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma imagem</p>
          )}
        </Card>
        
        {/* Estoque */}
        {data.stockControl?.enabled && (
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">Controle de Estoque</h4>
              <Button size="sm" variant="ghost" onClick={() => onEdit(5)}>
                <Edit className="h-3 w-3 mr-1" />
                Editar
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Estoque Atual:</span>
                <p className="font-medium">
                  {data.stockControl.currentStock} {data.stockControl.unit}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Estoque Mínimo:</span>
                <p className="font-medium">
                  {data.stockControl.minStock} {data.stockControl.unit}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
      
      {/* Navegação */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
          Voltar
        </Button>
        <Button 
          onClick={onSubmit} 
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Criando produto...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Criar Produto
            </>
          )}
        </Button>
      </div>
    </div>
  );
}; 