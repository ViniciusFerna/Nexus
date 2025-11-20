/**
 * Shared calculation logic for trip costs
 */

export interface CalculationInput {
  distanciaKm: number;
  kmPorLitro: number;
  precoDieselLitro: number;
  velocidadeMediaKmh: number;
  custosVariaveis: Array<{ valor_por_km: number }>;
  pedagios: Array<{ valor: number }>;
  custosFixos: Array<{ valor_mensal: number }>;
  custosVeiculo: Array<{ valor_mensal: number }>;
  entregasNaRota?: number;
  custoExtra?: number;
  pesoTon?: number;
  receita?: number;
}

export interface CalculationResult {
  consumoCombustivelL: number;
  custoCombustivel: number;
  custoVariaveis: number;
  custoPedagios: number;
  custoFixoRateado: number;
  custoTotal: number;
  custoPorEntrega?: number;
  custoPorTonKm?: number;
  margemLucro?: number;
  tempoEstimadoH: number;
}

export function calcularCustos(input: CalculationInput): CalculationResult {
  // 1. Fuel consumption (L) = distance_km / km_per_liter
  const consumoCombustivelL = input.distanciaKm / input.kmPorLitro;

  // 2. Fuel cost = consumption × diesel_price_per_liter
  const custoCombustivel = consumoCombustivelL * input.precoDieselLitro;

  // 3. Variable costs per km (R$)
  const somaCustosVariaveisPorKm = input.custosVariaveis.reduce(
    (sum, custo) => sum + Number(custo.valor_por_km),
    0
  );
  const custoVariaveis = somaCustosVariaveisPorKm * input.distanciaKm;

  // 4. Tolls (R$)
  const custoPedagios = input.pedagios.reduce(
    (sum, pedagio) => sum + Number(pedagio.valor),
    0
  );

  // 5. Estimated time (h)
  const tempoEstimadoH = input.distanciaKm / input.velocidadeMediaKmh;

  // 6. Prorated fixed costs (CORRECTED: considers trip duration)
  // Monthly fixed costs (general + vehicle-specific)
  const somaCustosFixosMensais = input.custosFixos.reduce(
    (sum, custo) => sum + Number(custo.valor_mensal),
    0
  );
  
  const somaCustosVeiculoMensais = input.custosVeiculo.reduce(
    (sum, custo) => sum + Number(custo.valor_mensal),
    0
  );

  const custoFixoMensalTotal = somaCustosFixosMensais + somaCustosVeiculoMensais;
  
  // Prorate proportional to trip days
  const diasViagem = tempoEstimadoH / 24;
  const custoFixoRateado = (custoFixoMensalTotal / 30) * diasViagem;

  // 7. Extra cost (if any)
  const custoExtra = Number(input.custoExtra) || 0;

  // 8. Total cost (R$)
  const custoTotal = 
    custoCombustivel + 
    custoVariaveis + 
    custoPedagios + 
    custoFixoRateado + 
    custoExtra;

  // 9. Additional metrics
  const custoPorEntrega = input.entregasNaRota && input.entregasNaRota > 0
    ? custoTotal / input.entregasNaRota
    : undefined;

  const custoPorTonKm = input.pesoTon && input.pesoTon > 0
    ? custoTotal / (input.pesoTon * input.distanciaKm)
    : undefined;

  const margemLucro = input.receita && input.receita > 0
    ? ((input.receita - custoTotal) / input.receita) * 100
    : undefined;

  return {
    consumoCombustivelL: Number(consumoCombustivelL.toFixed(2)),
    custoCombustivel: Number(custoCombustivel.toFixed(2)),
    custoVariaveis: Number(custoVariaveis.toFixed(2)),
    custoPedagios: Number(custoPedagios.toFixed(2)),
    custoFixoRateado: Number(custoFixoRateado.toFixed(2)),
    custoTotal: Number(custoTotal.toFixed(2)),
    custoPorEntrega: custoPorEntrega ? Number(custoPorEntrega.toFixed(2)) : undefined,
    custoPorTonKm: custoPorTonKm ? Number(custoPorTonKm.toFixed(2)) : undefined,
    margemLucro: margemLucro ? Number(margemLucro.toFixed(2)) : undefined,
    tempoEstimadoH: Number(tempoEstimadoH.toFixed(2)),
  };
}
