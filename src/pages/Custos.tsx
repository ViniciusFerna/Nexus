import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, DollarSign, TrendingUp, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Save, Plus, Edit, Trash2 } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

interface ParametroGlobal {
  id: string;
  user_id: string;
  preco_diesel_litro: number;
  velocidade_media_kmh: number;
  moeda: string;
  created_at: string;
  updated_at: string;
}

interface CustoFixo {
  id: string;
  user_id: string;
  nome: string;
  valor_mensal: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

interface CustoVariavel {
  id: string;
  user_id: string;
  nome: string;
  valor_por_km: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

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

export default function Custos() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Gerenciar Custos</h1>
        <p className="text-muted-foreground">
          Configure todos os custos e parâmetros utilizados nos cálculos de transporte
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="parametros" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="parametros" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Parâmetros
          </TabsTrigger>
          <TabsTrigger value="fixos" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Custos Fixos
          </TabsTrigger>
          <TabsTrigger value="variaveis" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Custos Variáveis
          </TabsTrigger>
          <TabsTrigger value="pedagios" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Pedágios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="parametros">
          <ParametrosTab />
        </TabsContent>

        <TabsContent value="fixos">
          <CustosFixosTab />
        </TabsContent>

        <TabsContent value="variaveis">
          <CustosVariaveisTab />
        </TabsContent>

        <TabsContent value="pedagios">
          <PedagiosTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Parâmetros Tab Component
function ParametrosTab() {
  const { user } = useAuth();
  const { canUpdate } = useRole();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    preco_diesel_litro: "",
    velocidade_media_kmh: "",
    moeda: "R$",
  });
  const [hasChanges, setHasChanges] = useState(false);

  const { data: parametros, isLoading } = useQuery({
    queryKey: ["parametros_globais"],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("parametros_globais")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as ParametroGlobal | null;
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (parametros) {
      setFormData({
        preco_diesel_litro: parametros.preco_diesel_litro.toString(),
        velocidade_media_kmh: parametros.velocidade_media_kmh.toString(),
        moeda: parametros.moeda,
      });
    }
  }, [parametros]);

