-- Add vehicle_type column to vehicles table
ALTER TABLE public.vehicles ADD COLUMN vehicle_type TEXT NOT NULL DEFAULT 'Caminhão';

-- Update existing vehicle status values to match specifications
UPDATE public.vehicles SET status = 'available' WHERE status = 'active';
UPDATE public.vehicles SET status = 'maintenance' WHERE status = 'maintenance';
UPDATE public.vehicles SET status = 'in_use' WHERE status = 'inactive';

-- Create a constraint to ensure only valid vehicle types
ALTER TABLE public.vehicles ADD CONSTRAINT valid_vehicle_type 
CHECK (vehicle_type IN ('Caminhão', 'Van', 'Carreta', 'Truck', 'Utilitário'));

-- Create a constraint to ensure only valid vehicle status
ALTER TABLE public.vehicles DROP CONSTRAINT IF EXISTS vehicles_status_check;
ALTER TABLE public.vehicles ADD CONSTRAINT valid_vehicle_status 
CHECK (status IN ('available', 'maintenance', 'in_use'));