import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { ComplementGroup, Complement, ProductFormData } from '@/types/menu-advanced';

interface ComplementsStepProps {
  data: Partial<ProductFormData>;
  onUpdate: (updates: Partial<ProductFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const ComplementsStep: React.FC<ComplementsStepProps> = ({
  data,
  onUpdate,
  onNext,
  onBack
}) => {
  const [groups, setGroups] = useState<ComplementGroup[]>(
    data.complementGroups || []
  );
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  
  /**
   * Adicionar novo grupo
   */
  const addGroup = () => {
    const newGroup: ComplementGroup = {
      id: `group-${Date.now()}`,
      name: '',
      description: '',
      isRequired: false,
      minSelection: 0,
      maxSelection: 1,
      complements: [],
      order: groups.length
    };
    
    const newGroups = [...groups, newGroup];
    setGroups(newGroups);
    setExpandedGroups(prev => new Set([...prev, newGroup.id]));
  };
  
  /**
   * Atualizar grupo
   */
  const updateGroup = (groupId: string, updates: Partial<ComplementGroup>) => {
    setGroups(groups.map(g => 
      g.id === groupId ? { ...g, ...updates } : g
    ));
  };
  
  /**
   * Deletar grupo
   */
  const deleteGroup = (groupId: string) => {
    if (!confirm('Deseja remover este grupo de complementos?')) return;
    setGroups(groups.filter(g => g.id !== groupId));
    setExpandedGroups(prev => {
      const next = new Set(prev);
      next.delete(groupId);
      return next;
    });
  };
  
  /**
   * Adicionar complemento
   */
  const addComplement = (groupId: string) => {
    const newComplement: Complement = {
      id: `comp-${Date.now()}`,
      name: '',
      description: '',
      price: 0,
      isAvailable: true,
      maxQuantity: 10,
      order: 0
    };
    
    setGroups(groups.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          complements: [...g.complements, { ...newComplement, order: g.complements.length }]
        };
      }
      return g;
    }));
  };
  
  /**
   * Atualizar complemento
   */
  const updateComplement = (
    groupId: string, 
    complementId: string, 
    updates: Partial<Complement>
  ) => {
    setGroups(groups.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          complements: g.complements.map(c =>
            c.id === complementId ? { ...c, ...updates } : c
          )
        };
      }
      return g;
    }));
  };
  
  /**
   * Deletar complemento
   */
  const deleteComplement = (groupId: string, complementId: string) => {
    setGroups(groups.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          complements: g.complements.filter(c => c.id !== complementId)
        };
      }
      return g;
    }));
  };
  
  /**
   * Toggle expand group
   */
  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };
  
  /**
   * Continuar para próximo step
   */
  const handleContinue = () => {
    onUpdate({ complementGroups: groups });
    onNext();
  };
  
  /**
   * Pular step (complementos são opcionais)
   */
  const handleSkip = () => {
    onUpdate({ complementGroups: [] });
    onNext();
  };
  
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold">Complementos e Adicionais</h2>
            <p className="text-muted-foreground mt-1">
              Configure opções de personalização para este produto
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              💡 <strong>Dica:</strong> Produtos preparados (hambúrguer, pizza) geralmente têm complementos. 
              Produtos industrializados (refrigerante) normalmente não precisam.
            </p>
          </div>
          
          {/* Botões de ação */}
          <div className="flex gap-2">
            <Button onClick={addGroup} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Grupo
            </Button>
            {groups.length === 0 && (
              <Button onClick={handleSkip} variant="ghost">
                Pular esta etapa
              </Button>
            )}
          </div>
        </div>
      </Card>
      
      {/* Lista de Grupos */}
      {groups.length > 0 ? (
        <div className="space-y-4">
          {groups.map((group, groupIdx) => {
            const isExpanded = expandedGroups.has(group.id);
            
            return (
              <Card key={group.id} className="overflow-hidden">
                {/* Header do Grupo */}
                <div 
                  className="p-4 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleGroup(group.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <GripVertical className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <h3 className="font-semibold">
                          {group.name || `Grupo ${groupIdx + 1}`}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {group.complements.length} opções
                          {group.isRequired && ' • Obrigatório'}
                          {!group.isRequired && ' • Opcional'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteGroup(group.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Conteúdo do Grupo */}
                {isExpanded && (
                  <div className="p-6 space-y-6" onClick={(e) => e.stopPropagation()}>
                    {/* Informações do Grupo */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nome do Grupo *</Label>
                        <Input
                          placeholder="Ex: Adicionais, Ponto da Carne, Molhos"
                          value={group.name}
                          onChange={(e) => updateGroup(group.id, { name: e.target.value })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Descrição (opcional)</Label>
                        <Input
                          placeholder="Ex: Escolha seus adicionais favoritos"
                          value={group.description}
                          onChange={(e) => updateGroup(group.id, { description: e.target.value })}
                        />
                      </div>
                    </div>
                    
                    {/* Configurações do Grupo */}
                    <div className="grid md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">Obrigatório</Label>
                          <p className="text-xs text-muted-foreground">
                            Cliente deve escolher
                          </p>
                        </div>
                        <Switch
                          checked={group.isRequired}
                          onCheckedChange={(checked) => 
                            updateGroup(group.id, { 
                              isRequired: checked,
                              minSelection: checked ? Math.max(group.minSelection, 1) : 0
                            })
                          }
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm">Mínimo de Seleções</Label>
                        <Input
                          type="number"
                          min="0"
                          max={group.maxSelection}
                          value={group.minSelection}
                          onChange={(e) => 
                            updateGroup(group.id, { minSelection: parseInt(e.target.value) || 0 })
                          }
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm">Máximo de Seleções</Label>
                        <Input
                          type="number"
                          min={group.minSelection}
                          value={group.maxSelection}
                          onChange={(e) => 
                            updateGroup(group.id, { maxSelection: parseInt(e.target.value) || 1 })
                          }
                        />
                      </div>
                    </div>
                    
                    {/* Lista de Complementos */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold">Opções</Label>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addComplement(group.id)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Adicionar Opção
                        </Button>
                      </div>
                      
                      {group.complements.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed rounded-lg">
                          <p className="text-muted-foreground">
                            Nenhuma opção adicionada
                          </p>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => addComplement(group.id)}
                            className="mt-2"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Adicionar Primeira Opção
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {group.complements.map((complement) => (
                            <Card key={complement.id} className="p-3">
                              <div className="flex items-start gap-3">
                                <GripVertical className="h-4 w-4 text-muted-foreground mt-3" />
                                
                                <div className="grid md:grid-cols-12 gap-3 flex-1">
                                  <div className="md:col-span-4">
                                    <Input
                                      placeholder="Nome *"
                                      value={complement.name}
                                      onChange={(e) => 
                                        updateComplement(group.id, complement.id, { name: e.target.value })
                                      }
                                    />
                                  </div>
                                  
                                  <div className="md:col-span-4">
                                    <Input
                                      placeholder="Descrição (opcional)"
                                      value={complement.description}
                                      onChange={(e) => 
                                        updateComplement(group.id, complement.id, { description: e.target.value })
                                      }
                                    />
                                  </div>
                                  
                                  <div className="md:col-span-2">
                                    <Input
                                      type="number"
                                      step="0.01"
                                      placeholder="Preço"
                                      value={complement.price}
                                      onChange={(e) => 
                                        updateComplement(group.id, complement.id, { 
                                          price: parseFloat(e.target.value) || 0 
                                        })
                                      }
                                    />
                                  </div>
                                  
                                  <div className="md:col-span-1 flex items-center justify-center">
                                    <Switch
                                      checked={complement.isAvailable}
                                      onCheckedChange={(checked) =>
                                        updateComplement(group.id, complement.id, { isAvailable: checked })
                                      }
                                    />
                                  </div>
                                  
                                  <div className="md:col-span-1 flex items-center justify-center">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => deleteComplement(group.id, complement.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Nenhum grupo de complementos</h3>
              <p className="text-muted-foreground mt-1">
                Adicione grupos de complementos para permitir personalização do produto
              </p>
            </div>
            <div className="flex gap-2 justify-center">
              <Button onClick={addGroup}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Grupo
              </Button>
              <Button variant="ghost" onClick={handleSkip}>
                Pular esta etapa
              </Button>
            </div>
          </div>
        </Card>
      )}
      
      {/* Navegação */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          Voltar
        </Button>
        <Button onClick={handleContinue}>
          Continuar
        </Button>
      </div>
    </div>
  );
}; 