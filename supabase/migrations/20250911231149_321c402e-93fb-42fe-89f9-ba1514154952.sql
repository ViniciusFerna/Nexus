-- Create simulacoes table for what-if scenarios
CREATE TABLE public.simulacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  viagem_base_id UUID NOT NULL,
  nome_cenario TEXT NOT NULL,
  user_id UUID NOT NULL,
  
  -- Override parameters (all optional)
  preco_diesel_litro NUMERIC,
  km_por_litro NUMERIC,
  velocidade_media_kmh NUMERIC,
  entregas_na_rota INTEGER,
  custo_var_extra_por_km NUMERIC DEFAULT 0,
  pedagios_extra NUMERIC DEFAULT 0,
  ocupacao_pct NUMERIC,
  
  -- Calculated results
  custo_total NUMERIC,
  custo_por_entrega NUMERIC,
  custo_por_tonelada_km NUMERIC,
  margem NUMERIC,
  consumo_combustivel_l NUMERIC,
  custo_combustivel NUMERIC,
  custo_variaveis NUMERIC,
  custo_pedagios NUMERIC,
  custo_fixo_rateado NUMERIC,
  tempo_estimado_h NUMERIC,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.simulacoes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own simulacoes" 
ON public.simulacoes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own simulacoes" 
ON public.simulacoes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own simulacoes" 
ON public.simulacoes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own simulacoes" 
ON public.simulacoes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for timestamps
CREATE TRIGGER update_simulacoes_updated_at
BEFORE UPDATE ON public.simulacoes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add receita field to trips table for margin calculations
ALTER TABLE public.trips 
ADD COLUMN receita NUMERIC DEFAULT 0;