import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Save, FileText, Calculator, Plus, BarChart3, Download, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function Simulations() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast: toastHook } = useToast();
  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSimulations();
    }
  }, [user]);

  const fetchSimulations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("simulacoes")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSimulations(data || []);
    } catch (error) {
      console.error("Error fetching simulations:", error);
      toast.error("❌ Erro ao carregar simulações. Verifique sua conexão ou se você já criou simulações no sistema.");
    }
    setLoading(false);
  };

  const runSimulation = async (simulationId: string) => {
    try {
      const { error } = await supabase.functions.invoke('rodar-simulacao', {
        body: { simulacao_id: simulationId }
      });

      if (error) throw error;
      toast.success("Simulação executada com sucesso!");
      fetchSimulations(); // Atualizar dados
    } catch (error) {
      console.error("Error running simulation:", error);
      toast.error("❌ Erro ao executar simulação. Verifique se a viagem base ainda existe e se todos os parâmetros estão válidos. Tente novamente.");
    }
  };

  const getStatusColor = (hasResults: boolean) => {
    return hasResults 
      ? 'bg-green-500/10 text-green-700 border-green-200'
      : 'bg-gray-500/10 text-gray-700 border-gray-200';
  };

  const getStatusText = (hasResults: boolean) => {
    return hasResults ? 'Concluída' : 'Pendente';
  };

  const formatCurrency = (value: number | null) => {
    if (value === null) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const deleteSimulation = async (simulationId: string) => {
    try {
      const { error } = await supabase
        .from("simulacoes")
        .delete()
        .eq("id", simulationId)
        .eq("user_id", user?.id);

      if (error) throw error;
      toast.success("Simulação excluída com sucesso!");
      fetchSimulations(); // Atualizar dados
    } catch (error) {
      console.error("Error deleting simulation:", error);
      toast.error("❌ Erro ao excluir simulação. Ela pode estar em uso em comparações ou relatórios. Tente novamente mais tarde.");
    }
  };

  const exportToCSV = () => {
    if (simulations.length === 0) {
      toastHook({
        title: "Nenhum dado",
        description: "Não há simulações para exportar.",
        variant: "destructive",
      });
      return;
    }

    const headers = ['Cenário', 'Data Criação', 'Custo Total', 'Custo/Entrega', 'Tempo (h)', 'Status'];
    const rows = simulations.map((sim: any) => [
      sim.nome_cenario,
      new Date(sim.created_at).toLocaleDateString('pt-BR'),
      sim.custo_total || '',
      sim.custo_por_entrega || '',
      sim.tempo_estimado_h || '',
      sim.custo_total !== null ? 'Concluída' : 'Pendente'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `simulacoes_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toastHook({
      title: "Exportado com sucesso",
      description: "Arquivo CSV baixado.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Simulações</h1>
          <p className="text-muted-foreground">
            Crie e execute simulações de transporte e custos
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          <Button className="gap-2" onClick={() => navigate("/simulations/create")}>
            <Plus className="h-4 w-4" />
            Nova Simulação
          </Button>
        </div>
      </div>

      {/* Simulação Rápida */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/simulations/create")}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Nova Simulação</CardTitle>
            </div>
            <CardDescription>
              Crie um cenário "E se?" baseado em uma viagem existente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Criar Simulação
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Simulações Salvas */}
      <Card>
        <CardHeader>
          <CardTitle>Simulações Salvas</CardTitle>
          <CardDescription>
            Histórico das suas simulações realizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Carregando simulações...</div>
          ) : simulations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Nenhuma simulação encontrada</p>
              <Button onClick={() => navigate("/simulations/create")}>
                <Plus className="h-4 w-4 mr-2" />
                Criar primeira simulação
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {simulations.map((simulation: any) => (
                <div
                  key={simulation.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{simulation.nome_cenario}</h3>
                      <Badge className={getStatusColor(simulation.custo_total !== null)}>
                        {getStatusText(simulation.custo_total !== null)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Criada em {new Date(simulation.created_at).toLocaleDateString('pt-BR')}
                    </p>
                    {simulation.custo_total !== null && (
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>Custo Total: {formatCurrency(simulation.custo_total)}</span>
                        <span>Custo/Entrega: {formatCurrency(simulation.custo_por_entrega)}</span>
                        {simulation.tempo_estimado_h && (
                          <span>Tempo: {simulation.tempo_estimado_h.toFixed(1)}h</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {simulation.custo_total !== null ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/simulations/compare/${simulation.id}`)}
                      >
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => runSimulation(simulation.id)}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => runSimulation(simulation.id)}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => deleteSimulation(simulation.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}