-- Create custos_fixos table
CREATE TABLE public.custos_fixos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  valor_mensal NUMERIC NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.custos_fixos ENABLE ROW LEVEL SECURITY;

-- Create policies for custos_fixos
CREATE POLICY "Users can view their own custos_fixos" 
ON public.custos_fixos 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own custos_fixos" 
ON public.custos_fixos 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custos_fixos" 
ON public.custos_fixos 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custos_fixos" 
ON public.custos_fixos 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create custos_variaveis table
CREATE TABLE public.custos_variaveis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  valor_por_km NUMERIC NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.custos_variaveis ENABLE ROW LEVEL SECURITY;

-- Create policies for custos_variaveis
CREATE POLICY "Users can view their own custos_variaveis" 
ON public.custos_variaveis 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own custos_variaveis" 
ON public.custos_variaveis 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custos_variaveis" 
ON public.custos_variaveis 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custos_variaveis" 
ON public.custos_variaveis 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create pedagios table
CREATE TABLE public.pedagios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  rota_id UUID NOT NULL,
  descricao TEXT NOT NULL,
  valor NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pedagios ENABLE ROW LEVEL SECURITY;

-- Create policies for pedagios
CREATE POLICY "Users can view their own pedagios" 
ON public.pedagios 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own pedagios" 
ON public.pedagios 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pedagios" 
ON public.pedagios 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pedagios" 
ON public.pedagios 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create parametros_globais table (single record per user)
CREATE TABLE public.parametros_globais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  preco_diesel_litro NUMERIC NOT NULL DEFAULT 5.50,
  velocidade_media_kmh NUMERIC NOT NULL DEFAULT 60,
  moeda TEXT NOT NULL DEFAULT 'R$',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.parametros_globais ENABLE ROW LEVEL SECURITY;

-- Create policies for parametros_globais
CREATE POLICY "Users can view their own parametros_globais" 
ON public.parametros_globais 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own parametros_globais" 
ON public.parametros_globais 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own parametros_globais" 
ON public.parametros_globais 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_custos_fixos_updated_at
BEFORE UPDATE ON public.custos_fixos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_custos_variaveis_updated_at
BEFORE UPDATE ON public.custos_variaveis
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pedagios_updated_at
BEFORE UPDATE ON public.pedagios
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_parametros_globais_updated_at
BEFORE UPDATE ON public.parametros_globais
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();