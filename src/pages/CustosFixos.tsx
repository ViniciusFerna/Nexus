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
import { Plus, Edit, Trash2, DollarSign } from "lucide-react";

interface CustoFixo {
  id: string;
  nome: string;
  valor_mensal: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export default function CustosFixos() {
  const { user } = useAuth();
  const { canCreate, canUpdate, canDelete } = useRole();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCusto, setEditingCusto] = useState<CustoFixo | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    valor_mensal: "",
    ativo: true,
  });

  // Fetch custos fixos data
  const { data: custos = [], isLoading } = useQuery({
    queryKey: ["custos_fixos"],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("custos_fixos")
        .select("*")
        .eq("user_id", user.id)
        .order("nome");
      
      if (error) throw error;
      return data as CustoFixo[];
    },
    enabled: !!user?.id,
  });

  // Create custo fixo mutation
  const createCustoMutation = useMutation({
    mutationFn: async (newCusto: Omit<CustoFixo, "id" | "created_at" | "updated_at">) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from("custos_fixos")
        .insert([{ ...newCusto, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custos_fixos"] });
      toast({
        title: "Custo fixo criado",
        description: "O custo fixo foi cadastrado com sucesso.",
      });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar custo fixo",
        description: "Ocorreu um erro ao cadastrar o custo fixo.",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  // Update custo fixo mutation
  const updateCustoMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CustoFixo> & { id: string }) => {
      const { data, error } = await supabase
        .from("custos_fixos")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custos_fixos"] });
      toast({
        title: "Custo fixo atualizado",
        description: "O custo fixo foi atualizado com sucesso.",
      });
      resetForm();
      setIsDialogOpen(false);
      setEditingCusto(null);
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar custo fixo",
        description: "Ocorreu um erro ao atualizar o custo fixo.",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  // Delete custo fixo mutation
  const deleteCustoMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("custos_fixos")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custos_fixos"] });
      toast({
        title: "Custo fixo excluído",
        description: "O custo fixo foi excluído com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir custo fixo",
        description: "Ocorreu um erro ao excluir o custo fixo.",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  const resetForm = () => {
    setFormData({
      nome: "",
      valor_mensal: "",
      ativo: true,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.valor_mensal) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o nome e o valor mensal.",
        variant: "destructive",
      });
      return;
    }

    const custoData = {
      nome: formData.nome,
      valor_mensal: parseFloat(formData.valor_mensal),
      ativo: formData.ativo,
    };

    if (editingCusto) {
      updateCustoMutation.mutate({ id: editingCusto.id, ...custoData });
    } else {
      createCustoMutation.mutate(custoData);
    }
  };

  const handleEdit = (custo: CustoFixo) => {
    setEditingCusto(custo);
    setFormData({
      nome: custo.nome,
      valor_mensal: custo.valor_mensal.toString(),
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

  const canModify = canCreate("custos_fixos") || canUpdate("custos_fixos");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Custos Fixos</h1>
          <p className="text-muted-foreground">
            Gerencie os custos fixos mensais do transporte (depreciação, seguro, salário, etc.)
          </p>
        </div>
        
        {canModify && (
          <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Custo Fixo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingCusto ? "Editar Custo Fixo" : "Novo Custo Fixo"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingCusto 
                      ? "Atualize as informações do custo fixo." 
                      : "Preencha os dados para cadastrar um novo custo fixo."
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
                      placeholder="Ex: Depreciação, Seguro"
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="valor_mensal" className="text-right">
                      Valor Mensal (R$) *
                    </Label>
                    <Input
                      id="valor_mensal"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.valor_mensal}
                      onChange={(e) => setFormData({ ...formData, valor_mensal: e.target.value })}
                      className="col-span-3"
                      placeholder="0.00"
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

      {/* Custos Fixos Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Valor Mensal (R$)</TableHead>
              <TableHead>Status</TableHead>
              {canModify && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={canModify ? 4 : 3} className="text-center py-8">
                  Carregando custos fixos...
                </TableCell>
              </TableRow>
            ) : custos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canModify ? 4 : 3} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <DollarSign className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">Nenhum custo fixo cadastrado</p>
                    {canModify && (
                      <p className="text-sm text-muted-foreground">
                        Clique em "Novo Custo Fixo" para começar
                      </p>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              custos.map((custo) => (
                <TableRow key={custo.id}>
                  <TableCell className="font-medium">{custo.nome}</TableCell>
                  <TableCell>R$ {custo.valor_mensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell>
                    <Badge variant={custo.ativo ? "default" : "secondary"}>
                      {custo.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  {canModify && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {canUpdate("custos_fixos") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(custo)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {canDelete("custos_fixos") && (
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