import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";

interface Simulation {
  id: string;
  nome_cenario: string;
  custo_total: number;
  custo_por_entrega: number;
  custo_por_tonelada_km: number;
  margem: number;
  consumo_combustivel_l: number;
  custo_combustivel: number;
  custo_variaveis: number;
  custo_pedagios: number;
  custo_fixo_rateado: number;
  tempo_estimado_h: number;
  created_at: string;
}

interface BaseTrip {
  id: string;
  custo_total_estimado: number;
  consumo_combustivel_l: number;
  custo_combustivel: number;
  custo_variaveis: number;
  custo_pedagios: number;
  custo_fixo_rateado: number;
  tempo_estimado_h: number;
  receita: number;
  routes: {
    origem: string;
    destino: string;
    distancia_km: number;
  };
  vehicles: {
    tipo: string;
  };
}

export default function SimulationCompare() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [simulation, setSimulation] = useState<Simulation | null>(null);
  const [baseTrip, setBaseTrip] = useState<BaseTrip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && id) {
      fetchSimulationData();
    }
  }, [user, id]);

  const fetchSimulationData = async () => {
    try {
      // Fetch simulation data
      const { data: simData, error: simError } = await supabase
        .from("simulacoes")
        .select("*")
        .eq("id", id)
        .eq("user_id", user?.id)
        .single();

      if (simError) throw simError;
      setSimulation(simData);

      // Fetch base trip data (don't filter by user_id since trip may belong to another user)
      const { data: tripData, error: tripError } = await supabase
        .from("trips")
        .select("*")
        .eq("id", simData.viagem_base_id)
        .single();

      if (tripError) throw tripError;

      // Fetch related route and vehicle data
      const [routeResult, vehicleResult] = await Promise.all([
        supabase.from("routes").select("origem, destino, distancia_km").eq("id", tripData.route_id).single(),
        supabase.from("vehicles").select("tipo").eq("id", tripData.vehicle_id).single()
      ]);

      const tripWithRelations = {
        ...tripData,
        routes: routeResult.data || { origem: "", destino: "", distancia_km: 0 },
        vehicles: vehicleResult.data || { tipo: "" }
      };

      setBaseTrip(tripWithRelations);

      if (tripError) throw tripError;
      setBaseTrip(tripWithRelations);
    } catch (error) {
      console.error("Error fetching simulation data:", error);
      toast.error("Erro ao carregar dados da simulação");
      navigate("/simulations");
    }
    setLoading(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatHours = (hours: number) => {
    return `${hours.toFixed(1)}h`;
  };

  const formatLiters = (liters: number) => {
    return `${liters.toFixed(1)}L`;
  };

  const getDifference = (simValue: number, baseValue: number) => {
    const diff = simValue - baseValue;
    const percentage = baseValue !== 0 ? (diff / baseValue) * 100 : 0;
    return { diff, percentage };
  };

  const DifferenceIndicator = ({ simValue, baseValue, format = formatCurrency }: {
    simValue: number;
    baseValue: number;
    format?: (value: number) => string;
  }) => {
    const { diff, percentage } = getDifference(simValue, baseValue);
    const isPositive = diff > 0;
    const isNegative = diff < 0;

    return (
      <div className="flex items-center gap-2">
        {isPositive && (
          <>
            <TrendingUp className="h-4 w-4 text-red-500" />
            <span className="text-red-500 text-sm">+{format(Math.abs(diff))} (+{percentage.toFixed(1)}%)</span>
          </>
        )}
        {isNegative && (
          <>
            <TrendingDown className="h-4 w-4 text-green-500" />
            <span className="text-green-500 text-sm">-{format(Math.abs(diff))} ({percentage.toFixed(1)}%)</span>
          </>
        )}
        {diff === 0 && (
          <span className="text-muted-foreground text-sm">Igual</span>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Carregando comparação...</div>
      </div>
    );
  }

  if (!simulation || !baseTrip) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Dados não encontrados</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate("/simulations")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Comparação de Simulação</h1>
          <p className="text-muted-foreground">
            {baseTrip.routes?.origem} → {baseTrip.routes?.destino} • {simulation.nome_cenario}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Base Trip */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Viagem Base
              <Badge variant="outline">Original</Badge>
            </CardTitle>
            <CardDescription>
              {baseTrip.routes?.origem} → {baseTrip.routes?.destino} • {baseTrip.vehicles?.tipo}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Custo Total:</span>
                <span className="font-medium">{formatCurrency(baseTrip.custo_total_estimado || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Combustível:</span>
                <span>{formatCurrency(baseTrip.custo_combustivel || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Custos Variáveis:</span>
                <span>{formatCurrency(baseTrip.custo_variaveis || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pedágios:</span>
                <span>{formatCurrency(baseTrip.custo_pedagios || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Custo Fixo:</span>
                <span>{formatCurrency(baseTrip.custo_fixo_rateado || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Consumo:</span>
                <span>{formatLiters(baseTrip.consumo_combustivel_l || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tempo:</span>
                <span>{formatHours(baseTrip.tempo_estimado_h || 0)}</span>
              </div>
              {baseTrip.receita > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Margem:</span>
                  <span>{(((baseTrip.receita - (baseTrip.custo_total_estimado || 0)) / baseTrip.receita) * 100).toFixed(1)}%</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Simulation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Simulação
              <Badge>Cenário</Badge>
            </CardTitle>
            <CardDescription>
              {simulation.nome_cenario}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Custo Total:</span>
                <div className="text-right">
                  <div className="font-medium">{formatCurrency(simulation.custo_total || 0)}</div>
                  <DifferenceIndicator 
                    simValue={simulation.custo_total || 0} 
                    baseValue={baseTrip.custo_total_estimado || 0} 
                  />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Combustível:</span>
                <div className="text-right">
                  <div>{formatCurrency(simulation.custo_combustivel || 0)}</div>
                  <DifferenceIndicator 
                    simValue={simulation.custo_combustivel || 0} 
                    baseValue={baseTrip.custo_combustivel || 0} 
                  />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Custos Variáveis:</span>
                <div className="text-right">
                  <div>{formatCurrency(simulation.custo_variaveis || 0)}</div>
                  <DifferenceIndicator 
                    simValue={simulation.custo_variaveis || 0} 
                    baseValue={baseTrip.custo_variaveis || 0} 
                  />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Pedágios:</span>
                <div className="text-right">
                  <div>{formatCurrency(simulation.custo_pedagios || 0)}</div>
                  <DifferenceIndicator 
                    simValue={simulation.custo_pedagios || 0} 
                    baseValue={baseTrip.custo_pedagios || 0} 
                  />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Custo Fixo:</span>
                <div className="text-right">
                  <div>{formatCurrency(simulation.custo_fixo_rateado || 0)}</div>
                  <DifferenceIndicator 
                    simValue={simulation.custo_fixo_rateado || 0} 
                    baseValue={baseTrip.custo_fixo_rateado || 0} 
                  />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Consumo:</span>
                <div className="text-right">
                  <div>{formatLiters(simulation.consumo_combustivel_l || 0)}</div>
                  <DifferenceIndicator 
                    simValue={simulation.consumo_combustivel_l || 0} 
                    baseValue={baseTrip.consumo_combustivel_l || 0}
                    format={formatLiters}
                  />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Tempo:</span>
                <div className="text-right">
                  <div>{formatHours(simulation.tempo_estimado_h || 0)}</div>
                  <DifferenceIndicator 
                    simValue={simulation.tempo_estimado_h || 0} 
                    baseValue={baseTrip.tempo_estimado_h || 0}
                    format={formatHours}
                  />
                </div>
              </div>
              {simulation.margem !== null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Margem:</span>
                  <span>{simulation.margem?.toFixed(1)}%</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo da Comparação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-500">
                {formatCurrency(Math.abs((simulation.custo_total || 0) - (baseTrip.custo_total_estimado || 0)))}
              </div>
              <div className="text-sm text-muted-foreground">
                {(simulation.custo_total || 0) > (baseTrip.custo_total_estimado || 0) ? 'Mais caro' : 'Mais barato'}
              </div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">
                {((((simulation.custo_total || 0) - (baseTrip.custo_total_estimado || 0)) / (baseTrip.custo_total_estimado || 1)) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Diferença percentual</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">
                {formatLiters(Math.abs((simulation.consumo_combustivel_l || 0) - (baseTrip.consumo_combustivel_l || 0)))}
              </div>
              <div className="text-sm text-muted-foreground">
                Diferença no consumo
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}