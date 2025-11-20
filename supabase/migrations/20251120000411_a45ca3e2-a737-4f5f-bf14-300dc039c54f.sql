-- Popular sistema NEXUS TMS com dados de exemplo
-- User ID: bd131cea-ff84-438b-9ce5-67fa7d0e1d84

DO $$ 
DECLARE
  v_user_id uuid := 'bd131cea-ff84-438b-9ce5-67fa7d0e1d84';
  v_veiculo_toco uuid;
  v_veiculo_truck uuid;
  v_veiculo_carreta uuid;
  v_veiculo_bitruck uuid;
  v_rota_sp_rj uuid;
  v_rota_sp_mg uuid;
  v_rota_sp_campinas uuid;
  v_rota_sp_santos uuid;
  v_cargo_eletronicos uuid;
  v_cargo_alimentos uuid;
BEGIN

-- PARÂMETROS GLOBAIS
INSERT INTO parametros_globais (user_id, preco_diesel_litro, velocidade_media_kmh)
VALUES (v_user_id, 6.20, 65)
ON CONFLICT (user_id) DO UPDATE 
SET preco_diesel_litro = 6.20, velocidade_media_kmh = 65;

-- VEÍCULOS
INSERT INTO vehicles (id, user_id, tipo, capacidade_ton, km_por_litro, status) VALUES
  (gen_random_uuid(), v_user_id, 'Caminhão Toco 3/4', 5, 7.5, 'Disponível'),
  (gen_random_uuid(), v_user_id, 'Caminhão Truck', 14, 5.2, 'Disponível'),
  (gen_random_uuid(), v_user_id, 'Carreta LS (Cavalo + Semi-reboque)', 27, 3.8, 'Disponível'),
  (gen_random_uuid(), v_user_id, 'Bitruck 8x2', 23, 4.5, 'Disponível'),
  (gen_random_uuid(), v_user_id, 'VUC (Veículo Urbano de Carga)', 3, 9.0, 'Disponível'),
  (gen_random_uuid(), v_user_id, 'Carreta Vanderleia (Cavalo + 2 Reboques)', 40, 3.2, 'Disponível'),
  (gen_random_uuid(), v_user_id, 'Caminhão Toco 6x2', 10, 6.0, 'Disponível'),
  (gen_random_uuid(), v_user_id, 'Truck Baú Frigorífico', 12, 4.8, 'Disponível'),
  (gen_random_uuid(), v_user_id, 'Carreta Graneleira', 30, 3.5, 'Disponível'),
  (gen_random_uuid(), v_user_id, 'Caminhão Leve 3/4 Refrigerado', 4, 8.0, 'Disponível');

SELECT id INTO v_veiculo_toco FROM vehicles WHERE tipo = 'Caminhão Toco 3/4' AND user_id = v_user_id ORDER BY created_at DESC LIMIT 1;
SELECT id INTO v_veiculo_truck FROM vehicles WHERE tipo = 'Caminhão Truck' AND user_id = v_user_id ORDER BY created_at DESC LIMIT 1;
SELECT id INTO v_veiculo_carreta FROM vehicles WHERE tipo = 'Carreta LS (Cavalo + Semi-reboque)' AND user_id = v_user_id ORDER BY created_at DESC LIMIT 1;
SELECT id INTO v_veiculo_bitruck FROM vehicles WHERE tipo = 'Bitruck 8x2' AND user_id = v_user_id ORDER BY created_at DESC LIMIT 1;

