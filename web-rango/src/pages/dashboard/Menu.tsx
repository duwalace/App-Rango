import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Package, 
  DollarSign,
  Image as ImageIcon,
  Tag,
  ChefHat,
  Search,
  Filter
} from 'lucide-react';
import { 
  getStoreCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getStoreMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  subscribeToStoreCategories,
  subscribeToStoreMenuItems
} from '@/services/menuService';
import { MenuCategory, MenuItem, CreateMenuCategoryData, CreateMenuItemData } from '@/types/shared';

export default function Menu() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Estados
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Estados dos modais
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  
  // Estados dos formulários
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    isActive: true
  });
  
  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    image: '',
    isAvailable: true,
    preparationTime: '15-20 min'
  });

  // Carregar dados em tempo real
  useEffect(() => {
    if (!user?.storeId) return;

    console.log('🔵 Carregando cardápio da loja:', user.storeId);

    // Inscrever-se nas categorias
    const unsubscribeCategories = subscribeToStoreCategories(user.storeId, (categoriesData) => {
      console.log('✅ Categorias recebidas:', categoriesData.length);
      setCategories(categoriesData);
    });

    // Inscrever-se nos itens do menu
    const unsubscribeItems = subscribeToStoreMenuItems(user.storeId, (itemsData) => {
      console.log('✅ Itens do menu recebidos:', itemsData.length);
      setMenuItems(itemsData);
      setLoading(false);
    });

    return () => {
      unsubscribeCategories();
      unsubscribeItems();
    };
  }, [user?.storeId]);

  // Filtrar itens
  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.categoryId === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Funções para categorias
  const handleCreateCategory = async () => {
    if (!user?.storeId || !categoryForm.name.trim()) {
      toast({
        title: 'Erro',
        description: 'Nome da categoria é obrigatório',
        variant: 'destructive'
      });
      return;
    }

    try {
      const categoryData: CreateMenuCategoryData = {
        name: categoryForm.name.trim(),
        description: categoryForm.description.trim(),
        storeId: user.storeId,
        isActive: categoryForm.isActive
      };

      await createCategory(categoryData);
      
      toast({
        title: '✅ Categoria criada!',
        description: `Categoria "${categoryForm.name}" foi criada com sucesso`
      });

      setCategoryForm({ name: '', description: '', isActive: true });
      setShowCategoryModal(false);
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao criar categoria',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !categoryForm.name.trim()) return;

    try {
      await updateCategory(editingCategory.id, {
        name: categoryForm.name.trim(),
        description: categoryForm.description.trim(),
        isActive: categoryForm.isActive
      });

      toast({
        title: '✅ Categoria atualizada!',
        description: `Categoria "${categoryForm.name}" foi atualizada`
      });

      setEditingCategory(null);
      setCategoryForm({ name: '', description: '', isActive: true });
      setShowCategoryModal(false);
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar categoria',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const itemsInCategory = menuItems.filter(item => item.categoryId === categoryId);
    
    if (itemsInCategory.length > 0) {
      toast({
        title: 'Não é possível excluir',
        description: 'Esta categoria possui itens. Remova os itens primeiro.',
        variant: 'destructive'
      });
      return;
    }

    try {
      await deleteCategory(categoryId);
      toast({
        title: '✅ Categoria excluída!',
        description: 'Categoria foi excluída com sucesso'
      });
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir categoria',
        variant: 'destructive'
      });
    }
  };

  // Funções para itens
  const handleCreateItem = async () => {
    if (!user?.storeId || !itemForm.name.trim() || !itemForm.categoryId || !itemForm.price) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive'
      });
      return;
    }

    try {
      const itemData: CreateMenuItemData = {
        name: itemForm.name.trim(),
        description: itemForm.description.trim(),
        price: parseFloat(itemForm.price),
        categoryId: itemForm.categoryId,
        storeId: user.storeId,
        image: itemForm.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
        isAvailable: itemForm.isAvailable,
        preparationTime: itemForm.preparationTime
      };

      await createMenuItem(itemData);
      
      toast({
        title: '✅ Item criado!',
        description: `"${itemForm.name}" foi adicionado ao cardápio`
      });

      setItemForm({
        name: '',
        description: '',
        price: '',
        categoryId: '',
        image: '',
        isAvailable: true,
        preparationTime: '15-20 min'
      });
      setShowItemModal(false);
    } catch (error) {
      console.error('Erro ao criar item:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao criar item',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateItem = async () => {
    if (!editingItem || !itemForm.name.trim() || !itemForm.price) return;

    try {
      await updateMenuItem(editingItem.id, {
        name: itemForm.name.trim(),
        description: itemForm.description.trim(),
        price: parseFloat(itemForm.price),
        categoryId: itemForm.categoryId,
        image: itemForm.image,
        isAvailable: itemForm.isAvailable,
        preparationTime: itemForm.preparationTime
      });

      toast({
        title: '✅ Item atualizado!',
        description: `"${itemForm.name}" foi atualizado`
      });

      setEditingItem(null);
      setItemForm({
        name: '',
        description: '',
        price: '',
        categoryId: '',
        image: '',
        isAvailable: true,
        preparationTime: '15-20 min'
      });
      setShowItemModal(false);
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar item',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteMenuItem(itemId);
      toast({
        title: '✅ Item excluído!',
        description: 'Item foi removido do cardápio'
      });
    } catch (error) {
      console.error('Erro ao excluir item:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir item',
        variant: 'destructive'
      });
    }
  };

  // Funções auxiliares
  const openEditCategory = (category: MenuCategory) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description,
      isActive: category.isActive
    });
    setShowCategoryModal(true);
  };

  const openEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setItemForm({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      categoryId: item.categoryId,
      image: item.image,
      isAvailable: item.isAvailable,
      preparationTime: item.preparationTime
    });
    setShowItemModal(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Categoria não encontrada';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cardápio</h1>
          <p className="text-gray-600 mt-1">Gerencie categorias e produtos da sua loja</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showCategoryModal} onOpenChange={setShowCategoryModal}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={() => {
                setEditingCategory(null);
                setCategoryForm({ name: '', description: '', isActive: true });
              }}>
                <Tag className="h-4 w-4 mr-2" />
                Nova Categoria
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                </DialogTitle>
                <DialogDescription>
                  {editingCategory ? 'Atualize os dados da categoria' : 'Crie uma nova categoria para organizar seus produtos'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="categoryName">Nome *</Label>
                  <Input
                    id="categoryName"
                    placeholder="Ex: Pizzas, Bebidas, Sobremesas"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="categoryDescription">Descrição</Label>
                  <Textarea
                    id="categoryDescription"
                    placeholder="Descrição da categoria (opcional)"
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="categoryActive"
                    checked={categoryForm.isActive}
                    onCheckedChange={(checked) => setCategoryForm({ ...categoryForm, isActive: checked })}
                  />
                  <Label htmlFor="categoryActive">Categoria ativa</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCategoryModal(false)}>
                  Cancelar
                </Button>
                <Button onClick={editingCategory ? handleUpdateCategory : handleCreateCategory}>
                  {editingCategory ? 'Atualizar' : 'Criar'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showItemModal} onOpenChange={setShowItemModal}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingItem(null);
                setItemForm({
                  name: '',
                  description: '',
                  price: '',
                  categoryId: '',
                  image: '',
                  isAvailable: true,
                  preparationTime: '15-20 min'
                });
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? 'Editar Item' : 'Novo Item'}
                </DialogTitle>
                <DialogDescription>
                  {editingItem ? 'Atualize os dados do item' : 'Adicione um novo item ao seu cardápio'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="itemName">Nome *</Label>
                  <Input
                    id="itemName"
                    placeholder="Nome do produto"
                    value={itemForm.name}
                    onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="itemPrice">Preço *</Label>
                  <Input
                    id="itemPrice"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={itemForm.price}
                    onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="itemCategory">Categoria *</Label>
                  <Select value={itemForm.categoryId} onValueChange={(value) => setItemForm({ ...itemForm, categoryId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="itemDescription">Descrição</Label>
                  <Textarea
                    id="itemDescription"
                    placeholder="Descrição do produto"
                    value={itemForm.description}
                    onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="itemImage">URL da Imagem</Label>
                  <Input
                    id="itemImage"
                    placeholder="https://exemplo.com/imagem.jpg"
                    value={itemForm.image}
                    onChange={(e) => setItemForm({ ...itemForm, image: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="itemTime">Tempo de Preparo</Label>
                  <Input
                    id="itemTime"
                    placeholder="15-20 min"
                    value={itemForm.preparationTime}
                    onChange={(e) => setItemForm({ ...itemForm, preparationTime: e.target.value })}
                  />
                </div>
                <div className="col-span-2 flex items-center space-x-2">
                  <Switch
                    id="itemAvailable"
                    checked={itemForm.isAvailable}
                    onCheckedChange={(checked) => setItemForm({ ...itemForm, isAvailable: checked })}
                  />
                  <Label htmlFor="itemAvailable">Item disponível</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowItemModal(false)}>
                  Cancelar
                </Button>
                <Button onClick={editingItem ? handleUpdateItem : handleCreateItem}>
                  {editingItem ? 'Atualizar' : 'Criar'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar itens..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name} ({menuItems.filter(item => item.categoryId === category.id).length})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Categorias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Categorias ({categories.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Tag className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>Nenhuma categoria criada</p>
              <p className="text-sm">Crie categorias para organizar seus produtos</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map(category => (
                <div key={category.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{category.name}</h3>
                      {category.description && (
                        <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {category.isActive ? 'Ativa' : 'Inativa'}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {menuItems.filter(item => item.categoryId === category.id).length} itens
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openEditCategory(category)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Itens do Menu */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            Itens do Cardápio ({filteredItems.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>Nenhum item encontrado</p>
              <p className="text-sm">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Tente ajustar os filtros' 
                  : 'Adicione itens ao seu cardápio'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map(item => (
                <div key={item.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-video bg-gray-100 relative">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge className={item.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {item.isAvailable ? 'Disponível' : 'Indisponível'}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-lg">{item.name}</h3>
                      <span className="font-bold text-green-600">{formatCurrency(item.price)}</span>
                    </div>
                    {item.description && (
                      <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span>{getCategoryName(item.categoryId)}</span>
                      <span>{item.preparationTime}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEditItem(item)} className="flex-1">
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
