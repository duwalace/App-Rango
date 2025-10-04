/**
 * StoreTypesManagement.tsx
 * Gestão de Tipos de Loja (Categorias)
 * CRUD completo para o super admin gerenciar as categorias da plataforma
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Tag,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle
} from "lucide-react";
import { 
  getStoreTypes, 
  addStoreType, 
  updateStoreType, 
  deleteStoreType,
  StoreType 
} from "@/services/adminService";
import { useToast } from "@/hooks/use-toast";

interface StoreTypeForm {
  name: string;
  icon: string;
  description: string;
}

export default function StoreTypesManagement() {
  const [storeTypes, setStoreTypes] = useState<StoreType[]>([]);
  const [loading, setLoading] = useState(true);
  const [formDialog, setFormDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedType, setSelectedType] = useState<StoreType | null>(null);
  const [formData, setFormData] = useState<StoreTypeForm>({
    name: '',
    icon: '🏪',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadStoreTypes();
  }, []);

  const loadStoreTypes = async () => {
    setLoading(true);
    try {
      const types = await getStoreTypes();
      setStoreTypes(types);
    } catch (error) {
      console.error('Erro ao carregar tipos de loja:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os tipos de loja',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateDialog = () => {
    setSelectedType(null);
    setFormData({ name: '', icon: '🏪', description: '' });
    setFormDialog(true);
  };

  const handleOpenEditDialog = (type: StoreType) => {
    setSelectedType(type);
    setFormData({
      name: type.name,
      icon: type.icon || '🏪',
      description: type.description || ''
    });
    setFormDialog(true);
  };

  const handleOpenDeleteDialog = (type: StoreType) => {
    setSelectedType(type);
    setDeleteDialog(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Atenção',
        description: 'O nome da categoria é obrigatório',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      if (selectedType) {
        // Editar
        await updateStoreType(selectedType.id, {
          name: formData.name,
          icon: formData.icon,
          description: formData.description
        });
        toast({
          title: 'Sucesso',
          description: 'Categoria atualizada com sucesso',
        });
      } else {
        // Criar
        await addStoreType(formData.name, formData.icon, formData.description);
        toast({
          title: 'Sucesso',
          description: 'Categoria criada com sucesso',
        });
      }
      setFormDialog(false);
      loadStoreTypes();
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível salvar a categoria',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedType) return;

    setSubmitting(true);
    try {
      await deleteStoreType(selectedType.id);
      toast({
        title: 'Sucesso',
        description: 'Categoria desativada com sucesso',
      });
      setDeleteDialog(false);
      loadStoreTypes();
    } catch (error: any) {
      console.error('Erro ao excluir:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível excluir a categoria',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date: any) => {
    if (!date) return '-';
    return date.toDate?.().toLocaleDateString('pt-BR') || '-';
  };

  const getStatusBadge = (type: StoreType) => {
    if (type.isActive) {
      return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Ativa</Badge>;
    }
    return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Inativa</Badge>;
  };

  // Lista de emojis sugeridos para categorias
  const suggestedIcons = ['🍕', '🍔', '🍣', '🍰', '🍜', '🥗', '🍗', '🌮', '🍱', '☕', '🍺', '🍦', '🥘', '🥙', '🍛'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando tipos de loja...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Tipos de Loja</h1>
          <p className="text-muted-foreground">Gerencie as categorias disponíveis para todas as lojas da plataforma</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadStoreTypes} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={handleOpenCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Categoria
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total de Categorias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{storeTypes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Categorias Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {storeTypes.filter(t => t.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Categorias Inativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {storeTypes.filter(t => !t.isActive).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Categorias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Lista de Categorias
          </CardTitle>
          <CardDescription>
            Categorias que as lojas podem selecionar para classificar seu estabelecimento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ícone</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {storeTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Nenhuma categoria cadastrada. Clique em "Nova Categoria" para começar.
                  </TableCell>
                </TableRow>
              ) : (
                storeTypes.map((type) => (
                  <TableRow key={type.id}>
                    <TableCell>
                      <span className="text-2xl">{type.icon}</span>
                    </TableCell>
                    <TableCell className="font-medium">{type.name}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">{type.slug}</code>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {type.description || '-'}
                    </TableCell>
                    <TableCell>{getStatusBadge(type)}</TableCell>
                    <TableCell>{formatDate(type.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenEditDialog(type)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {type.isActive && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleOpenDeleteDialog(type)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog de Formulário (Criar/Editar) */}
      <Dialog open={formDialog} onOpenChange={setFormDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedType ? 'Editar Categoria' : 'Nova Categoria'}
            </DialogTitle>
            <DialogDescription>
              {selectedType 
                ? 'Edite as informações da categoria' 
                : 'Crie uma nova categoria para as lojas da plataforma'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Categoria *</Label>
              <Input
                id="name"
                placeholder="Ex: Pizzaria, Hamburgueria, Açaí..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon">Ícone (Emoji)</Label>
              <div className="flex gap-2">
                <Input
                  id="icon"
                  placeholder="🏪"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-20 text-2xl text-center"
                  maxLength={2}
                />
                <div className="flex-1 flex flex-wrap gap-1">
                  {suggestedIcons.map((emoji) => (
                    <Button
                      key={emoji}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xl"
                      onClick={() => setFormData({ ...formData, icon: emoji })}
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição (Opcional)</Label>
              <Textarea
                id="description"
                placeholder="Descrição curta sobre este tipo de estabelecimento..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            {formData.name && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">Preview:</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{formData.icon}</span>
                  <span className="font-medium">{formData.name}</span>
                  <code className="text-xs bg-background px-2 py-1 rounded">
                    {formData.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}
                  </code>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFormDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Salvando...' : (selectedType ? 'Atualizar' : 'Criar')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a desativar a categoria "<strong>{selectedType?.name}</strong>". 
              Esta ação não pode ser desfeita e a categoria não estará mais disponível para novas lojas.
              <br /><br />
              <strong>Nota:</strong> Se alguma loja já estiver usando esta categoria, a exclusão será bloqueada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={submitting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {submitting ? 'Desativando...' : 'Desativar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Aviso Importante */}
      <Card className="border-blue-500/50 bg-blue-500/5">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Impacto das Categorias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>As categorias criadas aqui estarão disponíveis para <strong>todas as lojas</strong> da plataforma.</li>
            <li>Lojas podem selecionar <strong>múltiplas categorias</strong> para melhor classificação.</li>
            <li>Categorias são usadas nos <strong>filtros de busca</strong> do aplicativo mobile.</li>
            <li>O <strong>slug</strong> é gerado automaticamente e usado em URLs (ex: /lojas/pizzaria).</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

