-- Create custos_veiculo table for vehicle-specific costs
CREATE TABLE public.custos_veiculo (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  veiculo_id UUID NOT NULL,
  nome TEXT NOT NULL,
  valor_mensal NUMERIC NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.custos_veiculo ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own custos_veiculo"
ON public.custos_veiculo FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own custos_veiculo"
ON public.custos_veiculo FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custos_veiculo"
ON public.custos_veiculo FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custos_veiculo"
ON public.custos_veiculo FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_custos_veiculo_updated_at
BEFORE UPDATE ON public.custos_veiculo
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Remove custo_por_km from vehicles table (redundant field)
ALTER TABLE public.vehicles DROP COLUMN IF EXISTS custo_por_km;

-- Add comment
COMMENT ON TABLE public.custos_veiculo IS 'Vehicle-specific costs like maintenance, insurance, IPVA, depreciation, etc.';