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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Settings } from "lucide-react";

interface CustoVariavel {
  id: string;
  nome: string;
  valor_por_km: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export default function CustosVariaveis() {
  const { user } = useAuth();
  const { canCreate, canUpdate, canDelete } = useRole();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCusto, setEditingCusto] = useState<CustoVariavel | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    valor_por_km: "",
    ativo: true,
  });

  // Fetch custos variáveis data
  const { data: custos = [], isLoading } = useQuery({
    queryKey: ["custos_variaveis"],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("custos_variaveis")
        .select("*")
        .eq("user_id", user.id)
        .order("nome");
      
      if (error) throw error;
      return data as CustoVariavel[];
    },
    enabled: !!user?.id,
  });

  // Create custo variável mutation
  const createCustoMutation = useMutation({
    mutationFn: async (newCusto: Omit<CustoVariavel, "id" | "created_at" | "updated_at">) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from("custos_variaveis")
        .insert([{ ...newCusto, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custos_variaveis"] });
      toast({
        title: "Custo variável criado",
        description: "O custo variável foi cadastrado com sucesso.",
      });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar custo variável",
        description: "Ocorreu um erro ao cadastrar o custo variável.",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  // Update custo variável mutation
  const updateCustoMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CustoVariavel> & { id: string }) => {
      const { data, error } = await supabase
        .from("custos_variaveis")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custos_variaveis"] });
      toast({
        title: "Custo variável atualizado",
        description: "O custo variável foi atualizado com sucesso.",
      });
      resetForm();
      setIsDialogOpen(false);
      setEditingCusto(null);
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar custo variável",
        description: "Ocorreu um erro ao atualizar o custo variável.",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  // Delete custo variável mutation
  const deleteCustoMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("custos_variaveis")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custos_variaveis"] });
      toast({
        title: "Custo variável excluído",
        description: "O custo variável foi excluído com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir custo variável",
        description: "Ocorreu um erro ao excluir o custo variável.",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  const resetForm = () => {
    setFormData({
      nome: "",
      valor_por_km: "",
      ativo: true,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.valor_por_km) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o nome e o valor por km.",
        variant: "destructive",
      });
      return;
    }

    const custoData = {
      nome: formData.nome,
      valor_por_km: parseFloat(formData.valor_por_km),
      ativo: formData.ativo,
    };

    if (editingCusto) {
      updateCustoMutation.mutate({ id: editingCusto.id, ...custoData });
    } else {
      createCustoMutation.mutate(custoData);
    }
  };

  const handleEdit = (custo: CustoVariavel) => {
    setEditingCusto(custo);
    setFormData({
      nome: custo.nome,
      valor_por_km: custo.valor_por_km.toString(),
      ativo: custo.ativo,
    });
    setIsDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingCusto(null);
      resetForm();
    }
  };

  const canModify = canCreate("custos_variaveis") || canUpdate("custos_variaveis");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Custos Variáveis</h1>
          <p className="text-muted-foreground">
            Gerencie os custos variáveis por quilômetro (manutenção, pneus, peças, etc.)
          </p>
        </div>
        
        {canModify && (
          <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Custo Variável
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingCusto ? "Editar Custo Variável" : "Novo Custo Variável"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingCusto 
                      ? "Atualize as informações do custo variável." 
                      : "Preencha os dados para cadastrar um novo custo variável."
                    }
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="nome" className="text-right">
                      Nome *
                    </Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      className="col-span-3"
                      placeholder="Ex: Manutenção, Pneus"
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="valor_por_km" className="text-right">
                      Valor por Km (R$) *
                    </Label>
                    <Input
                      id="valor_por_km"
                      type="number"
                      step="0.001"
                      min="0"
                      value={formData.valor_por_km}
                      onChange={(e) => setFormData({ ...formData, valor_por_km: e.target.value })}
                      className="col-span-3"
                      placeholder="0.000"
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="ativo" className="text-right">
                      Ativo
                    </Label>
                    <Switch
                      id="ativo"
                      checked={formData.ativo}
                      onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingCusto ? "Atualizar" : "Cadastrar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Custos Variáveis Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Valor por Km (R$)</TableHead>
              <TableHead>Status</TableHead>
              {canModify && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={canModify ? 4 : 3} className="text-center py-8">
                  Carregando custos variáveis...
                </TableCell>
              </TableRow>
            ) : custos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canModify ? 4 : 3} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <Settings className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">Nenhum custo variável cadastrado</p>
                    {canModify && (
                      <p className="text-sm text-muted-foreground">
                        Clique em "Novo Custo Variável" para começar
                      </p>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              custos.map((custo) => (
                <TableRow key={custo.id}>
                  <TableCell className="font-medium">{custo.nome}</TableCell>
                  <TableCell>R$ {custo.valor_por_km.toLocaleString('pt-BR', { minimumFractionDigits: 3 })}</TableCell>
                  <TableCell>
                    <Badge variant={custo.ativo ? "default" : "secondary"}>
                      {custo.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  {canModify && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {canUpdate("custos_variaveis") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(custo)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {canDelete("custos_variaveis") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteCustoMutation.mutate(custo.id)}
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