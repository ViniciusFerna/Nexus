import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Package, Plus, Edit, Trash2 } from "lucide-react";

interface Cargo {
  id: string;
  name: string;
  weight: number;
  value: number;
  description?: string;
  type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function Cargo() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCargo, setEditingCargo] = useState<Cargo | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    weight: "",
    value: "",
    description: "",
    type: "general",
    status: "active"
  });

  // Buscar dados de carga
  const { data: cargo = [], isLoading } = useQuery({
    queryKey: ["cargo"],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("cargo")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Cargo[];
    },
    enabled: !!user?.id,
  });

  // Create cargo mutation
  const createCargo = useMutation({
    mutationFn: async (newCargo: Omit<Cargo, "id" | "created_at" | "updated_at">) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from("cargo")
        .insert([{ ...newCargo, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cargo"] });
      toast({
        title: "Carga criada",
        description: "A carga foi cadastrada com sucesso.",
      });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar carga",
        description: "Ocorreu um erro ao cadastrar a carga.",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  // Update cargo mutation
  const updateCargo = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Cargo> & { id: string }) => {
      const { data, error } = await supabase
        .from("cargo")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cargo"] });
      toast({
        title: "Carga atualizada",
        description: "A carga foi atualizada com sucesso.",
      });
      resetForm();
      setIsDialogOpen(false);
      setEditingCargo(null);
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar carga",
        description: "Ocorreu um erro ao atualizar a carga.",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  // Delete cargo mutation
  const deleteCargo = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("cargo")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cargo"] });
      toast({
        title: "Carga excluída",
        description: "A carga foi excluída com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir carga",
        description: "Ocorreu um erro ao excluir a carga.",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      weight: "",
      value: "",
      description: "",
      type: "general",
      status: "active"
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.weight) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o nome e o peso da carga.",
        variant: "destructive",
      });
      return;
    }

    const cargoData = {
      name: formData.name,
      weight: parseFloat(formData.weight),
      value: parseFloat(formData.value) || 0,
      description: formData.description,
      type: formData.type,
      status: formData.status,
    };

    if (editingCargo) {
      updateCargo.mutate({ id: editingCargo.id, ...cargoData });
    } else {
      createCargo.mutate(cargoData);
    }
  };

  const handleEdit = (cargo: Cargo) => {
    setEditingCargo(cargo);
    setFormData({
      name: cargo.name,
      weight: cargo.weight.toString(),
      value: cargo.value.toString(),
      description: cargo.description || "",
      type: cargo.type,
      status: cargo.status
    });
    setIsDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingCargo(null);
      resetForm();
    }
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      general: "Geral",
      fragile: "Frágil", 
      perishable: "Perecível",
      hazardous: "Perigosa",
      refrigerated: "Refrigerada"
    };
    return types[type] || type;
  };

  const getStatusColor = (status: string) => {
    return status === "active" ? "default" : "secondary";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Cargas</h1>
          <p className="text-muted-foreground">
            Gerencie as cargas para suas simulações de transporte.
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Carga
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingCargo ? "Editar Carga" : "Nova Carga"}
                </DialogTitle>
                <DialogDescription>
                  {editingCargo 
                    ? "Atualize as informações da carga." 
                    : "Preencha os dados para cadastrar uma nova carga."
                  }
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nome *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="col-span-3"
                    placeholder="Ex: Eletrônicos"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="weight" className="text-right">
                    Peso (kg) *
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="col-span-3"
                    placeholder="0.00"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="value" className="text-right">
                    Valor (R$)
                  </Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="col-span-3"
                    placeholder="0.00"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    Tipo
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">Geral</SelectItem>
                      <SelectItem value="fragile">Frágil</SelectItem>
                      <SelectItem value="perishable">Perecível</SelectItem>
                      <SelectItem value="hazardous">Perigosa</SelectItem>
                      <SelectItem value="refrigerated">Refrigerada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Status
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="description" className="text-right pt-2">
                    Descrição
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="col-span-3"
                    placeholder="Informações adicionais sobre a carga..."
                    rows={3}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingCargo ? "Atualizar" : "Cadastrar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cargo Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Peso (kg)</TableHead>
              <TableHead>Valor (R$)</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Carregando cargas...
                </TableCell>
              </TableRow>
            ) : cargo.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <Package className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">Nenhuma carga cadastrada</p>
                    <p className="text-sm text-muted-foreground">
                      Clique em "Nova Carga" para começar
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              cargo.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{Number(item.weight || 0).toLocaleString('pt-BR')} kg</TableCell>
                  <TableCell>R$ {Number(item.value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell>{getTypeLabel(item.type)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(item.status)}>
                      {item.status === "active" ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {item.description || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteCargo.mutate(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}