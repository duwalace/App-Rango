import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { updateMenuItem, getMenuItemById } from '@/services/menuService';
import { ProductFormData, ProductType } from '@/types/menu-advanced';
import { ProgressBar } from '@/components/ProgressBar';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

// Steps
import { BasicInfoStep } from './steps/BasicInfoStep';
import { PricingStep } from './steps/PricingStep';
import { ComplementsStep } from './steps/ComplementsStep';
import { MediaStep } from './steps/MediaStep';
import { AvailabilityStep } from './steps/AvailabilityStep';
import { PreviewStep } from './steps/PreviewStep';

const TOTAL_STEPS = 6;

export default function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estado do formulário
  const [formData, setFormData] = useState<Partial<ProductFormData>>({
    type: 'preparado',
    name: '',
    description: '',
    categoryId: '',
    basePrice: 0,
    variations: [],
    complementGroups: [],
    images: [],
    isAvailable: true,
    stockControl: {
      enabled: false,
      currentStock: 999,
      minStock: 10,
      maxStock: 1000,
      unit: 'unidades',
      lastRestocked: new Date(),
      autoDisable: false
    },
    availability: {
      alwaysAvailable: true,
      schedules: []
    },
    preparationTime: 15,
    servingSize: '',
    ingredients: [],
    allergens: [],
    dietaryFlags: [],
    tags: []
  });

  // Carregar dados do produto
  useEffect(() => {
    const loadProduct = async () => {
      if (!id || !user?.storeId) return;

      try {
        setIsLoading(true);
        const product = await getMenuItemById(id);
        
        if (!product) {
          toast({
            title: 'Produto não encontrado',
            description: 'O produto que você está tentando editar não existe.',
            variant: 'destructive'
          });
          navigate('/dashboard/products');
          return;
        }

        // Mapear dados do produto para o formato do formulário
        setFormData({
          type: (product.type as ProductType) || 'preparado',
          name: product.name,
          description: product.description || '',
          shortDescription: product.shortDescription,
          categoryId: product.categoryId,
          basePrice: product.basePrice,
          variations: product.variations || [],
          complementGroups: product.complementGroups || [],
          images: product.images || [],
          isAvailable: product.isAvailable,
          stockControl: product.stockControl || {
            enabled: false,
            currentStock: 999,
            minStock: 10,
            maxStock: 1000,
            unit: 'unidades',
            lastRestocked: new Date(),
            autoDisable: false
          },
          availability: product.availability || {
            alwaysAvailable: true,
            schedules: []
          },
          preparationTime: product.preparationTime || 15,
          servingSize: product.servingSize || '',
          ingredients: product.ingredients || [],
          allergens: product.allergens || [],
          dietaryFlags: product.dietaryFlags || [],
          tags: product.tags || []
        });

        console.log('✅ Produto carregado:', product.name);
      } catch (error) {
        console.error('❌ Erro ao carregar produto:', error);
        toast({
          title: 'Erro ao carregar',
          description: 'Não foi possível carregar os dados do produto.',
          variant: 'destructive'
        });
        navigate('/dashboard/products');
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [id, user?.storeId, navigate, toast]);
  
  /**
   * Atualizar dados do formulário
   */
  const updateFormData = (updates: Partial<ProductFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };
  
  /**
   * Validar step atual
   */
  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1: // Informações Básicas
        if (!formData.name || formData.name.trim().length === 0) {
          toast({
            title: 'Campo obrigatório',
            description: 'Nome do produto é obrigatório',
            variant: 'destructive'
          });
          return false;
        }
        if (!formData.categoryId) {
          toast({
            title: 'Campo obrigatório',
            description: 'Selecione uma categoria',
            variant: 'destructive'
          });
          return false;
        }
        break;
        
      case 2: // Preços
        if (!formData.basePrice || formData.basePrice <= 0) {
          toast({
            title: 'Preço inválido',
            description: 'O preço deve ser maior que zero',
            variant: 'destructive'
          });
          return false;
        }
        break;
        
      // Outros steps não têm validação obrigatória
    }
    
    return true;
  };
  
  /**
   * Avançar para próximo step
   */
  const handleNext = () => {
    if (!validateCurrentStep()) return;
    
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  /**
   * Voltar para step anterior
   */
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  /**
   * Submeter formulário
   */
  const handleSubmit = async () => {
    if (!user?.storeId || !id) {
      toast({
        title: 'Erro',
        description: 'Loja não identificada',
        variant: 'destructive'
      });
      return;
    }

    if (!validateCurrentStep()) return;

    setIsSubmitting(true);

    try {
      // Preparar dados para atualização
      const productData = {
        ...formData,
        updatedAt: new Date(),
      } as ProductFormData;

      await updateMenuItem(id, productData);

      toast({
        title: 'Produto atualizado!',
        description: `${formData.name} foi atualizado com sucesso.`,
        variant: 'default'
      });

      // Redirecionar para lista
      navigate('/dashboard/products');
      
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      toast({
        title: 'Erro ao atualizar',
        description: 'Não foi possível atualizar o produto. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando produto...</p>
        </div>
      </div>
    );
  }

  /**
   * Renderizar step atual
   */
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStep 
            data={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
            onBack={() => navigate('/dashboard/products')}
          />
        );
        
      case 2:
        return (
          <PricingStep
            data={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
        
      case 3:
        return (
          <ComplementsStep
            data={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
        
      case 4:
        return (
          <MediaStep
            data={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
        
      case 5:
        return (
          <AvailabilityStep
            data={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
        
      case 6:
        return (
          <PreviewStep
            data={formData}
            onUpdate={updateFormData}
            onSubmit={handleSubmit}
            onBack={handleBack}
            isSubmitting={isSubmitting}
          />
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Editar Produto
          </h1>
          <p className="text-muted-foreground">
            {getStepTitle(currentStep)}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-background border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {renderCurrentStep()}
      </div>
    </div>
  );
}

/**
 * Obter título do step
 */
function getStepTitle(step: number): string {
  const titles: Record<number, string> = {
    1: 'Informações Básicas',
    2: 'Preços e Variações',
    3: 'Complementos',
    4: 'Fotos e Mídias',
    5: 'Disponibilidade',
    6: 'Revisão Final'
  };
  
  return titles[step] || '';
}

