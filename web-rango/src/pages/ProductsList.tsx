import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ItemActionsMenu } from "@/components/ItemActionsMenu";
import { AvailabilityModal } from "@/components/AvailabilityModal";
import { Plus, Search, Clock, Loader2, ImageOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMenuItems, useStoreCategories, useToggleItemAvailability, useDeleteMenuItem } from "@/hooks/useMenuItems";

const ProductsList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Buscar dados reais do Firestore com React Query
  const { data: menuItems = [], isLoading, error } = useMenuItems(user?.storeId);
  const { data: categories = [] } = useStoreCategories(user?.storeId);
  const toggleAvailability = useToggleItemAvailability();
  const deleteItem = useDeleteMenuItem();

  const [availabilityModalOpen, setAvailabilityModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrar produtos pela busca
  const filteredProducts = menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Obter nome da categoria
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Sem categoria';
  };

  // Toggle disponibilidade
  const handleToggleAvailability = (itemId: string, currentStatus: boolean) => {
    toggleAvailability.mutate({ itemId, isAvailable: !currentStatus });
  };

  // Deletar produto
  const handleDeleteProduct = (itemId: string) => {
    if (confirm('Deseja realmente remover este produto?')) {
      deleteItem.mutate(itemId);
    }
  };

  const getStatusBadge = (isAvailable: boolean) => {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
          isAvailable 
            ? "bg-green-100 text-green-700" 
            : "bg-muted text-muted-foreground"
        }`}
      >
        {isAvailable ? "Disponível" : "Indisponível"}
      </span>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Erro ao carregar produtos</p>
          <Button onClick={() => window.location.reload()}>
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Cardápio</h1>
              <p className="text-muted-foreground mt-1">
                Gerencie os produtos do seu cardápio ({menuItems.length} {menuItems.length === 1 ? 'produto' : 'produtos'})
              </p>
            </div>
            <Button onClick={() => navigate("/dashboard/products/new/type")} size="lg">
              <Plus className="h-4 w-4" />
              Adicionar item
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Products list */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {menuItems.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <ImageOff className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nenhum produto cadastrado</h3>
            <p className="text-muted-foreground mb-6">
              Comece adicionando produtos ao seu cardápio
            </p>
            <Button onClick={() => navigate("/dashboard/products/new/type")}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeiro Produto
            </Button>
          </Card>
        ) : (
          <>
            <Card className="shadow-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground w-12">
                      
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Produto
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Categoria
                    </th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                      Preço
                    </th>
                    <th className="text-center p-4 text-sm font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-smooth"
                    >
                      <td className="p-4">
                        {item.images && item.images.length > 0 ? (
                          <img 
                            src={item.images[0].thumbnailUrl} 
                            alt={item.name}
                            className="w-10 h-10 rounded object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                            <ImageOff className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div>
                          <span className="font-medium text-foreground">
                            {item.name}
                          </span>
                          {item.complementGroups && item.complementGroups.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                              {item.complementGroups.length} {item.complementGroups.length === 1 ? 'grupo' : 'grupos'} de complementos
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-muted-foreground">
                          {getCategoryName(item.categoryId)}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="font-medium text-foreground">
                          R$ {item.basePrice.toFixed(2)}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleToggleAvailability(item.id, item.isAvailable)}
                          className="hover:opacity-80 transition-smooth"
                          disabled={toggleAvailability.isPending}
                        >
                          {getStatusBadge(item.isAvailable)}
                        </button>
                      </td>
                      <td className="p-4">
                        <ItemActionsMenu
                          onEdit={() =>
                            navigate(`/dashboard/products/edit/${item.id}`)
                          }
                          onDelete={() => handleDeleteProduct(item.id)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            {filteredProducts.length === 0 && searchTerm && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Nenhum produto encontrado para "{searchTerm}"
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <AvailabilityModal
        open={availabilityModalOpen}
        onOpenChange={setAvailabilityModalOpen}
      />
    </div>
  );
};

export default ProductsList;
