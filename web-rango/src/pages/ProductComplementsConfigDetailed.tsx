import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ProgressBar";
import { ComplementGroupCardDetailed } from "@/components/ComplementGroupCardDetailed";
import { ProductSidebar } from "@/components/Sidebar";
import { Plus, Eye, Link as LinkIcon, Copy, Trash2 } from "lucide-react";

const ProductComplementsConfigDetailed = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([
    { id: "1", name: "Turbine seu lanche" },
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

  return (
    <div className="flex h-screen bg-muted/30">
      <ProductSidebar />

      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-background border-b border-border sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <button
                  onClick={() => navigate("/dashboard/products")}
                  className="hover:text-foreground transition-smooth"
                >
                  Cardápios
                </button>
                <span>/</span>
                <span className="text-foreground">Criar produto</span>
              </div>
              <Button variant="outline-primary" size="sm">
                <Eye className="h-4 w-4" />
                Mostrar no app
              </Button>
            </div>

            <h1 className="text-2xl font-bold text-foreground mb-4">
              Criar produto preparado
            </h1>

            <ProgressBar currentStep={3} totalSteps={6} />
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="space-y-6">
            {/* Info section */}
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">
                Grupo de complementos
              </h2>
              <p className="text-sm text-muted-foreground">
                Adicione opções para que os clientes possam personalizar este
                produto, como por exemplo tamanhos, molhos ou produtos
                adicionais.
              </p>
            </div>

            {/* Groups */}
            <div className="space-y-4">
              {groups.map((group) => (
                <div key={group.id} className="relative">
                  <ComplementGroupCardDetailed
                    groupName={group.name}
                    isEditing={true}
                    onDelete={() => deleteGroup(group.id)}
                  />

                  {/* Action buttons overlay */}
                  <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                    <button className="p-2 bg-card hover:bg-muted rounded-lg transition-smooth shadow-md">
                      <Plus className="h-4 w-4 text-primary" />
                      <span className="sr-only">Complementos</span>
                    </button>
                    <button className="p-2 bg-card hover:bg-muted rounded-lg transition-smooth shadow-md">
                      <LinkIcon className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button className="p-2 bg-card hover:bg-muted rounded-lg transition-smooth shadow-md">
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button className="p-2 bg-card hover:bg-destructive/10 rounded-lg transition-smooth shadow-md">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </button>
                  </div>
                </div>
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
          </div>
        </div>

        {/* Footer */}
        <div className="bg-background border-t border-border sticky bottom-0">
          <div className="max-w-5xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <Button
                variant="ghost"
                onClick={() => navigate("/dashboard/products/new/type")}
              >
                Voltar
              </Button>

              <Button onClick={() => navigate("/dashboard/products")} size="lg">
                Continuar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductComplementsConfigDetailed;