-- ROTAS
INSERT INTO routes (id, user_id, origem, destino, distancia_km, tempo_estimado_h, valor_pedagio) VALUES
  (gen_random_uuid(), v_user_id, 'São Paulo - SP', 'Campinas - SP', 98, 1.5, 24.80),
  (gen_random_uuid(), v_user_id, 'São Paulo - SP', 'Santos - SP', 78, 1.3, 18.60),
  (gen_random_uuid(), v_user_id, 'São Paulo - SP', 'Sorocaba - SP', 102, 1.7, 15.40),
  (gen_random_uuid(), v_user_id, 'São Paulo - SP', 'Ribeirão Preto - SP', 315, 4.5, 42.30),
  (gen_random_uuid(), v_user_id, 'São Paulo - SP', 'Rio de Janeiro - RJ', 436, 6.5, 78.90),
  (gen_random_uuid(), v_user_id, 'São Paulo - SP', 'Belo Horizonte - MG', 586, 8.5, 95.60),
  (gen_random_uuid(), v_user_id, 'São Paulo - SP', 'Curitiba - PR', 408, 6.0, 68.40),
  (gen_random_uuid(), v_user_id, 'Rio de Janeiro - RJ', 'Belo Horizonte - MG', 434, 6.5, 82.50),
  (gen_random_uuid(), v_user_id, 'São Paulo - SP', 'Brasília - DF', 1015, 14.5, 156.80),
  (gen_random_uuid(), v_user_id, 'São Paulo - SP', 'Salvador - BA', 1962, 28.0, 245.00),
  (gen_random_uuid(), v_user_id, 'Campinas - SP', 'Santos - SP', 145, 2.3, 28.40),
  (gen_random_uuid(), v_user_id, 'São Paulo - SP', 'Guarulhos - SP', 25, 0.5, 0.00);

SELECT id INTO v_rota_sp_rj FROM routes WHERE origem = 'São Paulo - SP' AND destino = 'Rio de Janeiro - RJ' AND user_id = v_user_id ORDER BY created_at DESC LIMIT 1;
SELECT id INTO v_rota_sp_mg FROM routes WHERE origem = 'São Paulo - SP' AND destino = 'Belo Horizonte - MG' AND user_id = v_user_id ORDER BY created_at DESC LIMIT 1;
SELECT id INTO v_rota_sp_campinas FROM routes WHERE origem = 'São Paulo - SP' AND destino = 'Campinas - SP' AND user_id = v_user_id ORDER BY created_at DESC LIMIT 1;
SELECT id INTO v_rota_sp_santos FROM routes WHERE origem = 'São Paulo - SP' AND destino = 'Santos - SP' AND user_id = v_user_id ORDER BY created_at DESC LIMIT 1;

-- CUSTOS FIXOS
INSERT INTO custos_fixos (user_id, nome, valor_mensal, ativo) VALUES
  (v_user_id, 'Aluguel do Galpão/Garagem', 8500.00, true),
  (v_user_id, 'Salários Administrativos', 15000.00, true),
  (v_user_id, 'Salários Motoristas (Base)', 28000.00, true),
  (v_user_id, 'IPVA Total da Frota', 4200.00, true),
  (v_user_id, 'Seguro da Frota', 6800.00, true),
  (v_user_id, 'Licenciamento e Taxas', 1200.00, true),
  (v_user_id, 'Contador e Serviços Jurídicos', 2500.00, true),
  (v_user_id, 'Energia Elétrica e Água', 1800.00, true),
  (v_user_id, 'Telefone e Internet', 850.00, true),
  (v_user_id, 'Material de Escritório', 400.00, true);

-- CUSTOS VARIÁVEIS
INSERT INTO custos_variaveis (user_id, nome, valor_por_km, ativo) VALUES
  (v_user_id, 'Pneus (Desgaste)', 0.12, true),
  (v_user_id, 'Manutenção Preventiva', 0.18, true),
  (v_user_id, 'Óleo Lubrificante', 0.08, true),
  (v_user_id, 'Filtros', 0.05, true),
  (v_user_id, 'Lavagem de Veículo', 0.03, true),
  (v_user_id, 'CRLV e Documentação', 0.02, true),
  (v_user_id, 'Peças e Reparos', 0.22, true),
  (v_user_id, 'Arla 32 (Diesel S10)', 0.09, true),
  (v_user_id, 'Seguro de Carga (Variável)', 0.15, true),
  (v_user_id, 'Vale Refeição Motorista', 0.07, true);

