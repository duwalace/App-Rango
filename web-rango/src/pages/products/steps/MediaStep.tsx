import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProductFormData } from '@/types/menu-advanced';
import { ProductImageUpload } from '@/components/ProductImageUpload';

interface MediaStepProps {
  data: Partial<ProductFormData>;
  onUpdate: (updates: Partial<ProductFormData>) => void;
  onNext: () => void;
  onBack: () => void;
  storeId: string;
}

export const MediaStep: React.FC<MediaStepProps> = ({
  data,
  onUpdate,
  onNext,
  onBack,
  storeId
}) => {
  const productId = `temp-${Date.now()}`;
  
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold">Fotos do Produto</h2>
            <p className="text-muted-foreground mt-1">
              Adicione fotos atrativas do produto
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              💡 <strong>Dica:</strong> Use fotos de alta qualidade com boa iluminação. 
              A primeira imagem será a principal.
            </p>
          </div>
          
          <ProductImageUpload
            storeId={storeId}
            productId={productId}
            images={data.images || []}
            onImagesChange={(images) => onUpdate({ images })}
            maxImages={5}
          />
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