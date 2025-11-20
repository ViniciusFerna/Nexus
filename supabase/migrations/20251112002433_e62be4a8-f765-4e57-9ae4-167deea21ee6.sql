-- Adicionar coluna custo_extra na tabela trips
ALTER TABLE trips 
ADD COLUMN custo_extra numeric DEFAULT 0;