-- Drop role-based policies and create simple user-based policies

-- Routes table
DROP POLICY IF EXISTS "Alunos can view routes" ON public.routes;
DROP POLICY IF EXISTS "Docentes can create routes" ON public.routes;
DROP POLICY IF EXISTS "Docentes can delete routes" ON public.routes;
DROP POLICY IF EXISTS "Docentes can update routes" ON public.routes;
DROP POLICY IF EXISTS "Docentes can view all routes" ON public.routes;

CREATE POLICY "Users can view their own routes"
ON public.routes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own routes"
ON public.routes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own routes"
ON public.routes FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own routes"
ON public.routes FOR DELETE
USING (auth.uid() = user_id);

-- Vehicles table
DROP POLICY IF EXISTS "Alunos can view vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Docentes can create vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Docentes can delete vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Docentes can update vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Docentes can view all vehicles" ON public.vehicles;

CREATE POLICY "Users can view their own vehicles"
ON public.vehicles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own vehicles"
ON public.vehicles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vehicles"
ON public.vehicles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vehicles"
ON public.vehicles FOR DELETE
USING (auth.uid() = user_id);

-- Trips table
DROP POLICY IF EXISTS "Docentes can create trips" ON public.trips;
DROP POLICY IF EXISTS "Docentes can delete trips" ON public.trips;
DROP POLICY IF EXISTS "Docentes can update trips" ON public.trips;
DROP POLICY IF EXISTS "Users can view trips" ON public.trips;

CREATE POLICY "Users can view their own trips"
ON public.trips FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own trips"
ON public.trips FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trips"
ON public.trips FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trips"
ON public.trips FOR DELETE
USING (auth.uid() = user_id);

-- Simulacoes table
DROP POLICY IF EXISTS "All users can create simulacoes" ON public.simulacoes;
DROP POLICY IF EXISTS "All users can view simulacoes" ON public.simulacoes;
DROP POLICY IF EXISTS "Docentes can delete simulacoes" ON public.simulacoes;
DROP POLICY IF EXISTS "Docentes can update simulacoes" ON public.simulacoes;

CREATE POLICY "Users can view their own simulacoes"
ON public.simulacoes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own simulacoes"
ON public.simulacoes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own simulacoes"
ON public.simulacoes FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own simulacoes"
ON public.simulacoes FOR DELETE
USING (auth.uid() = user_id);

-- Drop the trigger that creates user roles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Update handle_new_user to only create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only insert profile
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Drop all role-related policies from user_roles table
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- Drop the user_roles table
DROP TABLE IF EXISTS public.user_roles CASCADE;

-- Drop the role checking functions
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);
DROP FUNCTION IF EXISTS public.get_user_role(uuid);

-- Drop the app_role enum
DROP TYPE IF EXISTS public.app_role CASCADE;