import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, MapPin } from "lucide-react";

interface Pedagio {
  id: string;
  rota_id: string;
  descricao: string;
  valor: number;
  created_at: string;
  updated_at: string;
}

interface Route {
  id: string;
  origem: string;
  destino: string;
  distancia_km: number;
}

export default function Pedagios() {
  const { user } = useAuth();
  const { canCreate, canUpdate, canDelete } = useRole();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPedagio, setEditingPedagio] = useState<Pedagio | null>(null);
  const [formData, setFormData] = useState({
    rota_id: "",
    descricao: "",
    valor: "",
  });

  // Fetch pedágios data
  const { data: pedagios = [], isLoading } = useQuery({
    queryKey: ["pedagios"],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("pedagios")
        .select("*")
        .eq("user_id", user.id)
        .order("descricao");
      
      if (error) throw error;
      return data as Pedagio[];
    },
    enabled: !!user?.id,
  });

  // Fetch routes for dropdown
  const { data: routes = [] } = useQuery({
    queryKey: ["routes"],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("routes")
        .select("id, origem, destino, distancia_km")
        .eq("user_id", user.id)
        .order("origem");
      
      if (error) throw error;
      return data as Route[];
    },
    enabled: !!user?.id,
  });

  // Create pedágio mutation
  const createPedagioMutation = useMutation({
    mutationFn: async (newPedagio: Omit<Pedagio, "id" | "created_at" | "updated_at">) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from("pedagios")
        .insert([{ ...newPedagio, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pedagios"] });
      toast({
        title: "Pedágio criado",
        description: "O pedágio foi cadastrado com sucesso.",
      });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar pedágio",
        description: "Ocorreu um erro ao cadastrar o pedágio.",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  // Update pedágio mutation
  const updatePedagioMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Pedagio> & { id: string }) => {
      const { data, error } = await supabase
        .from("pedagios")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pedagios"] });
      toast({
        title: "Pedágio atualizado",
        description: "O pedágio foi atualizado com sucesso.",
      });
      resetForm();
      setIsDialogOpen(false);
      setEditingPedagio(null);
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar pedágio",
        description: "Ocorreu um erro ao atualizar o pedágio.",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  // Delete pedágio mutation
  const deletePedagioMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("pedagios")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pedagios"] });
      toast({
        title: "Pedágio excluído",
        description: "O pedágio foi excluído com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir pedágio",
        description: "Ocorreu um erro ao excluir o pedágio.",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  const resetForm = () => {
    setFormData({
      rota_id: "",
      descricao: "",
      valor: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.rota_id || !formData.descricao || !formData.valor) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    const pedagioData = {
      rota_id: formData.rota_id,
      descricao: formData.descricao,
      valor: parseFloat(formData.valor),
    };

    if (editingPedagio) {
      updatePedagioMutation.mutate({ id: editingPedagio.id, ...pedagioData });
    } else {
      createPedagioMutation.mutate(pedagioData);
    }
  };

  const handleEdit = (pedagio: Pedagio) => {
    setEditingPedagio(pedagio);
    setFormData({
      rota_id: pedagio.rota_id,
      descricao: pedagio.descricao,
      valor: pedagio.valor.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingPedagio(null);
      resetForm();
    }
  };

  const getRouteName = (routeId: string) => {
    const route = routes.find(r => r.id === routeId);
    return route ? `${route.origem} → ${route.destino}` : 'Rota não encontrada';
  };

  const canModify = canCreate("pedagios") || canUpdate("pedagios");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Pedágios</h1>
          <p className="text-muted-foreground">
            Gerencie os pedágios associados às rotas de transporte
          </p>
        </div>
        
        {canModify && (
          <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Pedágio
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingPedagio ? "Editar Pedágio" : "Novo Pedágio"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingPedagio 
                      ? "Atualize as informações do pedágio." 
                      : "Preencha os dados para cadastrar um novo pedágio."
                    }
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="rota_id" className="text-right">
                      Rota *
                    </Label>
                    <Select
                      value={formData.rota_id}
                      onValueChange={(value) => setFormData({ ...formData, rota_id: value })}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Selecione uma rota" />
                      </SelectTrigger>
                      <SelectContent>
                        {routes.length === 0 ? (
                          <SelectItem value="none" disabled>
                            Nenhuma rota disponível
                          </SelectItem>
                        ) : (
                          routes.map((route) => (
                            <SelectItem key={route.id} value={route.id}>
                              {route.origem} → {route.destino} ({route.distancia_km} km)
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="descricao" className="text-right">
                      Descrição *
                    </Label>
                    <Input
                      id="descricao"
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      className="col-span-3"
                      placeholder="Ex: Pedágio BR-101 Km 150"
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="valor" className="text-right">
                      Valor (R$) *
                    </Label>
                    <Input
                      id="valor"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.valor}
                      onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                      className="col-span-3"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingPedagio ? "Atualizar" : "Cadastrar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Pedágios Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rota</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Valor (R$)</TableHead>
              {canModify && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={canModify ? 4 : 3} className="text-center py-8">
                  Carregando pedágios...
                </TableCell>
              </TableRow>
            ) : pedagios.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canModify ? 4 : 3} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <MapPin className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">Nenhum pedágio cadastrado</p>
                    {canModify && (
                      <p className="text-sm text-muted-foreground">
                        Clique em "Novo Pedágio" para começar
                      </p>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              pedagios.map((pedagio) => (
                <TableRow key={pedagio.id}>
                  <TableCell className="font-medium">{getRouteName(pedagio.rota_id)}</TableCell>
                  <TableCell>{pedagio.descricao}</TableCell>
                  <TableCell>R$ {pedagio.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                  {canModify && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {canUpdate("pedagios") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(pedagio)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {canDelete("pedagios") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deletePedagioMutation.mutate(pedagio.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}