  const saveParametrosMutation = useMutation({
    mutationFn: async (data: { preco_diesel_litro: number; velocidade_media_kmh: number; moeda: string }) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      if (parametros) {
        const { data: result, error } = await supabase
          .from("parametros_globais")
          .update(data)
          .eq("id", parametros.id)
          .select()
          .single();
        
        if (error) throw error;
        return result;
      } else {
        const { data: result, error } = await supabase
          .from("parametros_globais")
          .insert([{ ...data, user_id: user.id }])
          .select()
          .single();
        
        if (error) throw error;
        return result;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parametros_globais"] });
      setHasChanges(false);
      toast({
        title: "Parâmetros salvos",
        description: "Os parâmetros globais foram salvos com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao salvar parâmetros",
        description: "Ocorreu um erro ao salvar os parâmetros globais.",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.preco_diesel_litro || !formData.velocidade_media_kmh || !formData.moeda) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    const data = {
      preco_diesel_litro: parseFloat(formData.preco_diesel_litro),
      velocidade_media_kmh: parseFloat(formData.velocidade_media_kmh),
      moeda: formData.moeda,
    };

    saveParametrosMutation.mutate(data);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const canModify = canUpdate("parametros_globais");

  if (isLoading) {
    return <div className="flex items-center justify-center py-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Parâmetros Globais</CardTitle>
          <CardDescription>
            Configure os parâmetros utilizados em todos os cálculos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="preco_diesel_litro">
                Preço do Diesel por Litro ({formData.moeda}) *
              </Label>
              <Input
                id="preco_diesel_litro"
                type="number"
                step="0.01"
                min="0"
                value={formData.preco_diesel_litro}
                onChange={(e) => handleInputChange("preco_diesel_litro", e.target.value)}
                placeholder="5.50"
                disabled={!canModify}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="velocidade_media_kmh">
                Velocidade Média (km/h) *
              </Label>
              <Input
                id="velocidade_media_kmh"
                type="number"
                step="1"
                min="1"
                max="120"
                value={formData.velocidade_media_kmh}
                onChange={(e) => handleInputChange("velocidade_media_kmh", e.target.value)}
                placeholder="60"
                disabled={!canModify}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="moeda">Moeda *</Label>
              <Input
                id="moeda"
                type="text"
                value={formData.moeda}
                onChange={(e) => handleInputChange("moeda", e.target.value)}
                placeholder="R$"
                disabled={!canModify}
              />
            </div>

            {canModify && (
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={!hasChanges || saveParametrosMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saveParametrosMutation.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {parametros && (
        <Card>
          <CardHeader>
            <CardTitle>Valores Atuais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {parametros.moeda} {parametros.preco_diesel_litro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-sm text-muted-foreground">Preço do Diesel/L</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {parametros.velocidade_media_kmh} km/h
                </div>
                <div className="text-sm text-muted-foreground">Velocidade Média</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {parametros.moeda}
                </div>
                <div className="text-sm text-muted-foreground">Moeda</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Custos Fixos Tab Component
function CustosFixosTab() {
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

  const createCustoMutation = useMutation({
    mutationFn: async (newCusto: Omit<CustoFixo, "id" | "created_at" | "updated_at" | "user_id">) => {
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
      toast({ title: "Custo fixo criado com sucesso" });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Erro ao criar custo fixo", variant: "destructive" });
    },
  });

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
      toast({ title: "Custo fixo atualizado com sucesso" });
      resetForm();
      setIsDialogOpen(false);
      setEditingCusto(null);
    },
    onError: () => {
      toast({ title: "Erro ao atualizar custo fixo", variant: "destructive" });
    },
  });

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
      toast({ title: "Custo fixo excluído com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao excluir custo fixo", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({ nome: "", valor_mensal: "", ativo: true });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.valor_mensal) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
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

  const canModify = canCreate("custos_fixos") || canUpdate("custos_fixos");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Custos Fixos Mensais</h3>
          <p className="text-sm text-muted-foreground">Gerencie os custos fixos do negócio</p>
        </div>
        {canModify && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Custo Fixo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>{editingCusto ? "Editar" : "Novo"} Custo Fixo</DialogTitle>
                  <DialogDescription>
                    Preencha as informações do custo fixo mensal
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      placeholder="Ex: Seguro do veículo"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="valor_mensal">Valor Mensal (R$) *</Label>
                    <Input
                      id="valor_mensal"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.valor_mensal}
                      onChange={(e) => setFormData({ ...formData, valor_mensal: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="ativo"
                      checked={formData.ativo}
                      onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
                    />
                    <Label htmlFor="ativo">Ativo</Label>
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

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Valor Mensal</TableHead>
              <TableHead>Status</TableHead>
              {canModify && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={canModify ? 4 : 3} className="text-center py-8">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : custos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canModify ? 4 : 3} className="text-center py-8">
                  <DollarSign className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Nenhum custo fixo cadastrado</p>
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
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(custo)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {canDelete("custos_fixos") && (
                          <Button variant="ghost" size="sm" onClick={() => deleteCustoMutation.mutate(custo.id)}>
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

// Custos Variáveis Tab Component
function CustosVariaveisTab() {
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

  const createCustoMutation = useMutation({
    mutationFn: async (newCusto: Omit<CustoVariavel, "id" | "created_at" | "updated_at" | "user_id">) => {
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
      toast({ title: "Custo variável criado com sucesso" });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Erro ao criar custo variável", variant: "destructive" });
    },
  });

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
      toast({ title: "Custo variável atualizado com sucesso" });
      resetForm();
      setIsDialogOpen(false);
      setEditingCusto(null);
    },
    onError: () => {
      toast({ title: "Erro ao atualizar custo variável", variant: "destructive" });
    },
  });

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
      toast({ title: "Custo variável excluído com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao excluir custo variável", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({ nome: "", valor_por_km: "", ativo: true });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.valor_por_km) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
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

  const canModify = canCreate("custos_variaveis") || canUpdate("custos_variaveis");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Custos Variáveis por Km</h3>
          <p className="text-sm text-muted-foreground">Gerencie os custos variáveis por quilômetro</p>
        </div>
        {canModify && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Custo Variável
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>{editingCusto ? "Editar" : "Novo"} Custo Variável</DialogTitle>
                  <DialogDescription>
                    Preencha as informações do custo variável
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      placeholder="Ex: Manutenção"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="valor_por_km">Valor por Km (R$) *</Label>
                    <Input
                      id="valor_por_km"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.valor_por_km}
                      onChange={(e) => setFormData({ ...formData, valor_por_km: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="ativo"
                      checked={formData.ativo}
                      onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
                    />
                    <Label htmlFor="ativo">Ativo</Label>
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

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Valor por Km</TableHead>
              <TableHead>Status</TableHead>
              {canModify && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={canModify ? 4 : 3} className="text-center py-8">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : custos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canModify ? 4 : 3} className="text-center py-8">
                  <TrendingUp className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Nenhum custo variável cadastrado</p>
                </TableCell>
              </TableRow>
            ) : (
              custos.map((custo) => (
                <TableRow key={custo.id}>
                  <TableCell className="font-medium">{custo.nome}</TableCell>
                  <TableCell>R$ {custo.valor_por_km.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/km</TableCell>
                  <TableCell>
                    <Badge variant={custo.ativo ? "default" : "secondary"}>
                      {custo.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  {canModify && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {canUpdate("custos_variaveis") && (
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(custo)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {canDelete("custos_variaveis") && (
                          <Button variant="ghost" size="sm" onClick={() => deleteCustoMutation.mutate(custo.id)}>
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

// Pedágios Tab Component
function PedagiosTab() {
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
      toast({ title: "Pedágio criado com sucesso" });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Erro ao criar pedágio", variant: "destructive" });
    },
  });

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
      toast({ title: "Pedágio atualizado com sucesso" });
      resetForm();
      setIsDialogOpen(false);
      setEditingPedagio(null);
    },
    onError: () => {
      toast({ title: "Erro ao atualizar pedágio", variant: "destructive" });
    },
  });

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
      toast({ title: "Pedágio excluído com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao excluir pedágio", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({ rota_id: "", descricao: "", valor: "" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.rota_id || !formData.descricao || !formData.valor) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
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

  const getRouteName = (routeId: string) => {
    const route = routes.find(r => r.id === routeId);
    return route ? `${route.origem} → ${route.destino}` : 'Rota não encontrada';
  };

  const canModify = canCreate("pedagios") || canUpdate("pedagios");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Pedágios por Rota</h3>
          <p className="text-sm text-muted-foreground">Gerencie os pedágios associados às rotas</p>
        </div>
        {canModify && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Pedágio
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>{editingPedagio ? "Editar" : "Novo"} Pedágio</DialogTitle>
                  <DialogDescription>
                    Preencha as informações do pedágio
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="rota_id">Rota *</Label>
                    <Select
                      value={formData.rota_id}
                      onValueChange={(value) => setFormData({ ...formData, rota_id: value })}
                    >
                      <SelectTrigger>
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
                  
                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição *</Label>
                    <Input
                      id="descricao"
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      placeholder="Ex: Pedágio BR-101 Km 150"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="valor">Valor (R$) *</Label>
                    <Input
                      id="valor"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.valor}
                      onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
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

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rota</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Valor</TableHead>
              {canModify && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={canModify ? 4 : 3} className="text-center py-8">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : pedagios.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canModify ? 4 : 3} className="text-center py-8">
                  <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Nenhum pedágio cadastrado</p>
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
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(pedagio)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {canDelete("pedagios") && (
                          <Button variant="ghost" size="sm" onClick={() => deletePedagioMutation.mutate(pedagio.id)}>
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
