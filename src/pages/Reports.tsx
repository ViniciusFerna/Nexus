import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MetricCard } from "@/components/MetricCard"
import { TrendingUp, Truck, Package, DollarSign, Target, Download, FileText } from "lucide-react"
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

  // Fetch vehicles for filter
  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('vehicles').select('*')
      if (error) throw error
      return data || []
    }
  })

  // Fetch routes for filter
  const { data: routes = [] } = useQuery({
    queryKey: ['routes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('routes').select('*')
      if (error) throw error
      return data || []
    }
  })

  // Calculate KPIs
  const completedTrips = trips.filter(t => t.status === 'completed')
  const otd = trips.length > 0 
    ? (completedTrips.filter(t => new Date(t.end_date) <= new Date(t.end_date)).length / trips.length * 100).toFixed(1)
    : '0.0'

  const allocatedVehicles = new Set(trips.map(t => t.vehicle_id)).size
  const fleetUtilization = vehicles.length > 0
    ? (allocatedVehicles / vehicles.length * 100).toFixed(1)
    : '0.0'

  const occupancyRates = trips
    .filter(t => t.peso_ton && t.vehicle?.capacidade_ton)
    .map(t => (t.peso_ton! / t.vehicle!.capacidade_ton) * 100)
  const avgOccupancy = occupancyRates.length > 0
    ? (occupancyRates.reduce((a, b) => a + b, 0) / occupancyRates.length).toFixed(1)
    : '0.0'

  const totalKm = trips.reduce((sum, t) => sum + (t.route?.distancia_km || 0), 0)
  const totalCost = trips.reduce((sum, t) => sum + (Number(t.custo_total_estimado) || 0), 0)
  const avgCostPerKm = totalKm > 0 ? (totalCost / totalKm).toFixed(2) : '0.00'

  const tripsWithRevenue = trips.filter(t => t.receita && t.receita > 0)
  const avgMargin = tripsWithRevenue.length > 0
    ? (tripsWithRevenue.reduce((sum, t) => {
        const margin = ((Number(t.receita) - Number(t.custo_total_estimado)) / Number(t.receita)) * 100
        return sum + margin
      }, 0) / tripsWithRevenue.length).toFixed(1)
    : '0.0'

  // Monthly aggregation
  const monthlyData = trips.reduce((acc, trip) => {
    const month = new Date(trip.start_date).toISOString().slice(0, 7)
    if (!acc[month]) {
      acc[month] = { km: 0, cost: 0, trips: 0, completed: 0 }
    }
    acc[month].km += trip.route?.distancia_km || 0
    acc[month].cost += Number(trip.custo_total_estimado) || 0
    acc[month].trips += 1
    if (trip.status === 'completed') acc[month].completed += 1
    return acc
  }, {} as Record<string, any>)

  const monthlyRows = Object.entries(monthlyData).map(([month, data]) => ({
    month,
    totalKm: data.km,
    totalCost: data.cost,
    costPerKm: data.km > 0 ? data.cost / data.km : 0,
    otd: data.trips > 0 ? (data.completed / data.trips * 100) : 0
  }))

  // Route ranking
  const routeStats = trips.reduce((acc, trip) => {
    const routeId = trip.route_id
    if (!acc[routeId]) {
      acc[routeId] = {
        routeName: `${trip.route?.origem} → ${trip.route?.destino}`,
        totalKm: 0,
        totalCost: 0,
        totalRevenue: 0,
        count: 0
      }
    }
    acc[routeId].totalKm += trip.route?.distancia_km || 0
    acc[routeId].totalCost += Number(trip.custo_total_estimado) || 0
    acc[routeId].totalRevenue += Number(trip.receita) || 0
    acc[routeId].count += 1
    return acc
  }, {} as Record<string, any>)

  const routeRanking = Object.values(routeStats).map((r: any) => ({
    route: r.routeName,
    costPerKm: r.totalKm > 0 ? r.totalCost / r.totalKm : 0,
    margin: r.totalRevenue > 0 ? ((r.totalRevenue - r.totalCost) / r.totalRevenue * 100) : 0,
    trips: r.count
  }))

  const exportCSV = () => {
    const csv = [
      ['Mês', 'Total KM', 'Custo Total', 'Custo/KM', 'OTD (%)'].join(','),
      ...monthlyRows.map(row => 
        [row.month, row.totalKm, row.totalCost.toFixed(2), row.costPerKm.toFixed(2), row.otd.toFixed(1)].join(',')
      )
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    
    toast({
      title: "CSV Exportado",
      description: "O relatório foi exportado com sucesso"
    })
  }

  const exportPDF = () => {
    window.print()
    toast({
      title: "PDF Gerado",
      description: "Use a função de impressão para salvar como PDF"
    })
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Relatórios e KPIs</h1>
          <p className="text-muted-foreground">Dashboard de performance e custos</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportCSV} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
          <Button onClick={exportPDF} variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Gerar PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Data Início</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Data Fim</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Veículo</label>
            <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {vehicles.map(v => (
                  <SelectItem key={v.id} value={v.id}>{v.tipo}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Rota</label>
            <Select value={selectedRoute} onValueChange={setSelectedRoute}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {routes.map(r => (
                  <SelectItem key={r.id} value={r.id}>{r.origem} → {r.destino}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="OTD"
          value={`${otd}%`}
          description="On-Time Delivery"
          icon={Target}
          variant="success"
        />
        <MetricCard
          title="Utilização Frota"
          value={`${fleetUtilization}%`}
          description="Veículos alocados"
          icon={Truck}
        />
        <MetricCard
          title="Taxa Ocupação"
          value={`${avgOccupancy}%`}
          description="Média peso/capacidade"
          icon={Package}
        />
        <MetricCard
          title="Custo Médio/KM"
          value={`R$ ${avgCostPerKm}`}
          description="Custo por quilômetro"
          icon={DollarSign}
        />
        <MetricCard
          title="Margem Média"
          value={`${avgMargin}%`}
          description="Receita vs Custo"
          icon={TrendingUp}
          variant={Number(avgMargin) > 0 ? 'success' : 'warning'}
        />
      </div>

      {/* Monthly Table */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mês</TableHead>
                <TableHead>Total KM</TableHead>
                <TableHead>Custo Total</TableHead>
                <TableHead>Custo/KM</TableHead>
                <TableHead>OTD (%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthlyRows.map(row => (
                <TableRow key={row.month}>
                  <TableCell>{row.month}</TableCell>
                  <TableCell>{row.totalKm.toFixed(0)} km</TableCell>
                  <TableCell>R$ {row.totalCost.toFixed(2)}</TableCell>
                  <TableCell>R$ {row.costPerKm.toFixed(2)}</TableCell>
                  <TableCell>{row.otd.toFixed(1)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Route Ranking */}
      <Card>
        <CardHeader>
          <CardTitle>Ranking de Rotas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rota</TableHead>
                <TableHead>Viagens</TableHead>
                <TableHead>Custo/KM</TableHead>
                <TableHead>Margem (%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {routeRanking
                .sort((a, b) => a.costPerKm - b.costPerKm)
                .map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{row.route}</TableCell>
                    <TableCell>{row.trips}</TableCell>
                    <TableCell>R$ {row.costPerKm.toFixed(2)}</TableCell>
                    <TableCell className={row.margin > 0 ? 'text-success' : 'text-destructive'}>
                      {row.margin.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}