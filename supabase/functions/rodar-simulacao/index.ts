import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { calcularCustos } from '../_shared/calculos.ts'
import {
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
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create client with user auth for checking simulation ownership
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Create service role client for fetching base trip (bypasses RLS)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { simulacao_id } = await req.json()
    console.log('Running simulation for ID:', simulacao_id)

    if (!simulacao_id) {
      return new Response(
        JSON.stringify({ error: 'simulacao_id is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Get simulation data
    const { data: simulacao, error: simError } = await supabaseClient
      .from('simulacoes')
      .select('*')
      .eq('id', simulacao_id)
      .single()

    if (simError || !simulacao) {
      console.error('Error fetching simulation:', simError)
      return new Response(
        JSON.stringify({ error: 'Simulation not found' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404 
        }
      )
    }

    // Get base trip data with relations using admin client (bypasses RLS)
    const { data: viagem, error: viagemError } = await supabaseAdmin
      .from('trips')
      .select('*')
      .eq('id', simulacao.viagem_base_id)
      .single()

    if (viagemError || !viagem) {
      console.error('Error fetching base trip:', viagemError)
      return new Response(
        JSON.stringify({ error: 'Base trip not found' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404 
        }
      )
    }

    // Fetch all required data
    const rota = await fetchRouteData(supabaseAdmin, viagem.route_id)
    const veiculo = await fetchVehicleData(supabaseAdmin, viagem.vehicle_id)
    const parametros = await fetchGlobalParameters(supabaseClient, simulacao.user_id)
    const custosVeiculo = await fetchVehicleCosts(supabaseClient, simulacao.user_id, viagem.vehicle_id)
    
    // Use simplified cost model - no variable/fixed costs, tolls from route
    const custosVariaveis: any[] = []
    const custosFixos: any[] = []
    const pedagios = rota.valor_pedagio ? [{ valor: rota.valor_pedagio }] : []

    // Apply overrides or use base values
    const precoDiesel = simulacao.preco_diesel_litro || parametros.preco_diesel_litro
    const kmPorLitro = simulacao.km_por_litro || veiculo.km_por_litro
    const velocidadeMedia = simulacao.velocidade_media_kmh || parametros.velocidade_media_kmh
    const entregasNaRota = simulacao.entregas_na_rota || 1
    const custoVarExtraPorKm = simulacao.custo_var_extra_por_km || 0
    const pedagogiosExtra = simulacao.pedagios_extra || 0

    // Calculate using shared function
    const resultado = calcularCustos({
      distanciaKm: Number(rota.distancia_km) || 0,
      kmPorLitro: kmPorLitro,
      precoDieselLitro: precoDiesel,
      velocidadeMediaKmh: velocidadeMedia,
      custosVariaveis: custosVariaveis,
      pedagios: pedagios,
      custosFixos: custosFixos,
      custosVeiculo: custosVeiculo,
      entregasNaRota: entregasNaRota,
      custoVarExtraPorKm: custoVarExtraPorKm,
      pedagogiosExtra: pedagogiosExtra,
      pesoTon: viagem.peso_ton,
      receita: viagem.receita,
    })

    // Update simulation with calculated results
    const { error: updateError } = await supabaseClient
      .from('simulacoes')
      .update({
        custo_total: resultado.custoTotal,
        custo_por_entrega: resultado.custoPorEntrega,
        custo_por_tonelada_km: resultado.custoPorToneladaKm,
        margem: resultado.margem,
        consumo_combustivel_l: resultado.consumoCombustivelL,
        custo_combustivel: resultado.custoCombustivel,
        custo_variaveis: resultado.custoVariaveis,
        custo_pedagios: resultado.custoPedagios,
        custo_fixo_rateado: resultado.custoFixoRateado,
        tempo_estimado_h: resultado.tempoEstimadoH,
        updated_at: new Date().toISOString()
      })
      .eq('id', simulacao_id)

    if (updateError) {
      console.error('Error updating simulation:', updateError)
      return new Response(
        JSON.stringify({ error: 'Error updating simulation results' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    console.log('Simulation completed successfully')
    return new Response(
      JSON.stringify({ 
        success: true,
        results: resultado
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in rodar-simulacao function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})