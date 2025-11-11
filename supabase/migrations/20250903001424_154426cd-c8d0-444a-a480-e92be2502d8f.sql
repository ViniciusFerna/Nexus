-- Ajustar tabelas para seguir especificações da Etapa 2

-- Primeiro, vamos ajustar a tabela vehicles
-- Renomear colunas e ajustar tipos para seguir especificações exatas
ALTER TABLE vehicles 
  RENAME COLUMN vehicle_type TO tipo;

ALTER TABLE vehicles 
  RENAME COLUMN consumption TO km_por_litro;

ALTER TABLE vehicles 
  RENAME COLUMN maintenance_cost TO custo_por_km;

-- Alterar capacity de integer (kg) para numeric (toneladas)
-- Vamos converter os dados existentes dividindo por 1000
UPDATE vehicles SET capacity = capacity / 1000.0;
ALTER TABLE vehicles 
  ALTER COLUMN capacity TYPE numeric(10,2);

ALTER TABLE vehicles 
  RENAME COLUMN capacity TO capacidade_ton;

-- Remover colunas não especificadas na Etapa 2
ALTER TABLE vehicles DROP COLUMN IF EXISTS plate;
ALTER TABLE vehicles DROP COLUMN IF EXISTS model;
ALTER TABLE vehicles DROP COLUMN IF EXISTS year;

-- Criar enum para status dos veículos
CREATE TYPE vehicle_status AS ENUM ('Disponível', 'Em_Manutenção', 'Em_Uso');

-- Converter status existentes para o novo enum
UPDATE vehicles SET status = 
  CASE 
    WHEN status = 'active' THEN 'Disponível'
    WHEN status = 'maintenance' THEN 'Em_Manutenção'
    WHEN status = 'in_use' THEN 'Em_Uso'
    ELSE 'Disponível'
  END;

-- Alterar coluna status para usar o novo enum
ALTER TABLE vehicles 
  ALTER COLUMN status TYPE vehicle_status USING status::vehicle_status;

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

-- Converter tempo de minutos para horas e alterar tipo
UPDATE routes SET estimated_time = estimated_time / 60.0;
ALTER TABLE routes 
  ALTER COLUMN estimated_time TYPE numeric(10,2);

ALTER TABLE routes 
  RENAME COLUMN estimated_time TO tempo_estimado_h;