import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getStoreMenuItems, setItemAvailability } from '@/services/menuService';
import { getStoreCategories } from '@/services/menuService';
import { MenuItem } from '@/types/menu-advanced';
import { MenuCategory } from '@/types/shared';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, EyeOff, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ========================================
// AVAILABILITY ITEM COMPONENT
// ========================================

interface AvailabilityItemProps {
  item: MenuItem;
  onToggle: (itemId: string, newStatus: boolean) => void;
  optimisticStatus?: boolean;
}

function AvailabilityItem({ item, onToggle, optimisticStatus }: AvailabilityItemProps) {
  const isAvailable = optimisticStatus !== undefined ? optimisticStatus : item.isAvailable;
  const hasStock = item.stockControl?.enabled
    ? item.stockControl.currentStock > 0
    : true;

  return (
    <div
      className={`
        group flex items-center justify-between p-4 
        bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
        rounded-lg hover:shadow-sm transition-all
        ${!isAvailable ? 'opacity-60' : ''}
      `}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Product Image/Icon */}
        <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {item.images && item.images[0] ? (
            <img
              src={item.images[0].thumbnailUrl || item.images[0].url}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-2xl">🍽️</div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{item.name}</div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-sm text-muted-foreground">
              {item.basePrice.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </span>
            {item.stockControl?.enabled && (
              <Badge
                variant={hasStock ? 'secondary' : 'destructive'}
                className="text-xs"
              >
                {item.stockControl.currentStock > 0
                  ? `Estoque: ${item.stockControl.currentStock}`
                  : 'Sem estoque'}
              </Badge>
            )}
            {item.isPopular && (
              <Badge variant="default" className="text-xs">
                Popular
              </Badge>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className="hidden sm:flex items-center gap-2">
          {isAvailable ? (
            <div className="flex items-center gap-1.5 text-green-600">
              <Eye className="h-4 w-4" />
              <span className="text-sm font-medium">Disponível</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-gray-400">
              <EyeOff className="h-4 w-4" />
              <span className="text-sm font-medium">Indisponível</span>
            </div>
          )}
        </div>
      </div>

      {/* Toggle Switch */}
      <div className="ml-4">
        <Switch
          checked={isAvailable}
          onCheckedChange={(checked) => onToggle(item.id, checked)}
          disabled={item.stockControl?.enabled && !hasStock}
        />
      </div>
    </div>
  );
}

// ========================================
// MAIN COMPONENT
// ========================================

export default function MenuAvailability() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showOnlyUnavailable, setShowOnlyUnavailable] = useState(false);

  // Optimistic updates map
  const [optimisticUpdates, setOptimisticUpdates] = useState<Map<string, boolean>>(
    new Map()
  );

  useEffect(() => {
    loadData();
  }, [user?.storeId]);

  const loadData = async () => {
    if (!user?.storeId) return;

    try {
      setLoading(true);
      const [itemsData, categoriesData] = await Promise.all([
        getStoreMenuItems(user.storeId),
        getStoreCategories(user.storeId),
      ]);
      setItems(itemsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os itens',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (itemId: string, newStatus: boolean) => {
    // Optimistic UI update
    setOptimisticUpdates((prev) => new Map(prev).set(itemId, newStatus));

    try {
      await setItemAvailability(itemId, newStatus);

      toast({
        title: `✅ Item ${newStatus ? 'disponibilizado' : 'indisponibilizado'}!`,
      });

      // Update local state
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, isAvailable: newStatus } : item
        )
      );

      // Clear optimistic update
      setOptimisticUpdates((prev) => {
        const newMap = new Map(prev);
        newMap.delete(itemId);
        return newMap;
      });
    } catch (error) {
      console.error('Erro ao atualizar disponibilidade:', error);

      // Revert optimistic update
      setOptimisticUpdates((prev) => {
        const newMap = new Map(prev);
        newMap.delete(itemId);
        return newMap;
      });

      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a disponibilidade',
        variant: 'destructive',
      });
    }
  };

  // Filtered and grouped items
  const { filteredItems, groupedItems, stats } = useMemo(() => {
    let filtered = items;

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((item) => item.categoryId === selectedCategory);
    }

    // Filter by availability
    if (showOnlyUnavailable) {
      filtered = filtered.filter((item) => !item.isAvailable);
    }

    // Group by category
    const grouped = new Map<string, MenuItem[]>();
    filtered.forEach((item) => {
      const category = item.categoryId;
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(item);
    });

    // Calculate stats
    const totalItems = items.length;
    const availableItems = items.filter((item) => item.isAvailable).length;
    const unavailableItems = totalItems - availableItems;

    return {
      filteredItems: filtered,
      groupedItems: grouped,
      stats: { totalItems, availableItems, unavailableItems },
    };
  }, [items, searchQuery, selectedCategory, showOnlyUnavailable]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando itens...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Disponibilidade de Itens</h1>
        <p className="text-muted-foreground mt-1">
          Ative ou desative itens rapidamente
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total de Itens</div>
          <div className="text-2xl font-bold mt-1">{stats.totalItems}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Disponíveis</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {stats.availableItems}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Indisponíveis</div>
          <div className="text-2xl font-bold text-orange-600 mt-1">
            {stats.unavailableItems}
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Show Only Unavailable */}
          <div className="flex items-center gap-2 px-3 border rounded-lg bg-white dark:bg-gray-800">
            <Switch
              checked={showOnlyUnavailable}
              onCheckedChange={setShowOnlyUnavailable}
              id="show-unavailable"
            />
            <label
              htmlFor="show-unavailable"
              className="text-sm cursor-pointer whitespace-nowrap"
            >
              Apenas indisponíveis
            </label>
          </div>
        </div>
      </Card>

      {/* Items List */}
      {filteredItems.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum item encontrado</h3>
            <p className="text-muted-foreground">
              Tente ajustar os filtros ou criar novos produtos
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {Array.from(groupedItems.entries()).map(([categoryId, categoryItems]) => {
            const category = categories.find((c) => c.id === categoryId);
            return (
              <div key={categoryId}>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  {category?.name || 'Sem Categoria'}
                  <Badge variant="secondary">{categoryItems.length}</Badge>
                </h2>
                <div className="space-y-2">
                  {categoryItems.map((item) => (
                    <AvailabilityItem
                      key={item.id}
                      item={item}
                      onToggle={handleToggleAvailability}
                      optimisticStatus={optimisticUpdates.get(item.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 