-- CUSTOS DE VEÍCULOS ESPECÍFICOS
IF v_veiculo_carreta IS NOT NULL THEN
  INSERT INTO custos_veiculo (user_id, veiculo_id, nome, valor_mensal, ativo) VALUES
    (v_user_id, v_veiculo_carreta, 'Financiamento Carreta', 4800.00, true),
    (v_user_id, v_veiculo_carreta, 'Seguro Carreta Premium', 1200.00, true);
END IF;

IF v_veiculo_truck IS NOT NULL THEN
  INSERT INTO custos_veiculo (user_id, veiculo_id, nome, valor_mensal, ativo) VALUES
    (v_user_id, v_veiculo_truck, 'Rastreador e Telemetria', 180.00, true);
END IF;

-- CARGAS
INSERT INTO cargo (id, user_id, name, type, weight, value, status, description) VALUES
  (gen_random_uuid(), v_user_id, 'Eletrônicos Importados', 'fragile', 8.5, 85000.00, 'active', 'Notebooks, tablets e smartphones'),
  (gen_random_uuid(), v_user_id, 'Alimentos Perecíveis', 'perishable', 12.0, 18000.00, 'active', 'Laticínios e frios'),
  (gen_random_uuid(), v_user_id, 'Material de Construção', 'general', 18.5, 12000.00, 'active', 'Cimento e argamassa'),
  (gen_random_uuid(), v_user_id, 'Medicamentos', 'fragile', 3.2, 45000.00, 'active', 'Remédios controlados'),
  (gen_random_uuid(), v_user_id, 'Autopeças', 'general', 15.8, 28000.00, 'active', 'Peças originais para montadoras'),
  (gen_random_uuid(), v_user_id, 'Roupas e Têxteis', 'general', 6.5, 22000.00, 'active', 'Vestuário para varejo'),
  (gen_random_uuid(), v_user_id, 'Equipamentos Industriais', 'fragile', 22.0, 95000.00, 'active', 'Máquinas e ferramentas'),
  (gen_random_uuid(), v_user_id, 'Produtos Químicos', 'dangerous', 14.5, 32000.00, 'active', 'Produtos de limpeza'),
  (gen_random_uuid(), v_user_id, 'Bebidas (Paletes)', 'general', 20.0, 15000.00, 'active', 'Refrigerantes e sucos'),
  (gen_random_uuid(), v_user_id, 'Móveis Desmontados', 'general', 10.5, 24000.00, 'active', 'Móveis corporativos');

SELECT id INTO v_cargo_eletronicos FROM cargo WHERE name = 'Eletrônicos Importados' AND user_id = v_user_id ORDER BY created_at DESC LIMIT 1;
SELECT id INTO v_cargo_alimentos FROM cargo WHERE name = 'Alimentos Perecíveis' AND user_id = v_user_id ORDER BY created_at DESC LIMIT 1;

-- VIAGENS (Status corretos: Planejada, Em_Andamento, Concluída)
IF v_veiculo_truck IS NOT NULL AND v_rota_sp_campinas IS NOT NULL AND v_cargo_eletronicos IS NOT NULL THEN
  INSERT INTO trips (user_id, vehicle_id, route_id, cargo_id, start_date, end_date, status, peso_ton, receita, consumo_combustivel_l, custo_combustivel, custo_variaveis, custo_pedagios, custo_fixo_rateado, custo_total_estimado, tempo_estimado_h, observacoes)
  VALUES (v_user_id, v_veiculo_truck, v_rota_sp_campinas, v_cargo_eletronicos, '2024-01-15', '2024-01-15', 'Concluída', 8.5, 1200.00, 13.1, 81.22, 98.00, 24.80, 180.00, 384.02, 1.5, 'Viagem tranquila'),
         (v_user_id, v_veiculo_truck, v_rota_sp_rj, NULL, '2024-01-10', '2024-01-11', 'Concluída', 13.5, 2600.00, 83.8, 519.56, 436.00, 78.90, 480.00, 1514.46, 6.5, 'Cliente satisfeito'),
         (v_user_id, v_veiculo_truck, v_rota_sp_mg, NULL, '2024-01-05', '2024-01-06', 'Concluída', 12.5, 3400.00, 112.7, 698.74, 586.00, 95.60, 550.00, 1930.34, 8.5, 'Sem problemas');
