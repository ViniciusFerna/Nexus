import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft,
  Calendar, 
  MapPin, 
  Truck,
  Weight,
  Package,
  FileText,
  CheckCircle2,
  Clock,
  PlayCircle,
  Calculator,
  Fuel,
  RefreshCw
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FormulaCard } from "@/components/FormulaCard";
import { FreightPriceCalculator } from "@/components/FreightPriceCalculator";

interface Trip {
  id: string;
  user_id: string;
  vehicle_id: string;
  route_id: string;
  start_date: string;
  end_date: string;
  status: 'Planejada' | 'Em_Andamento' | 'Concluída';
  peso_ton?: number;
  volume_m3?: number;
  receita?: number;
  observacoes?: string;
  consumo_combustivel_l?: number;
  custo_combustivel?: number;
  custo_variaveis?: number;
  custo_pedagios?: number;
  custo_fixo_rateado?: number;
  custo_extra?: number;
  custo_extra_descricao?: string;
  custo_total_estimado?: number;
  tempo_estimado_h?: number;
  created_at: string;
  updated_at: string;
}

interface Vehicle {
  id: string;
  tipo: string;
  capacidade_ton: number;
  status: string;
}

interface Route {
  id: string;
  origem: string;
  destino: string;
  distancia_km: number;
  tempo_estimado_h: number;
}

interface VehicleCost {
  id: string;
  nome: string;
  valor_mensal: number;
  ativo: boolean;
}

