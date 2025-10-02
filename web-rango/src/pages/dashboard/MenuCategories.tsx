import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  getAllStoreCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  updateCategoriesOrder
} from '@/services/menuService';
import { MenuCategory } from '@/types/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Plus, 
  GripVertical, 
  Pencil, 
  Trash2, 
  Check, 
  X,
  Eye,
  EyeOff 
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ========================================
// SORTABLE CATEGORY ITEM
// ========================================

interface SortableCategoryItemProps {
  category: MenuCategory;
  isEditing: boolean;
  editValue: string;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
  onEditValueChange: (value: string) => void;
}

function SortableCategoryItem({
  category,
  isEditing,
  editValue,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onToggleActive,
  onEditValueChange,
}: SortableCategoryItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group flex items-center gap-3 p-4 bg-white dark:bg-gray-800 
        border border-gray-200 dark:border-gray-700 rounded-lg
        hover:shadow-md transition-all
        ${!category.isActive ? 'opacity-60' : ''}
      `}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      >
        <GripVertical className="h-5 w-5" />
      </div>

      {/* Status Indicator */}
      <div
        className={`w-2 h-2 rounded-full flex-shrink-0 ${
          category.isActive ? 'bg-green-500' : 'bg-gray-300'
        }`}
      />

      {/* Category Name / Edit Input */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <Input
            value={editValue}
            onChange={(e) => onEditValueChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSave();
              if (e.key === 'Escape') onCancel();
            }}
            className="h-9"
            autoFocus
            placeholder="Nome da categoria"
          />
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 dark:text-white truncate">
              {category.name}
            </span>
            {!category.isActive && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                Inativa
              </span>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {isEditing ? (
          <>
            <Button
              size="sm"
              variant="ghost"
              onClick={onSave}
              className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onCancel}
              className="h-8 w-8 p-0 text-gray-600 hover:text-gray-700 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
            <Button
              size="sm"
              variant="ghost"
              onClick={onToggleActive}
              className="h-8 w-8 p-0"
              title={category.isActive ? 'Desativar' : 'Ativar'}
            >
              {category.isActive ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onEdit}
              className="h-8 w-8 p-0"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onDelete}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

// ========================================
// MAIN COMPONENT
// ========================================

export default function MenuCategories() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creating, setCreating] = useState(false);

  // Edit states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<MenuCategory | null>(null);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load categories
  useEffect(() => {
    loadCategories();
  }, [user?.storeId]);

  const loadCategories = async () => {
    if (!user?.storeId) return;

    try {
      setLoading(true);
      const data = await getAllStoreCategories(user.storeId);
      setCategories(data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as categorias',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Create category
  const handleCreate = async () => {
    if (!user?.storeId || !newCategoryName.trim()) return;

    try {
      setCreating(true);
      await createCategory({
        storeId: user.storeId,
        name: newCategoryName.trim(),
        description: '',
        isActive: true,
        order: categories.length,
      });

      toast({
        title: '✅ Categoria criada!',
        description: `A categoria "${newCategoryName}" foi criada com sucesso.`,
      });

      setNewCategoryName('');
      setShowCreateModal(false);
      loadCategories();
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a categoria',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  // Save inline edit
  const handleSaveEdit = async (categoryId: string) => {
    if (!editValue.trim()) return;

    try {
      await updateCategory(categoryId, { name: editValue.trim() });
      
      toast({
        title: '✅ Categoria atualizada!',
      });
      
      setEditingId(null);
      loadCategories();
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a categoria',
        variant: 'destructive',
      });
    }
  };

  // Toggle active status
  const handleToggleActive = async (category: MenuCategory) => {
    try {
      await updateCategory(category.id, { isActive: !category.isActive });
      
      toast({
        title: `✅ Categoria ${!category.isActive ? 'ativada' : 'desativada'}!`,
      });
      
      loadCategories();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar o status da categoria',
        variant: 'destructive',
      });
    }
  };

  // Delete category
  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteCategory(deleteTarget.id);
      
      toast({
        title: '✅ Categoria excluída!',
        description: `A categoria "${deleteTarget.name}" foi removida.`,
      });
      
      setDeleteTarget(null);
      loadCategories();
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a categoria',
        variant: 'destructive',
      });
    }
  };

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id || !user?.storeId) return;

    const oldIndex = categories.findIndex((cat) => cat.id === active.id);
    const newIndex = categories.findIndex((cat) => cat.id === over.id);

    const reordered = arrayMove(categories, oldIndex, newIndex);
    
    // Optimistic UI update
    setCategories(reordered);

    try {
      setSaving(true);
      await updateCategoriesOrder(
        user.storeId,
        reordered.map((cat) => cat.id)
      );

      toast({
        title: '✅ Ordem atualizada!',
        description: 'A nova ordem das categorias foi salva.',
      });
    } catch (error) {
      console.error('Erro ao reordenar:', error);
      // Rollback on error
      loadCategories();
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a ordem',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando categorias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categorias do Cardápio</h1>
          <p className="text-muted-foreground mt-1">
            Organize suas categorias e defina a ordem de exibição
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Categoria
        </Button>
      </div>

      {/* Categories List */}
      {categories.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nenhuma categoria criada</h3>
            <p className="text-muted-foreground mb-6">
              Comece criando sua primeira categoria para organizar seu cardápio
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Categoria
            </Button>
          </div>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={categories.map((cat) => cat.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {categories.map((category) => (
                <SortableCategoryItem
                  key={category.id}
                  category={category}
                  isEditing={editingId === category.id}
                  editValue={editValue}
                  onEdit={() => {
                    setEditingId(category.id);
                    setEditValue(category.name);
                  }}
                  onSave={() => handleSaveEdit(category.id)}
                  onCancel={() => setEditingId(null)}
                  onDelete={() => setDeleteTarget(category)}
                  onToggleActive={() => handleToggleActive(category)}
                  onEditValueChange={setEditValue}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {saving && (
        <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg px-4 py-2 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-muted-foreground">Salvando alterações...</p>
        </div>
      )}

      {/* Create Category Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Categoria</DialogTitle>
            <DialogDescription>
              Crie uma nova categoria para organizar seus produtos
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Input
                placeholder="Nome da categoria (ex: Pizzas, Bebidas, Sobremesas)"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={!newCategoryName.trim() || creating}>
              {creating ? 'Criando...' : 'Criar Categoria'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a categoria "{deleteTarget?.name}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 