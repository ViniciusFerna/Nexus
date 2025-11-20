import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MetricCard } from "@/components/MetricCard"
import { 
  TrendingUp, 
  TrendingDown,
  Truck, 
  DollarSign, 
  Target, 
  Download, 
  FileText,
  BarChart3,
  Route as RouteIcon,
  Package
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function Reports() {
  const { toast } = useToast()
  const [selectedVehicle, setSelectedVehicle] = useState<string>("all")
  const [selectedRoute, setSelectedRoute] = useState<string>("all")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")

  // Fetch trips with filters
  const { data: trips = [] } = useQuery({
    queryKey: ['trips-reports', selectedVehicle, selectedRoute, startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from('trips')
        .select('*')
        .order('start_date', { ascending: false })

      if (selectedVehicle !== 'all') query = query.eq('vehicle_id', selectedVehicle)
      if (selectedRoute !== 'all') query = query.eq('route_id', selectedRoute)
      if (startDate) query = query.gte('start_date', startDate)
      if (endDate) query = query.lte('end_date', endDate)

      const { data: tripsData, error } = await query
      if (error) throw error

      // Fetch related vehicles and routes
      const vehicleIds = [...new Set(tripsData?.map(t => t.vehicle_id) || [])]
      const routeIds = [...new Set(tripsData?.map(t => t.route_id) || [])]

      const { data: vehiclesData } = await supabase
        .from('vehicles')
        .select('*')
        .in('id', vehicleIds)

      const { data: routesData } = await supabase
        .from('routes')
        .select('*')
        .in('id', routeIds)

      const vehiclesMap = new Map(vehiclesData?.map(v => [v.id, v]) || [])
      const routesMap = new Map(routesData?.map(r => [r.id, r]) || [])

      return tripsData?.map(trip => ({
        ...trip,
        vehicle: vehiclesMap.get(trip.vehicle_id),
        route: routesMap.get(trip.route_id)
      })) || []
    }
  })

  // Buscar veículos para filtro
  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('vehicles').select('*')
      if (error) throw error
      return data || []
    }
  })

  // Buscar rotas para filtro
  const { data: routes = [] } = useQuery({
    queryKey: ['routes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('routes').select('*')
      if (error) throw error
      return data || []
    }
  })

  // ===== CÁLCULOS DE KPIs PRINCIPAIS =====
  const totalTrips = trips.length
  const totalRevenue = trips.reduce((sum, t) => sum + (Number(t.receita) || 0), 0)
  const totalCost = trips.reduce((sum, t) => sum + (Number(t.custo_total_estimado) || 0), 0)
  const totalProfit = totalRevenue - totalCost
  const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100) : 0
  
  const totalKm = trips.reduce((sum, t) => sum + (t.route?.distancia_km || 0), 0)
  const avgCostPerKm = totalKm > 0 ? (totalCost / totalKm) : 0
  
  const occupancyRates = trips
    .filter(t => t.peso_ton && t.vehicle?.capacidade_ton)
    .map(t => (t.peso_ton! / t.vehicle!.capacidade_ton) * 100)
  const avgOccupancy = occupancyRates.length > 0
    ? (occupancyRates.reduce((a, b) => a + b, 0) / occupancyRates.length)
    : 0

  // Breakdown de custos médios
  const avgFuelCost = trips.length > 0 
    ? trips.reduce((sum, t) => sum + (Number(t.custo_combustivel) || 0), 0) / trips.length 
    : 0
  const avgVariableCost = trips.length > 0 
    ? trips.reduce((sum, t) => sum + (Number(t.custo_variaveis) || 0), 0) / trips.length 
    : 0
  const avgTollCost = trips.length > 0 
    ? trips.reduce((sum, t) => sum + (Number(t.custo_pedagios) || 0), 0) / trips.length 
    : 0
  const avgFixedCost = trips.length > 0 
    ? trips.reduce((sum, t) => sum + (Number(t.custo_fixo_rateado) || 0), 0) / trips.length 
    : 0

  // Análise por veículo
  const vehicleStats = trips.reduce((acc, trip) => {
    const vehicleId = trip.vehicle_id
    const vehicleName = trip.vehicle?.tipo || 'Desconhecido'
    
    if (!acc[vehicleId]) {
      acc[vehicleId] = {
        name: vehicleName,
        trips: 0,
        totalKm: 0,
        totalCost: 0,
        totalRevenue: 0,
        avgOccupancy: []
      }
    }
    
    acc[vehicleId].trips += 1
    acc[vehicleId].totalKm += trip.route?.distancia_km || 0
    acc[vehicleId].totalCost += Number(trip.custo_total_estimado) || 0
    acc[vehicleId].totalRevenue += Number(trip.receita) || 0
    
    if (trip.peso_ton && trip.vehicle?.capacidade_ton) {
      acc[vehicleId].avgOccupancy.push((trip.peso_ton / trip.vehicle.capacidade_ton) * 100)
    }
    
    return acc
  }, {} as Record<string, any>)

  const vehiclePerformance = Object.values(vehicleStats).map((v: any) => ({
    name: v.name,
    trips: v.trips,
    totalKm: v.totalKm,
    costPerKm: v.totalKm > 0 ? v.totalCost / v.totalKm : 0,
    revenue: v.totalRevenue,
    profit: v.totalRevenue - v.totalCost,
    margin: v.totalRevenue > 0 ? ((v.totalRevenue - v.totalCost) / v.totalRevenue * 100) : 0,
    avgOccupancy: v.avgOccupancy.length > 0 
      ? v.avgOccupancy.reduce((a: number, b: number) => a + b, 0) / v.avgOccupancy.length 
      : 0
  })).sort((a, b) => b.profit - a.profit)

  // Análise por rota
  const routeStats = trips.reduce((acc, trip) => {
    const routeId = trip.route_id
    const routeName = `${trip.route?.origem || '?'} → ${trip.route?.destino || '?'}`
    
    if (!acc[routeId]) {
      acc[routeId] = {
        name: routeName,
        trips: 0,
        totalKm: 0,
        totalCost: 0,
        totalRevenue: 0
      }
    }
    
    acc[routeId].trips += 1
    acc[routeId].totalKm += trip.route?.distancia_km || 0
    acc[routeId].totalCost += Number(trip.custo_total_estimado) || 0
    acc[routeId].totalRevenue += Number(trip.receita) || 0
    
    return acc
  }, {} as Record<string, any>)

  const routePerformance = Object.values(routeStats).map((r: any) => ({
    name: r.name,
    trips: r.trips,
    totalKm: r.totalKm,
    costPerKm: r.totalKm > 0 ? r.totalCost / r.totalKm : 0,
    revenue: r.totalRevenue,
    profit: r.totalRevenue - r.totalCost,
    margin: r.totalRevenue > 0 ? ((r.totalRevenue - r.totalCost) / r.totalRevenue * 100) : 0
  })).sort((a, b) => b.margin - a.margin)

  const exportCSV = () => {
    const csv = [
      ['Tipo', 'Nome', 'Viagens', 'KM Total', 'Custo Total', 'Receita', 'Lucro', 'Margem (%)'].join(','),
      '=== VEÍCULOS ===',
      ...vehiclePerformance.map(v => 
        ['Veículo', v.name, v.trips, v.totalKm.toFixed(0), v.costPerKm.toFixed(2), v.revenue.toFixed(2), v.profit.toFixed(2), v.margin.toFixed(1)].join(',')
      ),
      '',
      '=== ROTAS ===',
      ...routePerformance.map(r => 
        ['Rota', r.name, r.trips, r.totalKm.toFixed(0), r.costPerKm.toFixed(2), r.revenue.toFixed(2), r.profit.toFixed(2), r.margin.toFixed(1)].join(',')
      )
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `nexus-relatorio-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    
    toast({
      title: "CSV Exportado",
      description: "Relatório exportado com sucesso"
    })
  }

  const exportPDF = () => {
    window.print()
    toast({
      title: "PDF Gerado",
      description: "Use Ctrl+P ou Cmd+P para salvar como PDF"
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard de Performance</h1>
          <p className="text-muted-foreground">Análise de custos, receitas e eficiência operacional</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportCSV} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
          <Button onClick={exportPDF} variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Selecione o período e critérios de análise</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Data Início</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Data Fim</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Veículo</label>
            <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Veículos</SelectItem>
                {vehicles.map(v => (
                  <SelectItem key={v.id} value={v.id}>{v.tipo}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Rota</label>
            <Select value={selectedRoute} onValueChange={setSelectedRoute}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Rotas</SelectItem>
                {routes.map(r => (
                  <SelectItem key={r.id} value={r.id}>{r.origem} → {r.destino}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs para organizar conteúdo */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="vehicles">Por Veículo</TabsTrigger>
          <TabsTrigger value="routes">Por Rota</TabsTrigger>
        </TabsList>

        {/* Tab: Visão Geral */}
        <TabsContent value="overview" className="space-y-4">
          {/* KPIs Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Receita Total"
              value={`R$ ${totalRevenue.toFixed(2)}`}
              description="Faturamento das viagens"
              icon={TrendingUp}
              variant="default"
            />
            <MetricCard
              title="Lucro/Prejuízo"
              value={`R$ ${totalProfit.toFixed(2)}`}
              description="Receita - Custo"
              icon={totalProfit >= 0 ? TrendingUp : TrendingDown}
              variant={totalProfit >= 0 ? 'success' : 'warning'}
            />
            <MetricCard
              title="Margem"
              value={`${profitMargin.toFixed(1)}%`}
              description="Percentual de lucro"
              icon={Target}
              variant={profitMargin >= 15 ? 'success' : 'warning'}
            />
            <MetricCard
              title="Taxa Ocupação"
              value={`${avgOccupancy.toFixed(1)}%`}
              description="Média de uso da capacidade"
              icon={Package}
              variant={avgOccupancy >= 80 ? 'success' : 'warning'}
            />
          </div>

          {/* Resumo Operacional */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo Operacional</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Viagens</p>
                  <p className="text-2xl font-bold">{totalTrips}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total KM</p>
                  <p className="text-2xl font-bold">{totalKm.toFixed(0)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Custo/KM</p>
                  <p className="text-2xl font-bold">R$ {avgCostPerKm.toFixed(2)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Custo Total</p>
                  <p className="text-2xl font-bold">R$ {totalCost.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Breakdown de Custos */}
          <Card>
            <CardHeader>
              <CardTitle>Composição de Custos (Média/Viagem)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Combustível</span>
                    <span className="text-sm font-bold">R$ {avgFuelCost.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500" style={{ width: `${(avgFuelCost / (avgFuelCost + avgVariableCost + avgTollCost + avgFixedCost)) * 100}%` }} />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Variáveis</span>
                    <span className="text-sm font-bold">R$ {avgVariableCost.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${(avgVariableCost / (avgFuelCost + avgVariableCost + avgTollCost + avgFixedCost)) * 100}%` }} />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Pedágios</span>
                    <span className="text-sm font-bold">R$ {avgTollCost.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: `${(avgTollCost / (avgFuelCost + avgVariableCost + avgTollCost + avgFixedCost)) * 100}%` }} />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Fixos Rateados</span>
                    <span className="text-sm font-bold">R$ {avgFixedCost.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500" style={{ width: `${(avgFixedCost / (avgFuelCost + avgVariableCost + avgTollCost + avgFixedCost)) * 100}%` }} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Performance por Veículo */}
        <TabsContent value="vehicles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance por Veículo</CardTitle>
              <CardDescription>Análise de rentabilidade e eficiência de cada veículo</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Veículo</TableHead>
                    <TableHead className="text-center">Viagens</TableHead>
                    <TableHead className="text-right">KM Total</TableHead>
                    <TableHead className="text-right">Custo/KM</TableHead>
                    <TableHead className="text-right">Receita</TableHead>
                    <TableHead className="text-right">Lucro</TableHead>
                    <TableHead className="text-right">Margem</TableHead>
                    <TableHead className="text-right">Ocupação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehiclePerformance.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        Nenhuma viagem encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    vehiclePerformance.map((vehicle, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{vehicle.name}</TableCell>
                        <TableCell className="text-center">{vehicle.trips}</TableCell>
                        <TableCell className="text-right">{vehicle.totalKm.toFixed(0)} km</TableCell>
                        <TableCell className="text-right">R$ {vehicle.costPerKm.toFixed(2)}</TableCell>
                        <TableCell className="text-right">R$ {vehicle.revenue.toFixed(2)}</TableCell>
                        <TableCell className={`text-right font-semibold ${vehicle.profit >= 0 ? 'text-success' : 'text-warning'}`}>
                          R$ {vehicle.profit.toFixed(2)}
                        </TableCell>
                        <TableCell className={`text-right font-semibold ${vehicle.margin >= 15 ? 'text-success' : 'text-warning'}`}>
                          {vehicle.margin.toFixed(1)}%
                        </TableCell>
                        <TableCell className="text-right">{vehicle.avgOccupancy.toFixed(1)}%</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Performance por Rota */}
        <TabsContent value="routes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance por Rota</CardTitle>
              <CardDescription>Análise de rentabilidade de cada rota</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rota</TableHead>
                    <TableHead className="text-center">Viagens</TableHead>
                    <TableHead className="text-right">KM Total</TableHead>
                    <TableHead className="text-right">Custo/KM</TableHead>
                    <TableHead className="text-right">Receita</TableHead>
                    <TableHead className="text-right">Lucro</TableHead>
                    <TableHead className="text-right">Margem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {routePerformance.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        Nenhuma viagem encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    routePerformance.map((route, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{route.name}</TableCell>
                        <TableCell className="text-center">{route.trips}</TableCell>
                        <TableCell className="text-right">{route.totalKm.toFixed(0)} km</TableCell>
                        <TableCell className="text-right">R$ {route.costPerKm.toFixed(2)}</TableCell>
                        <TableCell className="text-right">R$ {route.revenue.toFixed(2)}</TableCell>
                        <TableCell className={`text-right font-semibold ${route.profit >= 0 ? 'text-success' : 'text-warning'}`}>
                          R$ {route.profit.toFixed(2)}
                        </TableCell>
                        <TableCell className={`text-right font-semibold ${route.margin >= 15 ? 'text-success' : 'text-warning'}`}>
                          {route.margin.toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}