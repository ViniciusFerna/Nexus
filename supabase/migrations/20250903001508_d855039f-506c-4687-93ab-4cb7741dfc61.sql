-- Remover constraints que podem impedir as alterações
ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS valid_vehicle_status;

-- Ajustar tabelas para seguir especificações da Etapa 2

-- Primeiro ajustar a tabela vehicles
-- Renomear colunas para seguir especificações exatas
ALTER TABLE vehicles 
  RENAME COLUMN vehicle_type TO tipo;

ALTER TABLE vehicles 
  RENAME COLUMN consumption TO km_por_litro;

ALTER TABLE vehicles 
  RENAME COLUMN maintenance_cost TO custo_por_km;

-- Converter capacity de integer (kg) para numeric (toneladas)
UPDATE vehicles SET capacity = capacity / 1000.0;
ALTER TABLE vehicles 
  ALTER COLUMN capacity TYPE numeric(10,2);

ALTER TABLE vehicles 
  RENAME COLUMN capacity TO capacidade_ton;

-- Remover colunas não especificadas na Etapa 2
ALTER TABLE vehicles DROP COLUMN IF EXISTS plate;
ALTER TABLE vehicles DROP COLUMN IF EXISTS model;
ALTER TABLE vehicles DROP COLUMN IF EXISTS year;

-- Criar enum para status dos veículos se não existir
DROP TYPE IF EXISTS vehicle_status CASCADE;
CREATE TYPE vehicle_status AS ENUM ('Disponível', 'Em_Manutenção', 'Em_Uso');

-- Converter valores de status existentes
UPDATE vehicles SET status = 'Disponível' WHERE status NOT IN ('Em_Manutenção', 'Em_Uso');

-- Alterar coluna status para o novo tipo
ALTER TABLE vehicles ALTER COLUMN status TYPE text;
UPDATE vehicles SET status = 
  CASE 
    WHEN status ILIKE '%maintenance%' OR status ILIKE '%manutenção%' THEN 'Em_Manutenção'
    WHEN status ILIKE '%use%' OR status ILIKE '%uso%' THEN 'Em_Uso'
    ELSE 'Disponível'
  END;

ALTER TABLE vehicles 
  ALTER COLUMN status TYPE vehicle_status USING status::vehicle_status;

-- Ajustar defaults para novos registros
ALTER TABLE vehicles 
  ALTER COLUMN status SET DEFAULT 'Disponível'::vehicle_status;

-- Ajustar a tabela routes
-- Remover colunas não especificadas na Etapa 2
ALTER TABLE routes DROP COLUMN IF EXISTS name;
ALTER TABLE routes DROP COLUMN IF EXISTS status;

-- Renomear colunas para seguir especificações
ALTER TABLE routes 
  RENAME COLUMN origin TO origem;

ALTER TABLE routes 
  RENAME COLUMN destination TO destino;

ALTER TABLE routes 
  RENAME COLUMN distance TO distancia_km;

-- Converter estimated_time para horas (assumindo que está em minutos)
-- E alterar tipo para numeric
UPDATE routes SET estimated_time = estimated_time / 60.0 WHERE estimated_time > 24; -- Converter apenas se parece estar em minutos
ALTER TABLE routes 
  ALTER COLUMN estimated_time TYPE numeric(10,2);

ALTER TABLE routes 
  RENAME COLUMN estimated_time TO tempo_estimado_h;