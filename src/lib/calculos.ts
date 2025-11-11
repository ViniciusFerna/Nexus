/**
 * Shared calculation logic for frontend
 */

export interface CalculationInput {
  distanciaKm: number;
  kmPorLitro: number;
  precoDieselLitro: number;
  velocidadeMediaKmh: number;
  custosVariaveis: Array<{ valor_por_km: number }>;
  pedagios: Array<{ valor: number }>;
  custosFixos: Array<{ valor_mensal: number }>;
  entregasNaRota?: number;
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
}

export function calcularCustos(input: CalculationInput): CalculationResult {
  // 1. Fuel consumption
  const consumoCombustivelL = input.distanciaKm / input.kmPorLitro;

  // 2. Fuel cost
  const custoCombustivel = consumoCombustivelL * input.precoDieselLitro;

  // 3. Variable costs
  const somaCustosVariaveis = input.custosVariaveis.reduce(
    (sum, custo) => sum + Number(custo.valor_por_km),
    0
  );
  const custoVariaveis = somaCustosVariaveis * input.distanciaKm;

  // 4. Tolls
  const custoPedagios = input.pedagios.reduce(
    (sum, pedagio) => sum + Number(pedagio.valor),
    0
  );

  // 5. Daily fixed cost
  const somaCustosFixos = input.custosFixos.reduce(
    (sum, custo) => sum + Number(custo.valor_mensal),
    0
  );
  const custoFixoRateado = somaCustosFixos / 30;

  // 6. Total cost
  const custoTotal = custoCombustivel + custoVariaveis + custoPedagios + custoFixoRateado;

  // 7. Estimated time
  const tempoEstimadoH = input.distanciaKm / input.velocidadeMediaKmh;

  // 8. Cost per delivery
  const custoPorEntrega = input.entregasNaRota
    ? custoTotal / input.entregasNaRota
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
  };
}
