import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function fetchTripData(
  supabaseClient: SupabaseClient,
  tripId: string,
  userId: string
) {
  const { data, error } = await supabaseClient
    .from('trips')
    .select('id, vehicle_id, route_id, peso_ton, receita')
    .eq('id', tripId)
    .eq('user_id', userId)
    .single();

  if (error) throw new Error(`Failed to fetch trip: ${error.message}`);
  if (!data) throw new Error('Trip not found');

  return data;
}

export async function fetchVehicleData(
  supabaseClient: SupabaseClient,
  vehicleId: string
) {
  const { data, error } = await supabaseClient
    .from('vehicles')
    .select('km_por_litro, capacidade_ton')
    .eq('id', vehicleId)
    .single();

  if (error) throw new Error(`Failed to fetch vehicle: ${error.message}`);
  if (!data) throw new Error('Vehicle not found');

  return data;
}

export async function fetchRouteData(
  supabaseClient: SupabaseClient,
  routeId: string
) {
  const { data, error } = await supabaseClient
    .from('routes')
    .select('id, distancia_km, valor_pedagio')
    .eq('id', routeId)
    .single();

  if (error) throw new Error(`Failed to fetch route: ${error.message}`);
  if (!data) throw new Error('Route not found');

  return data;
}

export async function fetchGlobalParameters(
  supabaseClient: SupabaseClient,
  userId: string
) {
  const { data, error } = await supabaseClient
    .from('parametros_globais')
    .select('preco_diesel_litro, velocidade_media_kmh')
    .eq('user_id', userId)
    .maybeSingle();

  // Return default values if no parameters found
  if (!data) {
    return {
      preco_diesel_litro: 6.0,
      velocidade_media_kmh: 60
    };
  }

  if (error) throw new Error(`Failed to fetch global parameters: ${error.message}`);

  return data;
}

export async function fetchActiveCosts(
  supabaseClient: SupabaseClient,
  userId: string
) {
  const [variableCostsResult, fixedCostsResult] = await Promise.all([
    supabaseClient
      .from('custos_variaveis')
      .select('valor_por_km')
      .eq('user_id', userId)
      .eq('ativo', true),
    supabaseClient
      .from('custos_fixos')
      .select('valor_mensal')
      .eq('user_id', userId)
      .eq('ativo', true),
  ]);

  if (variableCostsResult.error) {
    throw new Error(`Failed to fetch variable costs: ${variableCostsResult.error.message}`);
  }
  if (fixedCostsResult.error) {
    throw new Error(`Failed to fetch fixed costs: ${fixedCostsResult.error.message}`);
  }

  return {
    variableCosts: variableCostsResult.data || [],
    fixedCosts: fixedCostsResult.data || [],
  };
}

export async function fetchVehicleCosts(
  supabaseClient: SupabaseClient,
  userId: string,
  vehicleId: string
) {
  const { data, error } = await supabaseClient
    .from('custos_veiculo')
    .select('valor_mensal')
    .eq('user_id', userId)
    .eq('veiculo_id', vehicleId)
    .eq('ativo', true);

  if (error) throw new Error(`Failed to fetch vehicle costs: ${error.message}`);

  return data || [];
}

export async function fetchRouteTolls(
  supabaseClient: SupabaseClient,
  userId: string,
  routeId: string
) {
  const { data, error } = await supabaseClient
    .from('pedagios')
    .select('valor')
    .eq('user_id', userId)
    .eq('rota_id', routeId);

  if (error) throw new Error(`Failed to fetch tolls: ${error.message}`);

  return data || [];
}
