-- Add calculated fields to trips table
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS consumo_combustivel_l numeric DEFAULT 0;
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS custo_combustivel numeric DEFAULT 0;
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS custo_variaveis numeric DEFAULT 0;
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS custo_pedagios numeric DEFAULT 0;
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS custo_fixo_rateado numeric DEFAULT 0;
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS custo_total_estimado numeric DEFAULT 0;
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS tempo_estimado_h numeric DEFAULT 0;