export default function ViagemDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar detalhes da viagem
  const { data: trip, isLoading } = useQuery({
    queryKey: ["trip", id],
    queryFn: async () => {
      if (!user?.id || !id) return null;
      const { data, error } = await supabase
        .from("trips")
        .select(`
          *,
          consumo_combustivel_l,
          custo_combustivel,
          custo_variaveis,
          custo_pedagios,
          custo_fixo_rateado,
          custo_extra,
          custo_total_estimado,
          tempo_estimado_h
        `)
        .eq("id", id)
        .eq("user_id", user.id)
        .single();
      
      if (error) throw error;
      return data as Trip;
    },
    enabled: !!user?.id && !!id,
  });

  // Buscar detalhes do veículo
  const { data: vehicle } = useQuery({
    queryKey: ["vehicle", trip?.vehicle_id],
    queryFn: async () => {
      if (!trip?.vehicle_id) return null;
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("id", trip.vehicle_id)
        .single();
      
      if (error) throw error;
      return data as Vehicle;
    },
    enabled: !!trip?.vehicle_id,
  });

  // Buscar detalhes da rota
  const { data: route } = useQuery({
    queryKey: ["route", trip?.route_id],
    queryFn: async () => {
      if (!trip?.route_id) return null;
      const { data, error } = await supabase
        .from("routes")
        .select("*")
        .eq("id", trip.route_id)
        .single();
      
      if (error) throw error;
      return data as Route;
    },
    enabled: !!trip?.route_id,
  });

  // Buscar custos do veículo
  const { data: vehicleCosts } = useQuery({
    queryKey: ["vehicle-costs", trip?.vehicle_id],
    queryFn: async () => {
      if (!trip?.vehicle_id || !user?.id) return [];
      const { data, error } = await supabase
        .from("custos_veiculo")
        .select("*")
        .eq("veiculo_id", trip.vehicle_id)
        .eq("user_id", user.id)
        .eq("ativo", true);
      
      if (error) throw error;
      return data as VehicleCost[];
    },
    enabled: !!trip?.vehicle_id && !!user?.id,
  });

  // Buscar detalhes da carga
  const { data: cargoDetails } = useQuery({
    queryKey: ["cargo", (trip as any)?.cargo_id],
    queryFn: async () => {
      if (!(trip as any)?.cargo_id) return null;
      const { data, error } = await supabase
        .from("cargo")
        .select("*")
        .eq("id", (trip as any).cargo_id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!(trip as any)?.cargo_id,
  });

  // Mutation para recalcular custos
  const recalculateMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error('ID da viagem não encontrado');
      
      const { data, error } = await supabase.functions.invoke('recalcular-custos-viagem', {
        body: { viagemId: id }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trip", id] });
      toast({
        title: "Sucesso",
        description: "Cálculos operacionais atualizados com sucesso!"
      });
    },
    onError: (error: any) => {
      console.error('Erro ao recalcular custos:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao recalcular custos da viagem",
        variant: "destructive"
      });
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Planejada':
        return <Clock className="h-4 w-4" />;
      case 'Em_Andamento':
        return <PlayCircle className="h-4 w-4" />;
      case 'Concluída':
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Planejada':
        return 'secondary' as const;
      case 'Em_Andamento':
        return 'default' as const;
      case 'Concluída':
        return 'outline' as const;
      default:
        return 'secondary' as const;
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  if (!trip) {
    return <div className="text-center p-8">
      <h2 className="text-2xl font-bold text-muted-foreground">Viagem não encontrada</h2>
    </div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/viagens')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-foreground">Detalhes da Viagem</h1>
            <p className="text-muted-foreground">
              Informações completas da viagem selecionada
            </p>
          </div>
        </div>
        <Badge variant={getStatusVariant(trip.status)} className="flex items-center space-x-2 px-4 py-2">
          {getStatusIcon(trip.status)}
          <span className="text-sm">{trip.status}</span>
        </Badge>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Custo Total</p>
                <p className="text-2xl font-bold text-primary">
                  R$ {trip.custo_total_estimado?.toFixed(2) || '0.00'}
                </p>
              </div>
              <Calculator className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tempo Estimado</p>
                <p className="text-2xl font-bold">
                  {trip.tempo_estimado_h?.toFixed(1) || '0.0'}h
                </p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Distância</p>
                <p className="text-2xl font-bold">
                  {route?.distancia_km || '0'} km
                </p>
              </div>
              <MapPin className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Trip Details */}
        <div className="space-y-6 lg:col-span-1">
          {/* Trip Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Informações da Viagem</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Data de Início</span>
                <p className="text-base font-medium">
                  {format(new Date(trip.start_date), "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </div>
              
              <Separator />
              
              <div>
                <span className="text-sm font-medium text-muted-foreground">Data de Término</span>
                <p className="text-base font-medium">
                  {format(new Date(trip.end_date), "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </div>

              {(trip.peso_ton || trip.volume_m3) && (
                <>
                  <Separator />
                  
                  {trip.peso_ton && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Weight className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">Peso</span>
                      </div>
                      <span className="font-medium">{trip.peso_ton} ton</span>
                    </div>
                  )}

                  {trip.volume_m3 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">Volume</span>
                      </div>
                      <span className="font-medium">{trip.volume_m3} m³</span>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Vehicle Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Truck className="h-5 w-5" />
                <span>Veículo</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {vehicle ? (
                <>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Tipo</span>
                    <p className="text-base font-medium">{vehicle.tipo}</p>
                  </div>
                  <Separator />
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Capacidade</span>
                    <p className="text-base font-medium">{vehicle.capacidade_ton} toneladas</p>
                  </div>
                  <Separator />
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Status</span>
                    <p className="text-base font-medium">{vehicle.status}</p>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">Carregando...</p>
              )}
            </CardContent>
          </Card>

          {/* Route Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Rota</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {route ? (
                <>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Origem</span>
                    <p className="text-base font-medium">{route.origem}</p>
                  </div>
                  <Separator />
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Destino</span>
                    <p className="text-base font-medium">{route.destino}</p>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Distância</span>
                    <span className="font-medium">{route.distancia_km} km</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Tempo Previsto</span>
                    <span className="font-medium">{route.tempo_estimado_h}h</span>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">Carregando...</p>
              )}
            </CardContent>
          </Card>

          {/* Cargo Information */}
          {cargoDetails && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>Carga</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Nome</span>
                  <p className="text-base font-medium">{cargoDetails.name}</p>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Peso</span>
                  <span className="font-medium">{cargoDetails.weight} kg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Tipo</span>
                  <span className="font-medium capitalize">{cargoDetails.type}</span>
                </div>
                {cargoDetails.value > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Valor</span>
                    <span className="font-medium">R$ {cargoDetails.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                {cargoDetails.description && (
                  <>
                    <Separator />
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Descrição</span>
                      <p className="text-sm mt-1">{cargoDetails.description}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Operational Calculations */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Calculator className="h-5 w-5" />
                  <span>Cálculos Operacionais</span>
                </CardTitle>
                <CardDescription className="mt-2">
                  Custos operacionais calculados automaticamente
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => recalculateMutation.mutate()}
                disabled={recalculateMutation.isPending}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${recalculateMutation.isPending ? 'animate-spin' : ''}`} />
                <span>Recalcular</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Fuel Section */}
              <div className="space-y-3 p-4 rounded-lg bg-muted/30">
                <div className="flex items-center space-x-2 text-sm font-medium">
                  <Fuel className="h-5 w-5 text-primary" />
                  <span>Combustível</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Consumo</span>
                    <span className="font-medium">{trip.consumo_combustivel_l?.toFixed(2) || '0.00'} L</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Custo</span>
                    <span className="text-lg font-bold text-primary">
                      R$ {trip.custo_combustivel?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tolls Section */}
              <div className="space-y-3 p-4 rounded-lg bg-muted/30">
                <div className="flex items-center space-x-2 text-sm font-medium">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>Pedágios</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="text-lg font-bold text-primary">
                    R$ {trip.custo_pedagios?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>

              {/* Vehicle Costs Section */}
              <div className="space-y-3 p-4 rounded-lg bg-muted/30">
                <div className="flex items-center space-x-2 text-sm font-medium">
                  <Truck className="h-5 w-5 text-primary" />
                  <span>Custos do Veículo</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm text-muted-foreground">Rateio Diário</span>
                  <span className="text-lg font-bold text-primary">
                    R$ {trip.custo_fixo_rateado?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>

                {/* Extra Cost Section */}
              {trip.custo_extra && trip.custo_extra > 0 && (
                <div className="space-y-3 p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center space-x-2 text-sm font-medium">
                    <Calculator className="h-5 w-5 text-primary" />
                    <span>Custo Extra</span>
                  </div>
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Adicional</span>
                      <span className="text-lg font-bold text-primary">
                        R$ {trip.custo_extra?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                    {trip.custo_extra_descricao && (
                      <p className="text-sm text-muted-foreground italic pt-1 border-t border-border">
                        {trip.custo_extra_descricao}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Total Cost Section */}
              <div className="space-y-3 p-4 rounded-lg bg-primary/10 border-2 border-primary">
                <div className="flex items-center space-x-2 text-sm font-medium text-primary">
                  <Calculator className="h-5 w-5" />
                  <span>CUSTO TOTAL ESTIMADO</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="text-2xl font-bold text-primary">
                    R$ {trip.custo_total_estimado?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Observations */}
      {trip.observacoes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Observações</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{trip.observacoes}</p>
          </CardContent>
        </Card>
      )}

      {/* Calculadora de Preço de Frete */}
      {trip.custo_total_estimado && trip.custo_total_estimado > 0 && (
        <FreightPriceCalculator 
          custoTotal={trip.custo_total_estimado}
          onPriceCalculated={(price, margin) => {
            // Opcional: salvar o preço sugerido
            console.log('Preço sugerido:', price, 'Margem:', margin);
          }}
        />
      )}

      {/* Fórmulas de Cálculo - Accordion Retrátil */}
      {route && (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="formulas" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                <span className="text-lg font-semibold">📐 Como os Custos foram Calculados?</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pt-4">
                <p className="text-sm text-muted-foreground mb-6">
                  Veja as fórmulas e exemplos usados para calcular os custos desta viagem
                </p>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">1. Consumo de Combustível</h4>
                    <p className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded">
                      Consumo (L) = Distância (km) ÷ Consumo do Veículo (km/L)
                    </p>
                    <p className="text-sm">
                      {trip.consumo_combustivel_l && route.distancia_km 
                        ? `${route.distancia_km} km ÷ ${(route.distancia_km / trip.consumo_combustivel_l).toFixed(2)} km/L = ${trip.consumo_combustivel_l.toFixed(2)} L`
                        : "Dados não disponíveis"}
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">2. Custo de Combustível</h4>
                    <p className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded">
                      Custo (R$) = Consumo (L) × Preço do Diesel (R$/L)
                    </p>
                    <p className="text-sm">
                      {trip.custo_combustivel && trip.consumo_combustivel_l
                        ? `${trip.consumo_combustivel_l.toFixed(2)} L × R$ ${(trip.custo_combustivel / trip.consumo_combustivel_l).toFixed(2)}/L = R$ ${trip.custo_combustivel.toFixed(2)}`
                        : "Dados não disponíveis"}
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">3. Custos Variáveis</h4>
                    <p className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded">
                      Custos (R$) = Soma dos Custos por Km × Distância
                    </p>
                    <p className="text-sm">
                      {trip.custo_variaveis 
                        ? `Manutenção, pneus e outros = R$ ${trip.custo_variaveis.toFixed(2)}`
                        : "Dados não disponíveis"}
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">4. Custo Fixo Rateado</h4>
                    <p className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded">
                      Custo (R$) = (Custos Mensais ÷ 30) × Tempo de Viagem (dias)
                    </p>
                    <p className="text-sm">
                      {trip.custo_fixo_rateado
                        ? `Seguro, IPVA e licenciamento = R$ ${trip.custo_fixo_rateado.toFixed(2)}`
                        : "Dados não disponíveis"}
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">5. Custo Total</h4>
                    <p className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded">
                      Total = Combustível + Variáveis + Pedágios + Fixo
                    </p>
                    <p className="text-sm">
                      {trip.custo_total_estimado
                        ? `R$ ${trip.custo_total_estimado.toFixed(2)}`
                        : "Dados não disponíveis"}
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">6. Tempo Estimado</h4>
                    <p className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded">
                      Tempo (h) = Distância (km) ÷ Velocidade Média (km/h)
                    </p>
                    <p className="text-sm">
                      {trip.tempo_estimado_h && route.distancia_km
                        ? `${route.distancia_km} km ÷ ${(route.distancia_km / trip.tempo_estimado_h).toFixed(0)} km/h = ${trip.tempo_estimado_h.toFixed(1)} horas`
                        : "Dados não disponíveis"}
                    </p>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      {/* Actions */}
      <div className="flex space-x-2">
        <Button onClick={() => navigate('/viagens')}>
          Voltar à Lista
        </Button>
        {trip.status !== 'Concluída' && (
          <Button 
            variant="outline"
            onClick={() => navigate(`/viagens/editar/${trip.id}`)}
          >
            Editar Viagem
          </Button>
        )}
      </div>
    </div>
  );
}