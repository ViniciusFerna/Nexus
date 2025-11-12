import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Settings } from "lucide-react";

export default function Custos() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [formData, setFormData] = useState({
    preco_diesel_litro: "",
    velocidade_media_kmh: "",
    moeda: "R$",
  });

  useEffect(() => {
    if (user) {
      fetchParametros();
    }
  }, [user]);

  const fetchParametros = async () => {
    try {
      const { data, error } = await supabase
        .from("parametros_globais")
        .select("*")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setFormData({
          preco_diesel_litro: data.preco_diesel_litro.toString(),
          velocidade_media_kmh: data.velocidade_media_kmh.toString(),
          moeda: data.moeda,
        });
      }
    } catch (error) {
      console.error("Error fetching parametros:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      user_id: user?.id,
      preco_diesel_litro: parseFloat(formData.preco_diesel_litro),
      velocidade_media_kmh: parseFloat(formData.velocidade_media_kmh),
      moeda: formData.moeda,
    };

    try {
      const { data: existing } = await supabase
        .from("parametros_globais")
        .select("id")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("parametros_globais")
          .update(data)
          .eq("user_id", user?.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("parametros_globais")
          .insert([data]);

        if (error) throw error;
      }

      toast({
        title: "Sucesso!",
        description: "Parâmetros atualizados com sucesso.",
      });
      setHasChanges(false);
      queryClient.invalidateQueries({ queryKey: ["parametros_globais"] });
    } catch (error: any) {
      console.error("Error saving parametros:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar parâmetros.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-2xl font-bold text-foreground">Parâmetros Globais</h2>
          <p className="text-sm text-muted-foreground">
            Configure os parâmetros utilizados nos cálculos do sistema
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configurações Gerais</CardTitle>
          <CardDescription>
            Estes valores serão utilizados como base para todos os cálculos de custos e simulações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="preco_diesel_litro">Preço do Diesel (por litro) *</Label>
              <Input
                id="preco_diesel_litro"
                type="number"
                step="0.01"
                min="0"
                value={formData.preco_diesel_litro}
                onChange={(e) => handleInputChange("preco_diesel_litro", e.target.value)}
                placeholder="5.50"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="velocidade_media_kmh">Velocidade Média (km/h) *</Label>
              <Input
                id="velocidade_media_kmh"
                type="number"
                step="1"
                min="1"
                max="120"
                value={formData.velocidade_media_kmh}
                onChange={(e) => handleInputChange("velocidade_media_kmh", e.target.value)}
                placeholder="60"
                required
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
                required
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={!hasChanges}>
                Salvar Alterações
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
