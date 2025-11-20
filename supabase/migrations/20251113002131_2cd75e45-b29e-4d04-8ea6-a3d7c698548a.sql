-- Add cargo_id to trips table to link cargo
ALTER TABLE public.trips 
ADD COLUMN cargo_id UUID REFERENCES public.cargo(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX idx_trips_cargo_id ON public.trips(cargo_id);