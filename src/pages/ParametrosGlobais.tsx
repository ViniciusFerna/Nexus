import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Settings, Save } from "lucide-react";

interface ParametroGlobal {
  id: string;
  user_id: string;
  preco_diesel_litro: number;
  velocidade_media_kmh: number;
  moeda: string;
  created_at: string;
  updated_at: string;
}

export default function ParametrosGlobais() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    preco_diesel_litro: "",
    velocidade_media_kmh: "",
    moeda: "R$",
  });
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch parametros globais data
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

  // Atualizar dados do formulário quando parâmetros mudarem
  useEffect(() => {
    if (parametros) {
      setFormData({
        preco_diesel_litro: parametros.preco_diesel_litro.toString(),
        velocidade_media_kmh: parametros.velocidade_media_kmh.toString(),
        moeda: parametros.moeda,
      });
    }
  }, [parametros]);

  // Create/Update parametros globais mutation
  const saveParametrosMutation = useMutation({
    mutationFn: async (data: { preco_diesel_litro: number; velocidade_media_kmh: number; moeda: string }) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      if (parametros) {
        // Update existing
        const { data: result, error } = await supabase
          .from("parametros_globais")
          .update(data)
          .eq("id", parametros.id)
          .select()
          .single();
        
        if (error) throw error;
        return result;
      } else {
        // Create new
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

  const canModify = true;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Carregando parâmetros...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Parâmetros Globais</h1>
        <p className="text-muted-foreground">
          Configure os parâmetros globais utilizados nos cálculos de transporte
        </p>
      </div>

      {/* Parameters Form */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações do Sistema
          </CardTitle>
          <CardDescription>
            Estes parâmetros são utilizados em todos os cálculos de custo e simulações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Preço do Diesel */}
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
                onInvalid={(e) => {
                  const input = e.target as HTMLInputElement;
                  input.setCustomValidity('⛽ O preço do diesel deve ser maior que R$ 0. Verifique o preço atual nos postos da sua região. Em 2024, o preço médio no Brasil varia entre R$ 5 e R$ 7 por litro.');
                }}
                onInput={(e) => {
                  const input = e.target as HTMLInputElement;
                  input.setCustomValidity('');
                }}
                placeholder="5.50"
                disabled={!canModify}
                title="Preço médio do diesel por litro. Consulte os postos da sua região."
              />
              <p className="text-sm text-muted-foreground">
                Valor atual do diesel utilizado nos cálculos de combustível
              </p>
            </div>

            {/* Velocidade Média */}
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
                onInvalid={(e) => {
                  const input = e.target as HTMLInputElement;
                  if (input.validity.rangeUnderflow) {
                    input.setCustomValidity('🚛 A velocidade mínima é 1 km/h. Considere velocidades realistas para o tipo de via.');
                  } else if (input.validity.rangeOverflow) {
                    input.setCustomValidity('🚛 A velocidade máxima é 120 km/h (limite das rodovias brasileiras). Caminhões geralmente trafegam entre 60-90 km/h.');
                  } else {
                    input.setCustomValidity('🚛 Digite uma velocidade válida entre 1 e 120 km/h.');
                  }
                }}
                onInput={(e) => {
                  const input = e.target as HTMLInputElement;
                  input.setCustomValidity('');
                }}
                placeholder="60"
                disabled={!canModify}
                title="Velocidade média considerando tipo de via, tráfego e paradas. Ex: rodovia = 70-90 km/h, urbano = 30-50 km/h"
              />
              <p className="text-sm text-muted-foreground">
                Velocidade média considerada para cálculo de tempo de viagem
              </p>
            </div>

            {/* Moeda */}
            <div className="space-y-2">
              <Label htmlFor="moeda">
                Moeda *
              </Label>
              <Input
                id="moeda"
                type="text"
                value={formData.moeda}
                onChange={(e) => handleInputChange("moeda", e.target.value)}
                placeholder="R$"
                disabled={!canModify}
              />
              <p className="text-sm text-muted-foreground">
                Símbolo da moeda utilizada nos cálculos e relatórios
              </p>
            </div>

            {/* Save Button */}
            {canModify && (
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={!hasChanges || saveParametrosMutation.isPending}
                  className="min-w-32"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saveParametrosMutation.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            )}

            {!canModify && (
              <div className="text-sm text-muted-foreground p-4 bg-muted rounded-lg">
                ℹ️ Você possui apenas permissão de leitura para estes parâmetros.
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Current Values Summary */}
      {parametros && (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Valores Atuais</CardTitle>
            <CardDescription>
              Resumo dos parâmetros configurados no sistema
            </CardDescription>
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