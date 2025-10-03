import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { createMenuItem } from '@/services/menuService';
import { ProductFormData, ProductType } from '@/types/menu-advanced';
import { ProgressBar } from '@/components/ProgressBar';
import { useToast } from '@/hooks/use-toast';

// Steps
import { BasicInfoStep } from './steps/BasicInfoStep';
import { PricingStep } from './steps/PricingStep';
import { ComplementsStep } from './steps/ComplementsStep';
import { MediaStep } from './steps/MediaStep';
import { AvailabilityStep } from './steps/AvailabilityStep';
import { PreviewStep } from './steps/PreviewStep';

const TOTAL_STEPS = 6;

export default function CreateProduct() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Obter tipo de produto da navegação (vindo de ProductTypeSelection)
  const productType = (location.state as { type?: ProductType })?.type || 'preparado';
  
  // Estado do formulário
  const [formData, setFormData] = useState<Partial<ProductFormData>>({
    type: productType,
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
        
      case 3: // Complementos
        // Validar grupos de complementos
        if (formData.complementGroups && formData.complementGroups.length > 0) {
          for (const group of formData.complementGroups) {
            if (!group.name || group.name.trim().length === 0) {
              toast({
                title: 'Grupo incompleto',
                description: 'Todos os grupos devem ter um nome',
                variant: 'destructive'
              });
              return false;
            }
            
            if (group.complements.length === 0) {
              toast({
                title: 'Grupo vazio',
                description: `O grupo "${group.name}" não tem opções`,
                variant: 'destructive'
              });
              return false;
            }
          }
        }
        break;
        
      case 4: // Mídia
        if (!formData.images || formData.images.length === 0) {
          toast({
            title: 'Imagem obrigatória',
            description: 'Adicione pelo menos uma imagem do produto',
            variant: 'destructive'
          });
          return false;
        }
        break;
    }
    
    return true;
  };
  
  /**
   * Próximo step
   */
  const handleNext = () => {
    if (!validateCurrentStep()) {
      return;
    }
    
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  /**
   * Step anterior
   */
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  /**
   * Ir para step específico
   */
  const goToStep = (step: number) => {
    if (step >= 1 && step <= currentStep) {
      setCurrentStep(step);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  /**
   * Submeter produto
   */
  const handleSubmit = async () => {
    if (!user?.storeId) {
      toast({
        title: 'Erro',
        description: 'Usuário não possui loja associada',
        variant: 'destructive'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Preparar dados para criação
      const menuItemData = {
        storeId: user.storeId,
        categoryId: formData.categoryId!,
        name: formData.name!,
        description: formData.description || '',
        shortDescription: formData.description ? formData.description.substring(0, 100) : '',
        basePrice: formData.basePrice!,
        variations: formData.variations || [],
        images: formData.images || [],
        isAvailable: formData.isAvailable ?? true,
        stockControl: formData.stockControl!,
        availability: formData.availability!,
        complementGroups: formData.complementGroups || [],
        isPopular: false,
        isNew: true,
        isPromotion: false,
        preparationTime: formData.preparationTime || 15,
        servingSize: formData.servingSize,
        ingredients: formData.ingredients || [],
        allergens: formData.allergens || [],
        // nutritionalInfo removido - será adicionado apenas se existir
        dietaryFlags: formData.dietaryFlags || [],
        tags: [
          formData.name!.toLowerCase(),
          ...(formData.tags || []),
          ...(formData.ingredients || []).map(i => i.toLowerCase()),
          ...(formData.dietaryFlags || [])
        ],
        order: 0,
        views: 0,
        sales: 0,
        rating: 0,
        reviewCount: 0,
        createdBy: user.uid,
        lastModifiedBy: user.uid
      };
      
      const productId = await createMenuItem(menuItemData);
      
      toast({
        title: '✅ Produto criado!',
        description: `"${formData.name}" foi adicionado ao cardápio`
      });
      
      // Redirecionar para lista de produtos
      setTimeout(() => {
        navigate('/dashboard/products');
      }, 1500);
      
    } catch (error: any) {
      console.error('Erro ao criar produto:', error);
      toast({
        title: 'Erro ao criar produto',
        description: error.message || 'Tente novamente mais tarde',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  /**
   * Renderizar step atual
   */
  const renderStep = () => {
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
            storeId={user?.storeId || ''}
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
            onSubmit={handleSubmit}
            onBack={handleBack}
            onEdit={goToStep}
            isSubmitting={isSubmitting}
          />
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Progress Bar */}
        <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />
        
        {/* Header */}
        <div className="text-center mt-8 mb-6">
          <h1 className="text-3xl font-bold text-foreground">
            Criar Novo Produto
          </h1>
          <p className="text-muted-foreground mt-2">
            {getStepTitle(currentStep)}
          </p>
        </div>
        
        {/* Step Content */}
        <div className="mt-8">
          {renderStep()}
        </div>
      </div>
    </div>
  );
}

/**
 * Obter título do step
 */
function getStepTitle(step: number): string {
  const titles = {
    1: 'Informações básicas do produto',
    2: 'Preços e variações',
    3: 'Complementos e adicionais',
    4: 'Fotos e mídia',
    5: 'Disponibilidade e estoque',
    6: 'Revise e confirme'
  };
  
  return titles[step as keyof typeof titles] || '';
} 