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
  custoVarExtraPorKm?: number;
  pedagogiosExtra?: number;
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
  tempoEstimadoH: number;
  custoPorToneladaKm?: number;
  margem?: number;
}

export function calcularCustos(input: CalculationInput): CalculationResult {
  // 1. Fuel consumption (L) = distance_km / km_per_liter
  const consumoCombustivelL = input.distanciaKm / input.kmPorLitro;

  // 2. Fuel cost = consumption × diesel_price_per_liter
  const custoCombustivel = consumoCombustivelL * input.precoDieselLitro;

  // 3. Variable costs = (sum of active variable costs per km + extra) × distance_km
  const somaCustosVariaveis = input.custosVariaveis.reduce(
    (sum, custo) => sum + Number(custo.valor_por_km),
    0
  );
  const custoVariaveis = (somaCustosVariaveis + (input.custoVarExtraPorKm || 0)) * input.distanciaKm;

  // 4. Tolls = sum of tolls for the route + extra
  const somaPedagios = input.pedagios.reduce(
    (sum, pedagio) => sum + Number(pedagio.valor),
    0
  );
  const custoPedagios = somaPedagios + (input.pedagogiosExtra || 0);

  // 5. Daily fixed cost = (sum of active monthly fixed costs / 30) + (sum of vehicle costs / 30)
  const somaCustosFixos = input.custosFixos.reduce(
    (sum, custo) => sum + Number(custo.valor_mensal),
    0
  );
  const somaCustosVeiculo = input.custosVeiculo.reduce(
    (sum, custo) => sum + Number(custo.valor_mensal),
    0
  );
  const custoFixoRateado = (somaCustosFixos + somaCustosVeiculo) / 30;

  // 6. Total cost
  const custoTotal = custoCombustivel + custoVariaveis + custoPedagios + custoFixoRateado;

  // 7. Estimated time (h) = distance_km / average_speed_kmh
  const tempoEstimadoH = input.distanciaKm / input.velocidadeMediaKmh;

  // 8. Cost per delivery (optional)
  const custoPorEntrega = input.entregasNaRota
    ? custoTotal / input.entregasNaRota
    : undefined;

  // 9. Cost per ton-km (optional)
  const custoPorToneladaKm = input.pesoTon && input.pesoTon > 0
    ? custoTotal / (input.pesoTon * input.distanciaKm)
    : undefined;

  // 10. Profit margin (optional)
  const margem = input.receita && input.receita > 0
    ? ((input.receita - custoTotal) / input.receita) * 100
    : undefined;

  return {
    consumoCombustivelL,
    custoCombustivel,
    custoVariaveis,
    custoPedagios,
    custoFixoRateado,
    custoTotal,
    custoPorEntrega,
    tempoEstimadoH,
    custoPorToneladaKm,
    margem,
  };
}
