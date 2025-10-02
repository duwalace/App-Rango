import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChefHat, Package, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ProgressBar";
import { ProductTypeCard } from "@/components/ProductTypeCard";

type ProductType = "preparado" | "industrializado" | "combo" | null;

const ProductTypeSelection = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<ProductType>(null);

  const handleContinue = () => {
    if (selectedType) {
      // Navegar para o CreateProduct passando o tipo de produto
      navigate("/dashboard/products/create", { 
        state: { type: selectedType } 
      });
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <ProgressBar currentStep={1} totalSteps={4} />

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-3">
            Criar produto
          </h1>
          <p className="text-lg text-muted-foreground">
            Escolha um tipo de produto
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <ProductTypeCard
            icon={ChefHat}
            title="Preparado"
            description="Produtos feitos na hora com possibilidade de personalização"
            selected={selectedType === "preparado"}
            onClick={() => setSelectedType("preparado")}
          />

          <ProductTypeCard
            icon={Package}
            title="Industrializado"
            description="Produtos prontos, embalados e sem personalização"
            selected={selectedType === "industrializado"}
            onClick={() => setSelectedType("industrializado")}
          />

          <ProductTypeCard
            icon={Layers}
            title="Combo"
            description="Conjunto de produtos vendidos juntos"
            selected={selectedType === "combo"}
            onClick={() => setSelectedType("combo")}
          />
        </div>

        <div className="flex justify-between items-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/dashboard/products")}
            className="text-muted-foreground"
          >
            Voltar
          </Button>
          
          <Button 
            onClick={handleContinue} 
            disabled={!selectedType}
            size="lg"
          >
            Continuar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductTypeSelection;
