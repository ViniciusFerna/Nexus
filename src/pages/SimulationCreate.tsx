import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Trip {
  id: string;
  start_date: string;
  end_date: string;
  status: string;
  routes: {
    origem: string;
    destino: string;
    distancia_km: number;
  };
  vehicles: {
    tipo: string;
  };
}

export default function SimulationCreate() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    viagem_base_id: "",
    nome_cenario: "",
    preco_diesel_litro: "",
    km_por_litro: "",
    velocidade_media_kmh: "",
    entregas_na_rota: "",
    custo_var_extra_por_km: "",
    pedagios_extra: "",
    ocupacao_pct: ""
  });

  useEffect(() => {
    if (user) {
      fetchTrips();
    }
  }, [user]);

  const fetchTrips = async () => {
    try {
      const { data: tripsData, error } = await supabase
        .from("trips")
        .select("id, start_date, end_date, status, route_id, vehicle_id")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch related data for each trip
      const tripsWithRelations = await Promise.all(
        (tripsData || []).map(async (trip) => {
          const [routeResult, vehicleResult] = await Promise.all([
            supabase.from("routes").select("origem, destino, distancia_km").eq("id", trip.route_id).single(),
            supabase.from("vehicles").select("tipo").eq("id", trip.vehicle_id).single()
          ]);

          return {
            ...trip,
            routes: routeResult.data || { origem: "", destino: "", distancia_km: 0 },
            vehicles: vehicleResult.data || { tipo: "" }
          };
        })
      );

      setTrips(tripsWithRelations);
    } catch (error) {
      console.error("Error fetching trips:", error);
      toast.error("❌ Erro ao carregar viagens. Verifique sua conexão com a internet ou se você já criou viagens no sistema. Você precisa ter pelo menos uma viagem para criar simulações.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.viagem_base_id || !formData.nome_cenario) {
      toast.error("📋 Campos obrigatórios faltando! Para criar uma simulação, você precisa escolher uma viagem base (o cenário real que será simulado) e dar um nome ao cenário (ex: 'Simulação com diesel mais caro').");
      return;
    }

    setLoading(true);
    try {
      const simulationData = {
        viagem_base_id: formData.viagem_base_id,
        nome_cenario: formData.nome_cenario,
        user_id: user?.id,
        ...(formData.preco_diesel_litro && { preco_diesel_litro: parseFloat(formData.preco_diesel_litro) }),
        ...(formData.km_por_litro && { km_por_litro: parseFloat(formData.km_por_litro) }),
        ...(formData.velocidade_media_kmh && { velocidade_media_kmh: parseFloat(formData.velocidade_media_kmh) }),
        ...(formData.entregas_na_rota && { entregas_na_rota: parseInt(formData.entregas_na_rota) }),
        ...(formData.custo_var_extra_por_km && { custo_var_extra_por_km: parseFloat(formData.custo_var_extra_por_km) }),
        ...(formData.pedagios_extra && { pedagios_extra: parseFloat(formData.pedagios_extra) }),
        ...(formData.ocupacao_pct && { ocupacao_pct: parseFloat(formData.ocupacao_pct) })
      };

      const { data, error } = await supabase
        .from("simulacoes")
        .insert([simulationData])
        .select()
        .single();

      if (error) throw error;

      // Run the simulation
      const { error: runError } = await supabase.functions.invoke('rodar-simulacao', {
        body: { simulacao_id: data.id }
      });

      if (runError) throw runError;

      toast.success("✅ Simulação criada e executada com sucesso! Você pode agora comparar os resultados com outros cenários na página de simulações.");
      navigate("/simulations");
    } catch (error) {
      console.error("Error creating simulation:", error);
      toast.error("❌ Erro ao criar simulação. Verifique se todos os valores numéricos estão corretos (sem letras) e se a viagem base existe. Tente novamente.");
    }
    setLoading(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate("/simulations")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nova Simulação</h1>
          <p className="text-muted-foreground">
            Crie um cenário "E se?" baseado em uma viagem existente
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configurar Simulação</CardTitle>
          <CardDescription>
            Selecione uma viagem base e configure os parâmetros que deseja simular
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="viagem_base">Viagem Base *</Label>
                <Select
                  value={formData.viagem_base_id}
                  onValueChange={(value) => handleInputChange("viagem_base_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma viagem" />
                  </SelectTrigger>
                  <SelectContent>
                    {trips.map((trip) => (
                      <SelectItem key={trip.id} value={trip.id}>
                        {trip.routes?.origem} → {trip.routes?.destino} ({trip.vehicles?.tipo}) - {trip.status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nome_cenario">Nome do Cenário *</Label>
                <Input
                  id="nome_cenario"
                  value={formData.nome_cenario}
                  onChange={(e) => handleInputChange("nome_cenario", e.target.value)}
                  placeholder="Ex: Diesel mais caro, Veículo mais eficiente"
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Parâmetros de Simulação (Opcionais)</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="preco_diesel">Preço Diesel (R$/L)</Label>
                  <Input
                    id="preco_diesel"
                    type="number"
                    step="0.01"
                    value={formData.preco_diesel_litro}
                    onChange={(e) => handleInputChange("preco_diesel_litro", e.target.value)}
                    placeholder="5.50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="km_por_litro">Km por Litro</Label>
                  <Input
                    id="km_por_litro"
                    type="number"
                    step="0.1"
                    value={formData.km_por_litro}
                    onChange={(e) => handleInputChange("km_por_litro", e.target.value)}
                    placeholder="3.5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="velocidade_media">Velocidade Média (km/h)</Label>
                  <Input
                    id="velocidade_media"
                    type="number"
                    value={formData.velocidade_media_kmh}
                    onChange={(e) => handleInputChange("velocidade_media_kmh", e.target.value)}
                    placeholder="60"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="entregas">Entregas na Rota</Label>
                  <Input
                    id="entregas"
                    type="number"
                    value={formData.entregas_na_rota}
                    onChange={(e) => handleInputChange("entregas_na_rota", e.target.value)}
                    placeholder="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custo_extra">Custo Variável Extra (R$/km)</Label>
                  <Input
                    id="custo_extra"
                    type="number"
                    step="0.01"
                    value={formData.custo_var_extra_por_km}
                    onChange={(e) => handleInputChange("custo_var_extra_por_km", e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pedagios_extra">Pedágios Extra (R$)</Label>
                  <Input
                    id="pedagios_extra"
                    type="number"
                    step="0.01"
                    value={formData.pedagios_extra}
                    onChange={(e) => handleInputChange("pedagios_extra", e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ocupacao">Ocupação (%)</Label>
                  <Input
                    id="ocupacao"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.ocupacao_pct}
                    onChange={(e) => handleInputChange("ocupacao_pct", e.target.value)}
                    placeholder="100"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate("/simulations")}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                <Play className="h-4 w-4 mr-2" />
                {loading ? "Criando..." : "Criar e Executar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}