END IF;

IF v_veiculo_carreta IS NOT NULL AND v_rota_sp_rj IS NOT NULL AND v_cargo_alimentos IS NOT NULL THEN
  INSERT INTO trips (user_id, vehicle_id, route_id, cargo_id, start_date, end_date, status, peso_ton, receita, consumo_combustivel_l, custo_combustivel, custo_variaveis, custo_pedagios, custo_fixo_rateado, custo_total_estimado, tempo_estimado_h, observacoes)
  VALUES (v_user_id, v_veiculo_carreta, v_rota_sp_rj, v_cargo_alimentos, '2024-01-18', '2024-01-19', 'Concluída', 12.0, 2800.00, 114.7, 711.14, 436.00, 78.90, 520.00, 1746.04, 6.5, 'Entrega no prazo'),
         (v_user_id, v_veiculo_carreta, v_rota_sp_rj, NULL, '2024-01-30', '2024-01-31', 'Planejada', 25.0, 3200.00, 114.7, 711.14, 436.00, 78.90, 520.00, 1746.04, 6.5, 'Aguardando liberação'),
         (v_user_id, v_veiculo_carreta, v_rota_sp_mg, NULL, '2024-01-27', '2024-01-28', 'Em_Andamento', 26.5, 3600.00, 130.2, 807.24, 586.00, 95.60, 580.00, 2068.84, 8.5, 'Conforme planejado');
END IF;

IF v_veiculo_bitruck IS NOT NULL AND v_rota_sp_mg IS NOT NULL AND v_rota_sp_campinas IS NOT NULL THEN
  INSERT INTO trips (user_id, vehicle_id, route_id, start_date, end_date, status, peso_ton, receita, consumo_combustivel_l, custo_combustivel, custo_variaveis, custo_pedagios, custo_fixo_rateado, custo_total_estimado, tempo_estimado_h, observacoes)
  VALUES 
    (v_user_id, v_veiculo_bitruck, v_rota_sp_mg, '2024-01-25', '2024-01-26', 'Em_Andamento', 18.0, 3500.00, 130.2, 807.24, 586.00, 95.60, 580.00, 2068.84, 8.5, 'Previsão chegada 26/01'),
    (v_user_id, v_veiculo_bitruck, v_rota_sp_campinas, '2024-01-08', '2024-01-08', 'Concluída', 20.0, 1100.00, 21.8, 135.16, 98.00, 24.80, 200.00, 457.96, 1.5, 'Carga completa'),
    (v_user_id, v_veiculo_bitruck, v_rota_sp_campinas, '2024-01-20', '2024-01-20', 'Concluída', 22.5, 1350.00, 21.8, 135.16, 98.00, 24.80, 200.00, 457.96, 1.5, 'Entrega expressa');
END IF;

IF v_veiculo_toco IS NOT NULL AND v_rota_sp_santos IS NOT NULL THEN
  INSERT INTO trips (user_id, vehicle_id, route_id, start_date, end_date, status, peso_ton, receita, consumo_combustivel_l, custo_combustivel, custo_variaveis, custo_pedagios, custo_fixo_rateado, custo_total_estimado, tempo_estimado_h, observacoes)
  VALUES 
    (v_user_id, v_veiculo_toco, v_rota_sp_santos, '2024-01-28', '2024-01-28', 'Planejada', 4.5, 950.00, 10.4, 64.48, 78.00, 18.60, 150.00, 311.08, 1.3, 'Aguardando carga'),
    (v_user_id, v_veiculo_toco, v_rota_sp_santos, '2024-01-26', '2024-01-26', 'Em_Andamento', 4.8, 880.00, 10.4, 64.48, 78.00, 18.60, 150.00, 311.08, 1.3, 'Em trânsito');
END IF;

END $$;