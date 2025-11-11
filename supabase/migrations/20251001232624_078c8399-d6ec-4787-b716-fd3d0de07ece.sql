-- Update RLS policies for vehicles table based on roles

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Users can create their own vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Users can update their own vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Users can delete their own vehicles" ON public.vehicles;

-- Alunos can only read vehicles
CREATE POLICY "Alunos can view vehicles"
ON public.vehicles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'aluno'::app_role) OR user_id = auth.uid());

-- Docentes have full CRUD
CREATE POLICY "Docentes can view all vehicles"
ON public.vehicles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'docente'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Docentes can create vehicles"
ON public.vehicles
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'docente'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Docentes can update vehicles"
ON public.vehicles
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'docente'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Docentes can delete vehicles"
ON public.vehicles
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'docente'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Update RLS policies for routes table

DROP POLICY IF EXISTS "Users can view their own routes" ON public.routes;
DROP POLICY IF EXISTS "Users can create their own routes" ON public.routes;
DROP POLICY IF EXISTS "Users can update their own routes" ON public.routes;
DROP POLICY IF EXISTS "Users can delete their own routes" ON public.routes;

CREATE POLICY "Alunos can view routes"
ON public.routes
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'aluno'::app_role) OR user_id = auth.uid());

CREATE POLICY "Docentes can view all routes"
ON public.routes
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'docente'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Docentes can create routes"
ON public.routes
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'docente'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Docentes can update routes"
ON public.routes
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'docente'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Docentes can delete routes"
ON public.routes
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'docente'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Update RLS policies for simulacoes

DROP POLICY IF EXISTS "Users can view their own simulacoes" ON public.simulacoes;
DROP POLICY IF EXISTS "Users can create their own simulacoes" ON public.simulacoes;
DROP POLICY IF EXISTS "Users can update their own simulacoes" ON public.simulacoes;
DROP POLICY IF EXISTS "Users can delete their own simulacoes" ON public.simulacoes;

CREATE POLICY "All users can view simulacoes"
ON public.simulacoes
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR has_role(auth.uid(), 'docente'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "All users can create simulacoes"
ON public.simulacoes
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Docentes can update simulacoes"
ON public.simulacoes
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR has_role(auth.uid(), 'docente'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Docentes can delete simulacoes"
ON public.simulacoes
FOR DELETE
TO authenticated
USING (user_id = auth.uid() OR has_role(auth.uid(), 'docente'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Ensure trips, custos_fixos, custos_variaveis, pedagios have proper policies for docentes

DROP POLICY IF EXISTS "Users can view their own trips" ON public.trips;
DROP POLICY IF EXISTS "Users can create their own trips" ON public.trips;
DROP POLICY IF EXISTS "Users can update their own trips" ON public.trips;
DROP POLICY IF EXISTS "Users can delete their own trips" ON public.trips;

CREATE POLICY "Users can view trips"
ON public.trips
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR has_role(auth.uid(), 'docente'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Docentes can create trips"
ON public.trips
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'docente'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Docentes can update trips"
ON public.trips
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'docente'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Docentes can delete trips"
ON public.trips
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'docente'::app_role) OR has_role(auth.uid(), 'admin'::app_role));