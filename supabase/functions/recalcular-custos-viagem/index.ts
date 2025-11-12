import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { calcularCustos } from '../_shared/calculos.ts'
import {
  fetchTripData,
  fetchVehicleData,
  fetchRouteData,
  fetchGlobalParameters,
  fetchVehicleCosts,
} from '../_shared/data-fetchers.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: req.headers.get('Authorization')! } }
      }
    )

    const { viagemId } = await req.json()

    if (!viagemId) {
      return new Response(
        JSON.stringify({ error: 'ID da viagem é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get current user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Usuário não autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Recalculando custos para viagem:', viagemId)

    // Fetch all required data
    const trip = await fetchTripData(supabaseClient, viagemId, user.id)
    const vehicle = await fetchVehicleData(supabaseClient, trip.vehicle_id)
    const route = await fetchRouteData(supabaseClient, trip.route_id)
    const params = await fetchGlobalParameters(supabaseClient, user.id)
    const vehicleCosts = await fetchVehicleCosts(supabaseClient, user.id, trip.vehicle_id)
    
    // Use simplified cost model - no variable/fixed costs, tolls from route
    const variableCosts: any[] = []
    const fixedCosts: any[] = []
    const tolls = route.valor_pedagio ? [{ valor: route.valor_pedagio }] : []

    // Perform calculations using shared function
    const resultado = calcularCustos({
      distanciaKm: Number(route.distancia_km) || 0,
      kmPorLitro: Number(vehicle.km_por_litro) || 1,
      precoDieselLitro: Number(params.preco_diesel_litro) || 0,
      velocidadeMediaKmh: Number(params.velocidade_media_kmh) || 60,
      custosVariaveis: variableCosts,
      pedagios: tolls,
      custosFixos: fixedCosts,
      custosVeiculo: vehicleCosts,
      pesoTon: trip.peso_ton,
      receita: trip.receita,
    })

    // Update trip with calculated values
    const { error: updateError } = await supabaseClient
      .from('trips')
      .update({
        consumo_combustivel_l: resultado.consumoCombustivelL,
        custo_combustivel: resultado.custoCombustivel,
        custo_variaveis: resultado.custoVariaveis,
        custo_pedagios: resultado.custoPedagios,
        custo_fixo_rateado: resultado.custoFixoRateado,
        custo_total_estimado: resultado.custoTotal,
        tempo_estimado_h: resultado.tempoEstimadoH,
        updated_at: new Date().toISOString()
      })
      .eq('id', viagemId)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Erro ao atualizar viagem:', updateError)
      return new Response(
        JSON.stringify({ error: 'Erro ao atualizar cálculos da viagem' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Cálculos atualizados com sucesso para viagem:', viagemId)

    return new Response(
      JSON.stringify({ 
        message: 'Cálculos atualizados com sucesso',
        calculations: {
          consumo_combustivel_l: resultado.consumoCombustivelL,
          custo_combustivel: resultado.custoCombustivel,
          custo_variaveis: resultado.custoVariaveis,
          custo_pedagios: resultado.custoPedagios,
          custo_fixo_rateado: resultado.custoFixoRateado,
          custo_total_estimado: resultado.custoTotal,
          tempo_estimado_h: resultado.tempoEstimadoH
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro interno:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})