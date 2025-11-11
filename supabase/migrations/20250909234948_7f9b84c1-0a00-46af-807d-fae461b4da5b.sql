-- Add missing fields to trips table for Etapa 5 - Planejamento de Viagens
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS peso_ton numeric;
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS volume_m3 numeric; 
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS observacoes text;

-- Drop existing status constraint if it exists
ALTER TABLE public.trips DROP CONSTRAINT IF EXISTS trips_status_check;

-- Update status values to match requirements
UPDATE public.trips SET status = 'Planejada' WHERE status = 'planned';
UPDATE public.trips SET status = 'Em_Andamento' WHERE status = 'in_progress';
UPDATE public.trips SET status = 'Concluída' WHERE status = 'completed';

-- Add new constraint for status
ALTER TABLE public.trips ADD CONSTRAINT trips_status_check 
CHECK (status IN ('Planejada', 'Em_Andamento', 'Concluída'));

-- Create function to validate vehicle overlap and weight capacity
CREATE OR REPLACE FUNCTION public.validar_viagem()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  vehicle_capacity numeric;
  overlapping_count integer;
BEGIN
  -- Get vehicle capacity
  SELECT capacidade_ton INTO vehicle_capacity
  FROM public.vehicles 
  WHERE id = NEW.vehicle_id AND user_id = NEW.user_id;
  
  -- Check weight capacity if peso_ton is provided
  IF NEW.peso_ton IS NOT NULL AND vehicle_capacity IS NOT NULL THEN
    IF NEW.peso_ton > vehicle_capacity THEN
      RAISE EXCEPTION 'Peso da carga (%.2f ton) excede a capacidade do veículo (%.2f ton)', NEW.peso_ton, vehicle_capacity;
    END IF;
  END IF;
  
  -- Check for vehicle overlap (same vehicle, overlapping dates)
  SELECT COUNT(*)
  INTO overlapping_count
  FROM public.trips
  WHERE vehicle_id = NEW.vehicle_id
    AND user_id = NEW.user_id
    AND id != COALESCE(NEW.id, gen_random_uuid()) -- Exclude current record when updating
    AND status != 'Concluída'
    AND (
      -- New trip starts during existing trip
      (NEW.start_date >= start_date AND NEW.start_date <= end_date)
      OR
      -- New trip ends during existing trip  
      (NEW.end_date >= start_date AND NEW.end_date <= end_date)
      OR
      -- New trip completely contains existing trip
      (NEW.start_date <= start_date AND NEW.end_date >= end_date)
    );
    
  IF overlapping_count > 0 THEN
    RAISE EXCEPTION 'Veículo já possui viagem agendada neste período. Verifique as datas e tente novamente.';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to validate trips on insert and update
DROP TRIGGER IF EXISTS validar_viagem_trigger ON public.trips;
CREATE TRIGGER validar_viagem_trigger
  BEFORE INSERT OR UPDATE ON public.trips
  FOR EACH ROW
  EXECUTE FUNCTION public.validar_viagem();