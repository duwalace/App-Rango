import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ProgressBar } from "@/components/ProgressBar";
import { Card } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  price: number;
  active: boolean;
}

const ProductCategoryConfig = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([
    { id: "1", name: "Tamanho P", price: 15.0, active: true },
    { id: "2", name: "Tamanho M", price: 20.0, active: true },
    { id: "3", name: "Tamanho G", price: 25.0, active: true },
  ]);

  const addCategory = () => {
    const newCategory: Category = {
      id: Date.now().toString(),
      name: "",
      price: 0,
      active: true,
    };
    setCategories([...categories, newCategory]);
  };

  const deleteCategory = (id: string) => {
    setCategories(categories.filter((c) => c.id !== id));
  };

  const updateCategory = (id: string, field: keyof Category, value: any) => {
    setCategories(
      categories.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <ProgressBar currentStep={2} totalSteps={4} />

        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Categoria e Preço
          </h1>
          <p className="text-muted-foreground">
            Configure as variações do produto
          </p>
        </div>

        <Card className="p-6 mb-8 shadow-card">
          <div className="space-y-4">
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                      Nome
                    </th>
                    <th className="text-right p-3 text-sm font-medium text-muted-foreground">
                      Preço (R$)
                    </th>
                    <th className="text-center p-3 text-sm font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr
                      key={category.id}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-smooth"
                    >
                      <td className="p-3">
                        <Input
                          value={category.name}
                          onChange={(e) =>
                            updateCategory(category.id, "name", e.target.value)
                          }
                          placeholder="Nome da categoria"
                          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                      </td>
                      <td className="p-3">
                        <Input
                          type="number"
                          step="0.01"
                          value={category.price}
                          onChange={(e) =>
                            updateCategory(
                              category.id,
                              "price",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="text-right border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                      </td>
                      <td className="p-3 text-center">
                        <Switch
                          checked={category.active}
                          onCheckedChange={(checked) =>
                            updateCategory(category.id, "active", checked)
                          }
                        />
                      </td>
                      <td className="p-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteCategory(category.id)}
                          className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Button
              variant="outline-primary"
              onClick={addCategory}
              className="w-full"
            >
              <Plus className="h-4 w-4" />
              Adicionar categoria
            </Button>
          </div>
        </Card>

        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard/products/new/type")}
            className="text-muted-foreground"
          >
            Voltar
          </Button>

          <Button onClick={() => navigate("/dashboard/products")} size="lg">
            Finalizar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCategoryConfig;
