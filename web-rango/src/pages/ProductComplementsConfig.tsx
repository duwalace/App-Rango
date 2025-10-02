import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ProgressBar";
import { ComplementGroupCard } from "@/components/ComplementGroupCard";
import { MobilePreview } from "@/components/MobilePreview";
import { Plus } from "lucide-react";

const ProductComplementsConfig = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([
    { id: "1", name: "Adicionais" },
    { id: "2", name: "Bebidas" },
  ]);

  const addGroup = () => {
    const newGroup = {
      id: Date.now().toString(),
      name: `Grupo ${groups.length + 1}`,
    };
    setGroups([...groups, newGroup]);
  };

  const deleteGroup = (id: string) => {
    setGroups(groups.filter((g) => g.id !== id));
  };

  const duplicateGroup = (id: string) => {
    const group = groups.find((g) => g.id === id);
    if (group) {
      const newGroup = {
        ...group,
        id: Date.now().toString(),
        name: `${group.name} (cópia)`,
      };
      setGroups([...groups, newGroup]);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <ProgressBar currentStep={3} totalSteps={4} />

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Configurar Complementos
          </h1>
          <p className="text-muted-foreground">
            Adicione grupos de opções que o cliente pode escolher
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
          {/* Main content */}
          <div className="space-y-6">
            {groups.map((group) => (
              <ComplementGroupCard
                key={group.id}
                groupName={group.name}
                onDelete={() => deleteGroup(group.id)}
                onDuplicate={() => duplicateGroup(group.id)}
              />
            ))}

            <Button
              variant="outline-primary"
              onClick={addGroup}
              className="w-full"
            >
              <Plus className="h-4 w-4" />
              Adicionar grupo
            </Button>
          </div>

          {/* Preview panel */}
          <div className="hidden lg:block">
            <MobilePreview>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h2 className="text-lg font-bold">X-Burguer Especial</h2>
                  <p className="text-sm text-muted-foreground">
                    Hambúrguer artesanal com queijo, alface e tomate
                  </p>
                  <p className="text-xl font-bold text-primary">R$ 25,90</p>
                </div>

                {groups.map((group, index) => (
                  <div key={group.id} className="space-y-2 pt-4 border-t">
                    <h3 className="font-semibold text-sm">{group.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      Escolha até 3 itens
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm">Queijo extra</span>
                        <span className="text-sm font-medium">+R$ 3,50</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm">Bacon</span>
                        <span className="text-sm font-medium">+R$ 4,00</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </MobilePreview>
          </div>
        </div>

        <div className="flex justify-between items-center mt-8 pt-6 border-t">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard/products/new/type")}
            className="text-muted-foreground"
          >
            Voltar
          </Button>

          <Button onClick={() => navigate("/dashboard/products")} size="lg">
            Continuar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductComplementsConfig;
