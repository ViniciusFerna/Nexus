-- ============================================
-- SEED SCRIPT - Dados de Exemplo
-- ============================================
-- Este script popula o banco com dados de exemplo para testes
-- Execute este script no SQL Editor do Supabase após fazer login

-- Nota: Este script usa auth.uid() para associar dados ao usuário logado
-- Certifique-se de estar autenticado antes de executar

-- Limpar dados existentes (opcional - remova o comentário se quiser limpar antes)
-- DELETE FROM public.simulacoes WHERE user_id = auth.uid();
-- DELETE FROM public.pedagios WHERE user_id = auth.uid();
-- DELETE FROM public.trips WHERE user_id = auth.uid();
-- DELETE FROM public.custos_variaveis WHERE user_id = auth.uid();
-- DELETE FROM public.custos_fixos WHERE user_id = auth.uid();
-- DELETE FROM public.vehicles WHERE user_id = auth.uid();
-- DELETE FROM public.routes WHERE user_id = auth.uid();
-- DELETE FROM public.parametros_globais WHERE user_id = auth.uid();

-- ============================================
-- 1. PARÂMETROS GLOBAIS
-- ============================================
INSERT INTO public.parametros_globais (user_id, preco_diesel_litro, velocidade_media_kmh, moeda)
VALUES (auth.uid(), 6.50, 65, 'R$')
ON CONFLICT (user_id) DO UPDATE SET
  preco_diesel_litro = 6.50,
  velocidade_media_kmh = 65;

-- ============================================
-- 2. VEÍCULOS (8 veículos variados)
-- ============================================
INSERT INTO public.vehicles (user_id, tipo, capacidade_ton, km_por_litro, custo_por_km, status) VALUES
(auth.uid(), 'Van Furgão 3/4', 1.5, 8.5, 2.80, 'Disponível'),
(auth.uid(), 'Caminhão Toco 3/4', 5.0, 5.2, 4.50, 'Disponível'),
(auth.uid(), 'Caminhão Truck', 14.0, 3.8, 6.20, 'Disponível'),
(auth.uid(), 'Carreta Simples', 27.0, 2.5, 8.50, 'Disponível'),
(auth.uid(), 'Carreta LS (Bi-trem)', 45.0, 2.2, 11.00, 'Disponível'),
(auth.uid(), 'Van Sprinter', 2.0, 9.0, 2.50, 'Em manutenção'),
(auth.uid(), 'Caminhão VUC', 3.0, 6.5, 3.80, 'Disponível'),
(auth.uid(), 'Carreta Refrigerada', 25.0, 2.3, 9.80, 'Disponível');

-- ============================================
-- 3. ROTAS (10 rotas com distâncias variadas)
-- ============================================
INSERT INTO public.routes (user_id, origem, destino, distancia_km, tempo_estimado_h) VALUES
(auth.uid(), 'São Paulo - SP', 'Rio de Janeiro - RJ', 430, 6.5),
(auth.uid(), 'São Paulo - SP', 'Belo Horizonte - MG', 586, 9.0),
(auth.uid(), 'São Paulo - SP', 'Curitiba - PR', 408, 6.3),
(auth.uid(), 'Rio de Janeiro - RJ', 'Vitória - ES', 521, 8.0),
(auth.uid(), 'São Paulo - SP', 'Brasília - DF', 1015, 15.6),
(auth.uid(), 'Curitiba - PR', 'Florianópolis - SC', 300, 4.6),
(auth.uid(), 'Porto Alegre - RS', 'Curitiba - PR', 711, 10.9),
(auth.uid(), 'Belo Horizonte - MG', 'Salvador - BA', 1372, 21.1),
(auth.uid(), 'São Paulo - SP', 'Campinas - SP', 96, 1.5),
(auth.uid(), 'Brasília - DF', 'Goiânia - GO', 209, 3.2);

-- ============================================
-- 4. CUSTOS FIXOS
-- ============================================
INSERT INTO public.custos_fixos (user_id, nome, valor_mensal, ativo) VALUES
(auth.uid(), 'IPVA e Licenciamento', 2500.00, true),
(auth.uid(), 'Seguro Frota', 4800.00, true),
(auth.uid(), 'Salários Motoristas', 18000.00, true),
(auth.uid(), 'Aluguel Garagem', 3200.00, true),
(auth.uid(), 'Rastreamento Veículos', 890.00, true);

-- ============================================
-- 5. CUSTOS VARIÁVEIS
-- ============================================
INSERT INTO public.custos_variaveis (user_id, nome, valor_por_km, ativo) VALUES
(auth.uid(), 'Manutenção Preventiva', 0.35, true),
(auth.uid(), 'Pneus e Desgaste', 0.28, true),
(auth.uid(), 'Lubrificantes', 0.12, true),
(auth.uid(), 'Alimentação Motorista', 0.45, true);

-- ============================================
-- 6. PEDÁGIOS (distribuídos nas rotas)
-- ============================================
INSERT INTO public.pedagios (user_id, rota_id, descricao, valor) 
SELECT 
  auth.uid(),
  r.id,
  'Pedágio ' || r.origem || ' - ' || r.destino,
  CASE 
    WHEN r.distancia_km < 200 THEN 15.50
    WHEN r.distancia_km < 500 THEN 42.80
    WHEN r.distancia_km < 800 THEN 78.30
    ELSE 125.60
  END
FROM public.routes r
WHERE r.user_id = auth.uid()
LIMIT 10;

