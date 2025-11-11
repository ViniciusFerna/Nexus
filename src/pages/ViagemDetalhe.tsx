import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  DollarSign,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
  observacoes?: string;
  consumo_combustivel_l?: number;
  custo_combustivel?: number;
  custo_variaveis?: number;
  custo_pedagios?: number;
  custo_fixo_rateado?: number;
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

export default function ViagemDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch trip details
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

  // Fetch vehicle details
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

  // Fetch route details
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

  // Recalculate costs mutation
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

      <div className="grid gap-6 md:grid-cols-2">
        {/* Trip Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Informações da Viagem</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Status:</span>
              <Badge variant={getStatusVariant(trip.status)} className="flex items-center space-x-1">
                {getStatusIcon(trip.status)}
                <span>{trip.status}</span>
              </Badge>
            </div>
            
            <Separator />
            
            <div>
              <span className="font-medium">Data de Início:</span>
              <p className="text-muted-foreground">
                {format(new Date(trip.start_date), "dd/MM/yyyy", { locale: ptBR })}
              </p>
            </div>
            
            <div>
              <span className="font-medium">Data de Término:</span>
              <p className="text-muted-foreground">
                {format(new Date(trip.end_date), "dd/MM/yyyy", { locale: ptBR })}
              </p>
            </div>

            {trip.peso_ton && (
              <div className="flex items-center space-x-2">
                <Weight className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Peso:</span>
                <span className="text-muted-foreground">{trip.peso_ton} toneladas</span>
              </div>
            )}

            {trip.volume_m3 && (
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Volume:</span>
                <span className="text-muted-foreground">{trip.volume_m3} m³</span>
              </div>
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
                  <span className="font-medium">Tipo:</span>
                  <p className="text-muted-foreground">{vehicle.tipo}</p>
                </div>
                <div>
                  <span className="font-medium">Capacidade:</span>
                  <p className="text-muted-foreground">{vehicle.capacidade_ton} toneladas</p>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <p className="text-muted-foreground">{vehicle.status}</p>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">Carregando informações do veículo...</p>
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
                  <span className="font-medium">Origem:</span>
                  <p className="text-muted-foreground">{route.origem}</p>
                </div>
                <div>
                  <span className="font-medium">Destino:</span>
                  <p className="text-muted-foreground">{route.destino}</p>
                </div>
                <div>
                  <span className="font-medium">Distância:</span>
                  <p className="text-muted-foreground">{route.distancia_km} km</p>
                </div>
                <div>
                  <span className="font-medium">Tempo Estimado:</span>
                  <p className="text-muted-foreground">{route.tempo_estimado_h} horas</p>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">Carregando informações da rota...</p>
            )}
          </CardContent>
        </Card>

        {/* Operational Calculations */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="h-5 w-5" />
                <span>Cálculos Operacionais</span>
              </CardTitle>
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
            <CardDescription>
              Custos operacionais calculados automaticamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm font-medium">
                  <Fuel className="h-4 w-4 text-muted-foreground" />
                  <span>Combustível</span>
                </div>
                <div className="pl-6 space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Consumo: {trip.consumo_combustivel_l?.toFixed(2) || '0.00'} L
                  </p>
                  <p className="text-sm font-medium">
                    Custo: R$ {trip.custo_combustivel?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm font-medium">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>Custos Variáveis</span>
                </div>
                <div className="pl-6">
                  <p className="text-sm font-medium">
                    R$ {trip.custo_variaveis?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm font-medium">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>Pedágios</span>
                </div>
                <div className="pl-6">
                  <p className="text-sm font-medium">
                    R$ {trip.custo_pedagios?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm font-medium">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Custo Fixo (Diário)</span>
                </div>
                <div className="pl-6">
                  <p className="text-sm font-medium">
                    R$ {trip.custo_fixo_rateado?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm font-medium">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Tempo Estimado</span>
                </div>
                <div className="pl-6">
                  <p className="text-sm font-medium">
                    {trip.tempo_estimado_h?.toFixed(2) || '0.00'} horas
                  </p>
                </div>
              </div>

              <div className="space-y-2 border-l-2 border-primary pl-4">
                <div className="text-sm font-medium text-primary">
                  CUSTO TOTAL ESTIMADO
                </div>
                <div className="text-lg font-bold text-primary">
                  R$ {trip.custo_total_estimado?.toFixed(2) || '0.00'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Observations */}
        {trip.observacoes && (
          <Card className="md:col-span-2">
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
      </div>

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