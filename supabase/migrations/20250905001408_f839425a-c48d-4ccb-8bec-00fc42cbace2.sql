-- Create calculos table with auto-calculation fields
CREATE TABLE public.calculos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  veiculo_id UUID NOT NULL,
  rota_id UUID NOT NULL,
  distancia_km NUMERIC NOT NULL DEFAULT 0,
  custo_por_km NUMERIC NOT NULL DEFAULT 0,
  entregas_na_rota INTEGER NOT NULL DEFAULT 1,
  custo_total NUMERIC NOT NULL DEFAULT 0,
  custo_por_entrega NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.calculos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own calculos" 
ON public.calculos 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own calculos" 
ON public.calculos 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calculos" 
ON public.calculos 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calculos" 
ON public.calculos 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_calculos_updated_at
BEFORE UPDATE ON public.calculos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update calculation fields
CREATE OR REPLACE FUNCTION public.atualizar_campos_calculo()
RETURNS TRIGGER AS $$
DECLARE
  rota_data RECORD;
  veiculo_data RECORD;
BEGIN
  -- Get route data
  SELECT distancia_km INTO rota_data
  FROM public.routes 
  WHERE id = NEW.rota_id AND user_id = NEW.user_id;
  
  -- Get vehicle data
  SELECT custo_por_km INTO veiculo_data
  FROM public.vehicles 
  WHERE id = NEW.veiculo_id AND user_id = NEW.user_id;
  
  -- Update auto fields
  NEW.distancia_km := COALESCE(rota_data.distancia_km, 0);
  NEW.custo_por_km := COALESCE(veiculo_data.custo_por_km, 0);
  
  -- Calculate costs
  NEW.custo_total := NEW.distancia_km * NEW.custo_por_km;
  NEW.custo_por_entrega := CASE 
    WHEN NEW.entregas_na_rota > 0 THEN NEW.custo_total / NEW.entregas_na_rota
    ELSE NEW.custo_total
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for auto-calculation on insert/update
CREATE TRIGGER trigger_atualizar_campos_calculo
BEFORE INSERT OR UPDATE ON public.calculos
FOR EACH ROW
EXECUTE FUNCTION public.atualizar_campos_calculo();