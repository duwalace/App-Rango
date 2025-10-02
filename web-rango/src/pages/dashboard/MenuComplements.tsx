import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  getStoreComplementGroups,
  createComplementGroup,
  updateComplementGroup,
  deleteComplementGroup,
  addComplementToGroup,
  updateComplement,
  removeComplementFromGroup,
  duplicateComplementGroup,
  GlobalComplementGroup,
  GlobalComplement,
} from '@/services/complementGroupsService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Plus,
  Pencil,
  Trash2,
  Copy,
  Check,
  X,
  Eye,
  EyeOff,
  DollarSign,
  Hash,
  Layers,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Pizza,
  Coffee,
  IceCream,
  Sparkles,
  ListChecks,
  Package,
  ShoppingBag,
} from 'lucide-react';

// ========================================
// TIPOS E INTERFACES
// ========================================

interface ComplementItemCardProps {
  complement: GlobalComplement;
  groupId: string;
  onUpdate: () => void;
}

// ========================================
// COMPLEMENT ITEM CARD COMPONENT
// ========================================

function ComplementItemCard({ complement, groupId, onUpdate }: ComplementItemCardProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(complement);

  const handleSave = async () => {
    try {
      await updateComplement(groupId, complement.id, formData);
      toast({ title: '✅ Complemento atualizado!' });
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    try {
      await removeComplementFromGroup(groupId, complement.id);
      toast({ title: '✅ Complemento removido!' });
      onUpdate();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível remover',
        variant: 'destructive',
      });
    }
  };

  const handleToggleAvailability = async () => {
    try {
      await updateComplement(groupId, complement.id, {
        ...complement,
        isAvailable: !complement.isAvailable,
      });
      toast({ 
        title: complement.isAvailable ? '🔴 Desabilitado' : '✅ Habilitado',
        description: `${complement.name} foi ${complement.isAvailable ? 'desabilitado' : 'habilitado'}` 
      });
      onUpdate();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar',
        variant: 'destructive',
      });
    }
  };

  if (isEditing) {
    return (
      <div className="p-4 border-2 border-blue-300 rounded-lg bg-blue-50 dark:bg-blue-950/20 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Nome</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="h-9"
            />
          </div>
          <div>
            <Label className="text-xs">Preço (R$)</Label>
            <Input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              step="0.01"
              className="h-9"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Descrição</Label>
            <Input
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="h-9"
            />
          </div>
          <div>
            <Label className="text-xs">Qtd. Máxima</Label>
            <Input
              type="number"
              value={formData.maxQuantity}
              onChange={(e) => setFormData({ ...formData, maxQuantity: parseInt(e.target.value) || 1 })}
              className="h-9"
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 pt-2 border-t">
          <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
            <X className="h-3 w-3 mr-1" />
            Cancelar
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Check className="h-3 w-3 mr-1" />
            Salvar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`group p-4 border-2 rounded-lg hover:shadow-md transition-all ${
      complement.isAvailable 
        ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700' 
        : 'bg-gray-50 dark:bg-gray-900/50 border-gray-300 dark:border-gray-600 opacity-60'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-base">{complement.name}</h4>
              {!complement.isAvailable && (
                <Badge variant="secondary" className="text-xs">Indisponível</Badge>
              )}
            </div>
            
            {complement.description && (
              <p className="text-sm text-muted-foreground">{complement.description}</p>
            )}
            
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1 text-sm">
                <DollarSign className="h-3 w-3 text-green-600" />
                <span className="font-medium text-green-600">
                  {complement.price > 0 
                    ? `+ R$ ${complement.price.toFixed(2)}` 
                    : 'Grátis'}
                </span>
              </div>
              
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Hash className="h-3 w-3" />
                <span>Máx: {complement.maxQuantity}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={handleToggleAvailability} 
            className="h-9 w-9 p-0"
            title={complement.isAvailable ? 'Desabilitar' : 'Habilitar'}
          >
            {complement.isAvailable ? (
              <Eye className="h-4 w-4 text-green-600" />
            ) : (
              <EyeOff className="h-4 w-4 text-gray-400" />
            )}
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => setIsEditing(true)} 
            className="h-9 w-9 p-0"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ========================================
// GROUP CARD COMPONENT
// ========================================

interface GroupCardProps {
  group: GlobalComplementGroup;
  onEdit: (group: GlobalComplementGroup) => void;
  onDelete: (group: GlobalComplementGroup) => void;
  onDuplicate: (groupId: string) => void;
  onAddComplement: (groupId: string) => void;
  onUpdate: () => void;
}

function GroupCard({ group, onEdit, onDelete, onDuplicate, onAddComplement, onUpdate }: GroupCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { toast } = useToast();

  const handleToggleActive = async () => {
    try {
      await updateComplementGroup(group.id, { isActive: !group.isActive });
      toast({ 
        title: group.isActive ? '🔴 Grupo desativado' : '✅ Grupo ativado',
        description: group.name 
      });
      onUpdate();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="shadow-lg border-2 hover:shadow-xl transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              group.isActive 
                ? 'bg-gradient-to-br from-blue-500 to-purple-500' 
                : 'bg-gray-300 dark:bg-gray-700'
            }`}>
              <Layers className="h-6 w-6 text-white" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-xl">{group.name}</CardTitle>
                {group.isActive ? (
                  <Badge variant="default" className="gap-1">
                    <Sparkles className="h-3 w-3" />
                    Ativo
                  </Badge>
                ) : (
                  <Badge variant="secondary">Inativo</Badge>
                )}
              </div>
              
              {group.description && (
                <CardDescription className="mt-1">{group.description}</CardDescription>
              )}
              
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <div className="flex items-center gap-1 text-sm">
                  <Package className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">{group.items.length} {group.items.length === 1 ? 'item' : 'itens'}</span>
                </div>
                
                {group.isRequired && (
                  <Badge variant="outline" className="gap-1">
                    <Check className="h-3 w-3" />
                    Obrigatório
                  </Badge>
                )}
                
                <Badge variant="outline" className="gap-1">
                  <ListChecks className="h-3 w-3" />
                  {group.maxSelection === 1 ? 'Seleção única' : `Até ${group.maxSelection} opções`}
                </Badge>
                
                {group.minSelection > 0 && (
                  <Badge variant="outline">
                    Mín: {group.minSelection}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Switch
            checked={group.isActive}
            onCheckedChange={handleToggleActive}
            className="ml-2"
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Action Buttons */}
        <div className="flex items-center gap-2 pb-3 border-b">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="gap-2"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Ocultar Itens
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Ver Itens ({group.items.length})
              </>
            )}
          </Button>
          
          <div className="flex-1" />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddComplement(group.id)}
            className="gap-1"
          >
            <Plus className="h-4 w-4" />
            Adicionar
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDuplicate(group.id)}
            className="gap-1"
          >
            <Copy className="h-4 w-4" />
            Duplicar
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(group)}
            className="gap-1"
          >
            <Pencil className="h-4 w-4" />
            Editar
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(group)}
            className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Complementos List */}
        {expanded && (
          <div className="space-y-3 pt-2">
            {group.items.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-900/50 rounded-lg border-2 border-dashed">
                <Package className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <p className="text-muted-foreground mb-4">Nenhum complemento adicionado</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAddComplement(group.id)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Item
                </Button>
              </div>
            ) : (
              <>
                {group.items.map((complement) => (
                  <ComplementItemCard
                    key={complement.id}
                    complement={complement}
                    groupId={group.id}
                    onUpdate={onUpdate}
                  />
                ))}
                
                <Button
                  variant="outline"
                  className="w-full mt-3"
                  onClick={() => onAddComplement(group.id)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Outro Complemento
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ========================================
// MAIN COMPONENT
// ========================================

export default function MenuComplements() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [groups, setGroups] = useState<GlobalComplementGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [activeTab, setActiveTab] = useState('all');

  // Create/Edit Group Modal
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<GlobalComplementGroup | null>(null);
  const [groupFormData, setGroupFormData] = useState({
    name: '',
    description: '',
    isRequired: false,
    minSelection: 0,
    maxSelection: 1,
    isActive: true,
  });

  // Add Complement Modal
  const [showComplementModal, setShowComplementModal] = useState(false);
  const [targetGroupId, setTargetGroupId] = useState<string>('');
  const [complementFormData, setComplementFormData] = useState({
    name: '',
    description: '',
    price: 0,
    isAvailable: true,
    maxQuantity: 1,
  });

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<GlobalComplementGroup | null>(null);

  // Templates Modal
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);

  useEffect(() => {
    loadGroups();
  }, [user?.storeId]);

  const loadGroups = async () => {
    if (!user?.storeId) return;

    try {
      setLoading(true);
      const data = await getStoreComplementGroups(user.storeId);
      setGroups(data);
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os grupos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Stats
  const stats = useMemo(() => {
    const totalGroups = groups.length;
    const activeGroups = groups.filter(g => g.isActive).length;
    const totalComplements = groups.reduce((sum, g) => sum + g.items.length, 0);
    const avgPerGroup = totalGroups > 0 ? (totalComplements / totalGroups).toFixed(1) : '0';

    return {
      totalGroups,
      activeGroups,
      totalComplements,
      avgPerGroup,
    };
  }, [groups]);

  // Filtered Groups
  const filteredGroups = useMemo(() => {
    let filtered = [...groups];

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(g => 
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.items.some(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by status
    if (filterStatus === 'active') {
      filtered = filtered.filter(g => g.isActive);
    } else if (filterStatus === 'inactive') {
      filtered = filtered.filter(g => !g.isActive);
    }

    return filtered;
  }, [groups, searchQuery, filterStatus]);

  const handleCreateGroup = async () => {
    if (!user?.storeId || !groupFormData.name.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Preencha o nome do grupo',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createComplementGroup({
        ...groupFormData,
        storeId: user.storeId,
        items: [],
        order: groups.length,
        createdBy: user.uid,
      });

      toast({ title: '✅ Grupo criado com sucesso!' });
      setShowGroupModal(false);
      resetGroupForm();
      loadGroups();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o grupo',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateGroup = async () => {
    if (!editingGroup) return;

    try {
      await updateComplementGroup(editingGroup.id, groupFormData);
      toast({ title: '✅ Grupo atualizado!' });
      setShowGroupModal(false);
      setEditingGroup(null);
      resetGroupForm();
      loadGroups();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar',
        variant: 'destructive',
      });
    }
  };

  const handleAddComplement = async () => {
    if (!targetGroupId || !complementFormData.name.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Preencha o nome do complemento',
        variant: 'destructive',
      });
      return;
    }

    try {
      await addComplementToGroup(targetGroupId, {
        ...complementFormData,
        order: 0,
      });

      toast({ title: '✅ Complemento adicionado!' });
      setShowComplementModal(false);
      setTargetGroupId('');
      resetComplementForm();
      loadGroups();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteGroup = async () => {
    if (!deleteTarget) return;

    try {
      await deleteComplementGroup(deleteTarget.id);
      toast({ title: '✅ Grupo excluído!' });
      setDeleteTarget(null);
      loadGroups();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir',
        variant: 'destructive',
      });
    }
  };

  const handleDuplicateGroup = async (groupId: string) => {
    try {
      await duplicateComplementGroup(groupId);
      toast({ title: '✅ Grupo duplicado!' });
      loadGroups();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível duplicar',
        variant: 'destructive',
      });
    }
  };

  const handleCreateFromTemplate = async (template: any) => {
    if (!user?.storeId) return;

    try {
      const groupData = {
        ...template,
        storeId: user.storeId,
        order: groups.length,
        createdBy: user.uid,
      };

      await createComplementGroup(groupData);
      toast({ title: '✅ Grupo criado do template!' });
      setShowTemplatesModal(false);
      loadGroups();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível criar',
        variant: 'destructive',
      });
    }
  };

  const resetGroupForm = () => {
    setGroupFormData({
      name: '',
      description: '',
      isRequired: false,
      minSelection: 0,
      maxSelection: 1,
      isActive: true,
    });
  };

  const resetComplementForm = () => {
    setComplementFormData({
      name: '',
      description: '',
      price: 0,
      isAvailable: true,
      maxQuantity: 1,
    });
  };

  const openEditGroup = (group: GlobalComplementGroup) => {
    setEditingGroup(group);
    setGroupFormData({
      name: group.name,
      description: group.description || '',
      isRequired: group.isRequired,
      minSelection: group.minSelection,
      maxSelection: group.maxSelection,
      isActive: group.isActive,
    });
    setShowGroupModal(true);
  };

  // Templates
  const templates = [
    {
      name: 'Tamanhos',
      description: 'Opções de tamanho do produto',
      isRequired: true,
      minSelection: 1,
      maxSelection: 1,
      isActive: true,
      items: [
        { name: 'Pequeno', price: 0, isAvailable: true, maxQuantity: 1, order: 0 },
        { name: 'Médio', price: 5, isAvailable: true, maxQuantity: 1, order: 1 },
        { name: 'Grande', price: 10, isAvailable: true, maxQuantity: 1, order: 2 },
      ],
    },
    {
      name: 'Adicionais',
      description: 'Ingredientes extras',
      isRequired: false,
      minSelection: 0,
      maxSelection: 5,
      isActive: true,
      items: [
        { name: 'Bacon', price: 3, isAvailable: true, maxQuantity: 2, order: 0 },
        { name: 'Queijo Extra', price: 2.5, isAvailable: true, maxQuantity: 2, order: 1 },
        { name: 'Ovo', price: 2, isAvailable: true, maxQuantity: 1, order: 2 },
      ],
    },
    {
      name: 'Molhos',
      description: 'Escolha seu molho favorito',
      isRequired: false,
      minSelection: 0,
      maxSelection: 3,
      isActive: true,
      items: [
        { name: 'Ketchup', price: 0, isAvailable: true, maxQuantity: 3, order: 0 },
        { name: 'Mostarda', price: 0, isAvailable: true, maxQuantity: 3, order: 1 },
        { name: 'Maionese', price: 0, isAvailable: true, maxQuantity: 3, order: 2 },
        { name: 'Barbecue', price: 1, isAvailable: true, maxQuantity: 2, order: 3 },
      ],
    },
    {
      name: 'Bebidas',
      description: 'Escolha uma bebida',
      isRequired: false,
      minSelection: 0,
      maxSelection: 1,
      isActive: true,
      items: [
        { name: 'Coca-Cola 350ml', price: 5, isAvailable: true, maxQuantity: 1, order: 0 },
        { name: 'Guaraná 350ml', price: 4.5, isAvailable: true, maxQuantity: 1, order: 1 },
        { name: 'Suco Natural', price: 7, isAvailable: true, maxQuantity: 1, order: 2 },
      ],
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando grupos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Complementos e Variações</h1>
          <p className="text-muted-foreground mt-1">
            Crie grupos de opções reutilizáveis para seus produtos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowTemplatesModal(true)} className="gap-2">
            <Sparkles className="h-4 w-4" />
            Templates
          </Button>
          <Button onClick={() => setShowGroupModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Grupo
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-lg border-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Grupos</p>
                <p className="text-2xl font-bold mt-1">{stats.totalGroups}</p>
              </div>
              <Layers className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Grupos Ativos</p>
                <p className="text-2xl font-bold mt-1">{stats.activeGroups}</p>
              </div>
              <Sparkles className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Itens</p>
                <p className="text-2xl font-bold mt-1">{stats.totalComplements}</p>
              </div>
              <Package className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Média por Grupo</p>
                <p className="text-2xl font-bold mt-1">{stats.avgPerGroup}</p>
              </div>
              <ListChecks className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-lg border-2">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar grupos ou complementos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="active">Apenas Ativos</SelectItem>
                <SelectItem value="inactive">Apenas Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Groups List */}
      {filteredGroups.length === 0 ? (
        <Card className="shadow-lg border-2">
          <CardContent className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Layers className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {groups.length === 0 ? 'Nenhum grupo criado' : 'Nenhum resultado encontrado'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {groups.length === 0 
                  ? 'Crie grupos como "Tamanhos", "Adicionais", "Molhos" para usar em vários produtos'
                  : 'Tente ajustar os filtros ou busca'}
              </p>
              <div className="flex items-center justify-center gap-3">
                <Button onClick={() => setShowTemplatesModal(true)} variant="outline">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Ver Templates
                </Button>
                <Button onClick={() => setShowGroupModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Grupo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredGroups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onEdit={openEditGroup}
              onDelete={setDeleteTarget}
              onDuplicate={handleDuplicateGroup}
              onAddComplement={(groupId) => {
                setTargetGroupId(groupId);
                setShowComplementModal(true);
              }}
              onUpdate={loadGroups}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Group Modal */}
      <Dialog open={showGroupModal} onOpenChange={setShowGroupModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingGroup ? 'Editar Grupo' : 'Novo Grupo'}</DialogTitle>
            <DialogDescription>
              Configure as opções do grupo de complementos
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Nome do Grupo *</Label>
              <Input
                placeholder="ex: Tamanhos, Adicionais, Molhos"
                value={groupFormData.name}
                onChange={(e) => setGroupFormData({ ...groupFormData, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea
                placeholder="Descrição opcional do grupo"
                value={groupFormData.description}
                onChange={(e) => setGroupFormData({ ...groupFormData, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Seleção Mínima</Label>
                <Input
                  type="number"
                  value={groupFormData.minSelection}
                  onChange={(e) =>
                    setGroupFormData({
                      ...groupFormData,
                      minSelection: parseInt(e.target.value) || 0,
                    })
                  }
                  min="0"
                />
              </div>
              <div>
                <Label>Seleção Máxima</Label>
                <Input
                  type="number"
                  value={groupFormData.maxSelection}
                  onChange={(e) =>
                    setGroupFormData({
                      ...groupFormData,
                      maxSelection: parseInt(e.target.value) || 1,
                    })
                  }
                  min="1"
                />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <div>
                  <Label>Seleção Obrigatória</Label>
                  <p className="text-sm text-muted-foreground">Cliente deve escolher uma opção</p>
                </div>
                <Switch
                  checked={groupFormData.isRequired}
                  onCheckedChange={(checked) =>
                    setGroupFormData({ ...groupFormData, isRequired: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <div>
                  <Label>Grupo Ativo</Label>
                  <p className="text-sm text-muted-foreground">Disponível para uso</p>
                </div>
                <Switch
                  checked={groupFormData.isActive}
                  onCheckedChange={(checked) =>
                    setGroupFormData({ ...groupFormData, isActive: checked })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowGroupModal(false);
                setEditingGroup(null);
                resetGroupForm();
              }}
            >
              Cancelar
            </Button>
            <Button onClick={editingGroup ? handleUpdateGroup : handleCreateGroup}>
              {editingGroup ? 'Salvar Alterações' : 'Criar Grupo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Complement Modal */}
      <Dialog open={showComplementModal} onOpenChange={setShowComplementModal}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Novo Complemento</DialogTitle>
            <DialogDescription>Adicione um complemento ao grupo</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Nome *</Label>
              <Input
                placeholder="ex: Bacon, Queijo Cheddar, Molho Barbecue"
                value={complementFormData.name}
                onChange={(e) =>
                  setComplementFormData({ ...complementFormData, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Descrição</Label>
              <Input
                placeholder="Descrição opcional"
                value={complementFormData.description}
                onChange={(e) =>
                  setComplementFormData({ ...complementFormData, description: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Preço Adicional (R$)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={complementFormData.price}
                  onChange={(e) =>
                    setComplementFormData({
                      ...complementFormData,
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                  step="0.01"
                />
              </div>
              <div>
                <Label>Quantidade Máxima</Label>
                <Input
                  type="number"
                  placeholder="1"
                  value={complementFormData.maxQuantity}
                  onChange={(e) =>
                    setComplementFormData({
                      ...complementFormData,
                      maxQuantity: parseInt(e.target.value) || 1,
                    })
                  }
                  min="1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowComplementModal(false);
                setTargetGroupId('');
                resetComplementForm();
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleAddComplement}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Templates Modal */}
      <Dialog open={showTemplatesModal} onOpenChange={setShowTemplatesModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Templates de Grupos
            </DialogTitle>
            <DialogDescription>
              Escolha um template pronto para começar rapidamente
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {templates.map((template, index) => (
              <Card key={index} className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                      {index === 0 && <Coffee className="h-5 w-5 text-white" />}
                      {index === 1 && <Pizza className="h-5 w-5 text-white" />}
                      {index === 2 && <ShoppingBag className="h-5 w-5 text-white" />}
                      {index === 3 && <IceCream className="h-5 w-5 text-white" />}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription className="text-sm mt-1">
                        {template.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm flex-wrap">
                    {template.isRequired && (
                      <Badge variant="outline">Obrigatório</Badge>
                    )}
                    <Badge variant="outline">
                      {template.maxSelection === 1 ? 'Único' : `Até ${template.maxSelection}`}
                    </Badge>
                    <Badge variant="outline">{template.items.length} itens</Badge>
                  </div>
                  
                  <div className="space-y-1 pt-2 border-t">
                    <p className="text-xs text-muted-foreground font-medium mb-2">Itens inclusos:</p>
                    {template.items.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="text-sm flex items-center justify-between">
                        <span>• {item.name}</span>
                        <span className="text-green-600 font-medium">
                          {item.price > 0 ? `+R$ ${item.price.toFixed(2)}` : 'Grátis'}
                        </span>
                      </div>
                    ))}
                    {template.items.length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        +{template.items.length - 3} mais...
                      </p>
                    )}
                  </div>
                  
                  <Button
                    className="w-full mt-3"
                    onClick={() => handleCreateFromTemplate(template)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Usar Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o grupo "{deleteTarget?.name}"?
              {deleteTarget && deleteTarget.usageCount > 0 && (
                <span className="block mt-2 text-orange-600 font-medium">
                  ⚠️ Este grupo está sendo usado em {deleteTarget.usageCount}{' '}
                  {deleteTarget.usageCount === 1 ? 'produto' : 'produtos'}!
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteGroup}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 