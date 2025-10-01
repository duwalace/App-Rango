import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  UtensilsCrossed, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  EyeOff 
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMenuCategories, useMenuItems } from "@/hooks/useMenu";
import { useToast } from "@/hooks/use-toast";
import { MenuCategory, MenuItem } from "@/types/store";

const Menu = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form states
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    image: ''
  });
  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    preparationTime: '',
    ingredients: '',
    allergens: ''
  });

  const { 
    categories, 
    loading: categoriesLoading, 
    addCategory, 
    updateCategory, 
    deleteCategory 
  } = useMenuCategories(user?.storeId || '');

  const { 
    items, 
    loading: itemsLoading, 
    addMenuItem, 
    updateMenuItem, 
    deleteMenuItem 
  } = useMenuItems(user?.storeId || '', selectedCategory || undefined);

  const handleAddCategory = async () => {
    if (!user?.storeId) return;

    try {
      await addCategory({
        storeId: user.storeId,
        name: categoryForm.name,
        description: categoryForm.description,
        image: categoryForm.image,
        isActive: true,
        order: categories.length
      });
      
      setCategoryForm({ name: '', description: '', image: '' });
      setIsCategoryDialogOpen(false);
      toast({
        title: "Sucesso",
        description: "Categoria adicionada com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar categoria",
        variant: "destructive",
      });
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategory) return;

    try {
      await updateCategory(editingCategory.id, {
        name: categoryForm.name,
        description: categoryForm.description,
        image: categoryForm.image
      });
      
      setEditingCategory(null);
      setCategoryForm({ name: '', description: '', image: '' });
      setIsCategoryDialogOpen(false);
      toast({
        title: "Sucesso",
        description: "Categoria atualizada com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar categoria",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteCategory(categoryId);
      toast({
        title: "Sucesso",
        description: "Categoria removida com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao remover categoria",
        variant: "destructive",
      });
    }
  };

  const handleAddItem = async () => {
    if (!user?.storeId || !selectedCategory) return;

    try {
      await addMenuItem({
        storeId: user.storeId,
        categoryId: selectedCategory,
        name: itemForm.name,
        description: itemForm.description,
        price: parseFloat(itemForm.price),
        image: itemForm.image,
        isAvailable: true,
        isPopular: false,
        preparationTime: parseInt(itemForm.preparationTime),
        ingredients: itemForm.ingredients.split(',').map(i => i.trim()).filter(i => i),
        allergens: itemForm.allergens.split(',').map(a => a.trim()).filter(a => a),
        order: items.length
      });
      
      setItemForm({
        name: '',
        description: '',
        price: '',
        image: '',
        preparationTime: '',
        ingredients: '',
        allergens: ''
      });
      setIsItemDialogOpen(false);
      toast({
        title: "Sucesso",
        description: "Item adicionado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar item",
        variant: "destructive",
      });
    }
  };

  const handleEditItem = async () => {
    if (!editingItem) return;

    try {
      await updateMenuItem(editingItem.id, {
        name: itemForm.name,
        description: itemForm.description,
        price: parseFloat(itemForm.price),
        image: itemForm.image,
        preparationTime: parseInt(itemForm.preparationTime),
        ingredients: itemForm.ingredients.split(',').map(i => i.trim()).filter(i => i),
        allergens: itemForm.allergens.split(',').map(a => a.trim()).filter(a => a)
      });
      
      setEditingItem(null);
      setItemForm({
        name: '',
        description: '',
        price: '',
        image: '',
        preparationTime: '',
        ingredients: '',
        allergens: ''
      });
      setIsItemDialogOpen(false);
      toast({
        title: "Sucesso",
        description: "Item atualizado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar item",
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteMenuItem(itemId);
      toast({
        title: "Sucesso",
        description: "Item removido com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao remover item",
        variant: "destructive",
      });
    }
  };

  const openCategoryDialog = (category?: MenuCategory) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name,
        description: category.description,
        image: category.image || ''
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: '', description: '', image: '' });
    }
    setIsCategoryDialogOpen(true);
  };

  const openItemDialog = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setItemForm({
        name: item.name,
        description: item.description,
        price: item.price.toString(),
        image: item.image,
        preparationTime: item.preparationTime.toString(),
        ingredients: item.ingredients?.join(', ') || '',
        allergens: item.allergens?.join(', ') || ''
      });
    } else {
      setEditingItem(null);
      setItemForm({
        name: '',
        description: '',
        price: '',
        image: '',
        preparationTime: '',
        ingredients: '',
        allergens: ''
      });
    }
    setIsItemDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Cardápio</h1>
        <div className="flex gap-2">
          <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openCategoryDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Categoria
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="category-name">Nome</Label>
                  <Input
                    id="category-name"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                    placeholder="Nome da categoria"
                  />
                </div>
                <div>
                  <Label htmlFor="category-description">Descrição</Label>
                  <Textarea
                    id="category-description"
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                    placeholder="Descrição da categoria"
                  />
                </div>
                <div>
                  <Label htmlFor="category-image">URL da Imagem</Label>
                  <Input
                    id="category-image"
                    value={categoryForm.image}
                    onChange={(e) => setCategoryForm({...categoryForm, image: e.target.value})}
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                </div>
                <Button 
                  onClick={editingCategory ? handleEditCategory : handleAddCategory}
                  className="w-full"
                >
                  {editingCategory ? 'Atualizar' : 'Adicionar'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Categorias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UtensilsCrossed className="h-5 w-5" />
            Categorias ({categories.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {categoriesLoading ? (
            <div className="text-center py-4">Carregando categorias...</div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma categoria cadastrada
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <div key={category.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{category.name}</h3>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => openCategoryDialog(category)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remover
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{category.description}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant={category.isActive ? "default" : "secondary"}>
                      {category.isActive ? "Ativa" : "Inativa"}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      Ver Itens ({items.filter(item => item.categoryId === category.id).length})
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Itens da Categoria Selecionada */}
      {selectedCategory && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Itens da Categoria: {categories.find(c => c.id === selectedCategory)?.name}
              </CardTitle>
              <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => openItemDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingItem ? 'Editar Item' : 'Novo Item'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="item-name">Nome</Label>
                      <Input
                        id="item-name"
                        value={itemForm.name}
                        onChange={(e) => setItemForm({...itemForm, name: e.target.value})}
                        placeholder="Nome do item"
                      />
                    </div>
                    <div>
                      <Label htmlFor="item-price">Preço (R$)</Label>
                      <Input
                        id="item-price"
                        type="number"
                        step="0.01"
                        value={itemForm.price}
                        onChange={(e) => setItemForm({...itemForm, price: e.target.value})}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="item-description">Descrição</Label>
                      <Textarea
                        id="item-description"
                        value={itemForm.description}
                        onChange={(e) => setItemForm({...itemForm, description: e.target.value})}
                        placeholder="Descrição do item"
                      />
                    </div>
                    <div>
                      <Label htmlFor="item-image">URL da Imagem</Label>
                      <Input
                        id="item-image"
                        value={itemForm.image}
                        onChange={(e) => setItemForm({...itemForm, image: e.target.value})}
                        placeholder="https://exemplo.com/imagem.jpg"
                      />
                    </div>
                    <div>
                      <Label htmlFor="item-time">Tempo de Preparo (min)</Label>
                      <Input
                        id="item-time"
                        type="number"
                        value={itemForm.preparationTime}
                        onChange={(e) => setItemForm({...itemForm, preparationTime: e.target.value})}
                        placeholder="30"
                      />
                    </div>
                    <div>
                      <Label htmlFor="item-ingredients">Ingredientes (separados por vírgula)</Label>
                      <Input
                        id="item-ingredients"
                        value={itemForm.ingredients}
                        onChange={(e) => setItemForm({...itemForm, ingredients: e.target.value})}
                        placeholder="Ingrediente 1, Ingrediente 2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="item-allergens">Alérgenos (separados por vírgula)</Label>
                      <Input
                        id="item-allergens"
                        value={itemForm.allergens}
                        onChange={(e) => setItemForm({...itemForm, allergens: e.target.value})}
                        placeholder="Glúten, Lactose"
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={editingItem ? handleEditItem : handleAddItem}
                    className="w-full mt-4"
                  >
                    {editingItem ? 'Atualizar' : 'Adicionar'}
                  </Button>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {itemsLoading ? (
              <div className="text-center py-4">Carregando itens...</div>
            ) : items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum item cadastrado nesta categoria
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Disponível</TableHead>
                    <TableHead>Tempo</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>R$ {item.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={item.isAvailable ? "default" : "secondary"}>
                          {item.isAvailable ? "Disponível" : "Indisponível"}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.preparationTime} min</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => openItemDialog(item)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remover
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Menu;