-- ============================================
-- 7. VIAGENS (12 viagens em meses diferentes)
-- ============================================
WITH vehicle_route_pairs AS (
  SELECT 
    v.id as vehicle_id,
    r.id as route_id,
    v.capacidade_ton,
    r.distancia_km,
    r.tempo_estimado_h,
    ROW_NUMBER() OVER () as rn
  FROM public.vehicles v
  CROSS JOIN public.routes r
  WHERE v.user_id = auth.uid() AND r.user_id = auth.uid()
  LIMIT 12
)
INSERT INTO public.trips (
  user_id, vehicle_id, route_id, start_date, end_date, 
  peso_ton, volume_m3, status, consumo_combustivel_l, 
  custo_combustivel, custo_variaveis, custo_pedagios, 
  custo_fixo_rateado, custo_total_estimado, tempo_estimado_h, 
  receita, observacoes
)
SELECT
  auth.uid(),
  vehicle_id,
  route_id,
  CURRENT_DATE - INTERVAL '1 day' * (rn * 25),
  CURRENT_DATE - INTERVAL '1 day' * (rn * 25) + INTERVAL '1 day' * CEIL(tempo_estimado_h / 24),
  capacidade_ton * 0.75,
  capacidade_ton * 2.5,
  CASE 
    WHEN rn <= 4 THEN 'Concluída'
    WHEN rn <= 8 THEN 'Em andamento'
    ELSE 'Planejada'
  END,
  distancia_km * 0.35,
  distancia_km * 0.35 * 6.50,
  distancia_km * 1.20,
  CASE WHEN distancia_km < 500 THEN 42.80 ELSE 125.60 END,
  850.00,
  distancia_km * 2.80 + 850.00,
  tempo_estimado_h,
  distancia_km * 4.50,
  'Viagem criada pelo script de seed'
FROM vehicle_route_pairs;

-- ============================================
-- 8. SIMULAÇÕES (3 simulações exemplo)
-- ============================================
WITH base_trips AS (
  SELECT 
    t.id as trip_id,
    t.route_id,
    t.vehicle_id,
    r.distancia_km,
    v.km_por_litro,
    ROW_NUMBER() OVER () as rn
  FROM public.trips t
  JOIN public.routes r ON t.route_id = r.id
  JOIN public.vehicles v ON t.vehicle_id = v.id
  WHERE t.user_id = auth.uid()
  LIMIT 3
)
INSERT INTO public.simulacoes (
  user_id, viagem_base_id, nome_cenario,
  preco_diesel_litro, km_por_litro, velocidade_media_kmh,
  entregas_na_rota, custo_var_extra_por_km, pedagios_extra,
  ocupacao_pct, consumo_combustivel_l, custo_combustivel,
  custo_variaveis, custo_pedagios, custo_fixo_rateado,
  custo_total, custo_por_entrega, custo_por_tonelada_km,
  margem, tempo_estimado_h
)
SELECT
  auth.uid(),
  trip_id,
  CASE rn
    WHEN 1 THEN 'Cenário Otimista - Diesel Barato'
    WHEN 2 THEN 'Cenário Realista - Condições Normais'
    ELSE 'Cenário Pessimista - Diesel Caro'
  END,
  CASE rn WHEN 1 THEN 5.80 WHEN 2 THEN 6.50 ELSE 7.20 END,
  km_por_litro,
  65.0,
  CASE rn WHEN 1 THEN 8 WHEN 2 THEN 5 ELSE 3 END,
  CASE rn WHEN 1 THEN 0.50 WHEN 2 THEN 1.20 ELSE 1.80 END,
  CASE rn WHEN 1 THEN 0.00 WHEN 2 THEN 42.80 ELSE 85.60 END,
  CASE rn WHEN 1 THEN 95.0 WHEN 2 THEN 80.0 ELSE 65.0 END,
  distancia_km / km_por_litro,
  (distancia_km / km_por_litro) * CASE rn WHEN 1 THEN 5.80 WHEN 2 THEN 6.50 ELSE 7.20 END,
  distancia_km * 1.20,
  CASE rn WHEN 1 THEN 42.80 WHEN 2 THEN 42.80 ELSE 85.60 END,
  850.00,
  distancia_km * 2.80 + 850.00,
  (distancia_km * 2.80 + 850.00) / CASE rn WHEN 1 THEN 8 WHEN 2 THEN 5 ELSE 3 END,
  distancia_km * 2.80 / 20.0,
  15.5,
  distancia_km / 65.0
FROM base_trips;

-- ============================================
-- VERIFICAÇÃO DOS DADOS INSERIDOS
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Seed concluído com sucesso!';
  RAISE NOTICE '📊 Dados inseridos para o usuário: %', auth.uid();
  RAISE NOTICE '🚛 Veículos: % registros', (SELECT COUNT(*) FROM public.vehicles WHERE user_id = auth.uid());
  RAISE NOTICE '🗺️  Rotas: % registros', (SELECT COUNT(*) FROM public.routes WHERE user_id = auth.uid());
  RAISE NOTICE '📦 Viagens: % registros', (SELECT COUNT(*) FROM public.trips WHERE user_id = auth.uid());
  RAISE NOTICE '🎯 Simulações: % registros', (SELECT COUNT(*) FROM public.simulacoes WHERE user_id = auth.uid());
  RAISE NOTICE '💰 Pedágios: % registros', (SELECT COUNT(*) FROM public.pedagios WHERE user_id = auth.uid());
END $$;
