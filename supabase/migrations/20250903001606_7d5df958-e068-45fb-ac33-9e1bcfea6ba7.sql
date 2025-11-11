-- Limpar dados e recriar as tabelas com as especificações corretas da Etapa 2

-- Primeiro, vamos limpar as tabelas e recriar com as especificações exatas
-- Backup e limpeza da tabela vehicles
DROP TABLE IF EXISTS vehicles_backup;
CREATE TABLE vehicles_backup AS SELECT * FROM vehicles;

-- Remover constraints e defaults
ALTER TABLE vehicles ALTER COLUMN status DROP DEFAULT;

-- Recriar tabela vehicles com especificações da Etapa 2
DROP TABLE vehicles;
CREATE TABLE vehicles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  tipo text NOT NULL,
  capacidade_ton numeric(10,2) NOT NULL,
  custo_por_km numeric(10,2) NOT NULL,
  km_por_litro numeric(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'Disponível' CHECK (status IN ('Disponível', 'Em_Manutenção', 'Em_Uso')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- Recriar políticas RLS
CREATE POLICY "Users can view their own vehicles" 
ON vehicles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own vehicles" 
ON vehicles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vehicles" 
ON vehicles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vehicles" 
ON vehicles FOR DELETE 
USING (auth.uid() = user_id);

-- Criar trigger para updated_at
CREATE TRIGGER update_vehicles_updated_at
BEFORE UPDATE ON vehicles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Fazer o mesmo para routes
DROP TABLE IF EXISTS routes_backup;
CREATE TABLE routes_backup AS SELECT * FROM routes;

DROP TABLE routes;
CREATE TABLE routes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  origem text NOT NULL,
  destino text NOT NULL,
  distancia_km numeric(10,2) NOT NULL,
  tempo_estimado_h numeric(10,2) NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;

-- Recriar políticas RLS
CREATE POLICY "Users can view their own routes" 
ON routes FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own routes" 
ON routes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own routes" 
ON routes FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own routes" 
ON routes FOR DELETE 
USING (auth.uid() = user_id);

-- Criar trigger para updated_at
CREATE TRIGGER update_routes_updated_at
BEFORE UPDATE ON routes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();