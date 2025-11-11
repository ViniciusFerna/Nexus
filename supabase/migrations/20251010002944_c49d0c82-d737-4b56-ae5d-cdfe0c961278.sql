-- Add new columns to calculos table for detailed cost breakdown
ALTER TABLE public.calculos 
ADD COLUMN IF NOT EXISTS nome_cenario text,
ADD COLUMN IF NOT EXISTS consumo_combustivel_l numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS custo_combustivel numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS custo_variaveis numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS custo_pedagios numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS custo_fixo_rateado numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS tempo_estimado_h numeric DEFAULT 0;