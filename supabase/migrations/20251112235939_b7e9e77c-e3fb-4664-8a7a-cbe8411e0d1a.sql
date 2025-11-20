-- Remove unused calculos table
DROP TABLE IF EXISTS public.calculos;

-- Remove unused moeda field from parametros_globais
ALTER TABLE public.parametros_globais 
DROP COLUMN IF EXISTS moeda;