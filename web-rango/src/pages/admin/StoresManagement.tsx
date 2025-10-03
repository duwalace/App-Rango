import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Store, 
  Search, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Ban,
  Eye,
  Edit
} from "lucide-react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

interface StoreData {
  id: string;
  name: string;
  category?: string;
  isActive: boolean;
  status?: string;
  createdAt: any;
  contact?: {
    phone?: string;
    email?: string;
  };
}

export default function StoresManagement() {
  const [stores, setStores] = useState<StoreData[]>([]);
  const [filteredStores, setFilteredStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive" | "pending">("all");
  const [selectedStore, setSelectedStore] = useState<StoreData | null>(null);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    action: "suspend" | "activate" | "approve" | "reject" | null;
    store: StoreData | null;
  }>({ open: false, action: null, store: null });
  const { toast } = useToast();

  useEffect(() => {
    loadStores();
  }, []);

  useEffect(() => {
    filterStores();
  }, [searchTerm, filterStatus, stores]);

  const loadStores = async () => {
    setLoading(true);
    try {
      const storesSnapshot = await getDocs(collection(db, 'stores'));
      const storesData: StoreData[] = [];
      
      storesSnapshot.forEach((doc) => {
        storesData.push({
          id: doc.id,
          ...doc.data()
        } as StoreData);
      });

      // Ordenar por data de criação (mais recentes primeiro)
      storesData.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });

      setStores(storesData);
      console.log('✅ Lojas carregadas:', storesData.length);
    } catch (error) {
      console.error('Erro ao carregar lojas:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as lojas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterStores = () => {
    let filtered = [...stores];

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(store =>
        store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.contact?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por status
    if (filterStatus !== "all") {
      if (filterStatus === "active") {
        filtered = filtered.filter(store => store.isActive === true);
      } else if (filterStatus === "inactive") {
        filtered = filtered.filter(store => store.isActive === false);
      } else if (filterStatus === "pending") {
        filtered = filtered.filter(store => store.status === "pending");
      }
    }

    setFilteredStores(filtered);
  };

  const handleAction = async () => {
    if (!actionDialog.store || !actionDialog.action) return;

    try {
      const storeRef = doc(db, 'stores', actionDialog.store.id);
      
      switch (actionDialog.action) {
        case "suspend":
          await updateDoc(storeRef, { isActive: false });
          toast({
            title: 'Loja Suspensa',
            description: `${actionDialog.store.name} foi suspensa`,
          });
          break;
        case "activate":
          await updateDoc(storeRef, { isActive: true });
          toast({
            title: 'Loja Ativada',
            description: `${actionDialog.store.name} foi ativada`,
          });
          break;
        case "approve":
          await updateDoc(storeRef, { status: "approved", isActive: true });
          toast({
            title: 'Loja Aprovada',
            description: `${actionDialog.store.name} foi aprovada e está ativa`,
          });
          break;
        case "reject":
          await updateDoc(storeRef, { status: "rejected", isActive: false });
          toast({
            title: 'Loja Rejeitada',
            description: `${actionDialog.store.name} foi rejeitada`,
            variant: 'destructive',
          });
          break;
      }

      setActionDialog({ open: false, action: null, store: null });
      loadStores(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao executar ação:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível executar a ação',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (store: StoreData) => {
    if (store.status === "pending") {
      return <Badge variant="secondary"><AlertCircle className="h-3 w-3 mr-1" />Pendente</Badge>;
    }
    if (store.isActive) {
      return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Ativa</Badge>;
    }
    return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Inativa</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando lojas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestão de Lojas</h1>
        <p className="text-muted-foreground">Gerencie todos os estabelecimentos da plataforma</p>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, categoria ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                onClick={() => setFilterStatus("all")}
              >
                Todas ({stores.length})
              </Button>
              <Button
                variant={filterStatus === "active" ? "default" : "outline"}
                onClick={() => setFilterStatus("active")}
              >
                Ativas ({stores.filter(s => s.isActive).length})
              </Button>
              <Button
                variant={filterStatus === "pending" ? "default" : "outline"}
                onClick={() => setFilterStatus("pending")}
              >
                Pendentes ({stores.filter(s => s.status === "pending").length})
              </Button>
              <Button
                variant={filterStatus === "inactive" ? "default" : "outline"}
                onClick={() => setFilterStatus("inactive")}
              >
                Inativas ({stores.filter(s => !s.isActive && s.status !== "pending").length})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Lojas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Lista de Lojas ({filteredStores.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data de Cadastro</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStores.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Nenhuma loja encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredStores.map((store) => (
                  <TableRow key={store.id}>
                    <TableCell className="font-medium">{store.name}</TableCell>
                    <TableCell>{store.category || '-'}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{store.contact?.phone || '-'}</div>
                        <div className="text-muted-foreground">{store.contact?.email || '-'}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(store)}</TableCell>
                    <TableCell>
                      {store.createdAt?.toDate?.().toLocaleDateString('pt-BR') || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {store.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => setActionDialog({ open: true, action: "approve", store })}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Aprovar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setActionDialog({ open: true, action: "reject", store })}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Rejeitar
                            </Button>
                          </>
                        )}
                        {store.status !== "pending" && (
                          <>
                            {store.isActive ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setActionDialog({ open: true, action: "suspend", store })}
                              >
                                <Ban className="h-4 w-4 mr-1" />
                                Suspender
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => setActionDialog({ open: true, action: "activate", store })}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Ativar
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedStore(store)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </>
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

      {/* Dialog de Confirmação */}
      <Dialog open={actionDialog.open} onOpenChange={(open) => !open && setActionDialog({ open: false, action: null, store: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Ação</DialogTitle>
            <DialogDescription>
              {actionDialog.action === "suspend" && `Tem certeza que deseja suspender "${actionDialog.store?.name}"?`}
              {actionDialog.action === "activate" && `Tem certeza que deseja ativar "${actionDialog.store?.name}"?`}
              {actionDialog.action === "approve" && `Tem certeza que deseja aprovar "${actionDialog.store?.name}"?`}
              {actionDialog.action === "reject" && `Tem certeza que deseja rejeitar "${actionDialog.store?.name}"?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog({ open: false, action: null, store: null })}>
              Cancelar
            </Button>
            <Button onClick={handleAction}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

