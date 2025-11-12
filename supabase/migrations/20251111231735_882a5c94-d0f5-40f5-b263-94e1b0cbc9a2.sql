-- Add pedagio field to routes table
ALTER TABLE public.routes 
ADD COLUMN valor_pedagio NUMERIC DEFAULT 0;

COMMENT ON COLUMN public.routes.valor_pedagio IS 'Valor total dos pedágios neste trecho';