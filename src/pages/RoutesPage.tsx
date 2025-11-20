import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { Plus, Edit, Trash2, MapPin, Clock, Search, Route, Upload, Download } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { CSVImportDialog } from '@/components/CSVImportDialog'
import { TooltipInfo } from '@/components/TooltipInfo'

interface Route {
  id: string
  user_id: string
  origem: string
  destino: string
  distancia_km: number
  tempo_estimado_h: number
  valor_pedagio: number
  created_at: string
  updated_at: string
}

// Componente de formulário movido para fora para evitar recriação
const RouteForm = ({ 
  formData, 
  setFormData, 
  onSubmit, 
  onCancel,
  isEdit = false 
}: { 
  formData: { origem: string; destino: string; distancia_km: string; tempo_estimado_h: string; valor_pedagio: string }
  setFormData: (data: any) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  isEdit?: boolean
}) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="origem">Origem</Label>
      <Input
        id="origem"
        placeholder="Ex: Centro da cidade"
        value={formData.origem}
        onChange={(e) => setFormData({ ...formData, origem: e.target.value })}
        required
      />
    </div>
    
    <div className="space-y-2">
      <Label htmlFor="destino">Destino</Label>
      <Input
        id="destino"
        placeholder="Ex: Zona Sul"
        value={formData.destino}
        onChange={(e) => setFormData({ ...formData, destino: e.target.value })}
        required
      />
    </div>
    
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <div className="flex items-center">
          <Label htmlFor="distancia_km">Distância (km)</Label>
          <TooltipInfo content="Distância total do percurso em quilômetros. Use ferramentas como Google Maps para medir rotas reais. Ex: 150 km é a distância entre São Paulo e Campinas." />
        </div>
        <Input
          id="distancia_km"
          type="number"
          step="0.01"
          min="0.01"
          max="10000"
          placeholder="150.00"
          value={formData.distancia_km}
          onChange={(e) => setFormData({ ...formData, distancia_km: e.target.value })}
          onInvalid={(e) => {
            const input = e.target as HTMLInputElement;
            if (input.validity.rangeUnderflow) {
              input.setCustomValidity('📏 A distância mínima é 0.01 km (10 metros). Para distâncias menores, considere transporte local.');
            } else if (input.validity.rangeOverflow) {
              input.setCustomValidity('📏 A distância máxima é 10.000 km. A maior distância no Brasil é cerca de 4.000 km.');
            } else {
              input.setCustomValidity('📏 Digite uma distância válida entre 0.01 e 10.000 km.');
            }
          }}
          onInput={(e) => {
            const input = e.target as HTMLInputElement;
            input.setCustomValidity('');
          }}
          required
          title="Distância da rota em quilômetros (ex: 150 km entre SP e Campinas)"
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center">
          <Label htmlFor="tempo_estimado_h">Tempo estimado (horas)</Label>
          <TooltipInfo content="Tempo previsto para completar o percurso. Considere velocidade média e condições de tráfego. Ex: 2,5 horas = 2 horas e 30 minutos." />
        </div>
        <Input
          id="tempo_estimado_h"
          type="number"
          step="0.01"
          min="0.01"
          max="100"
          placeholder="2.50"
          value={formData.tempo_estimado_h}
          onChange={(e) => setFormData({ ...formData, tempo_estimado_h: e.target.value })}
          onInvalid={(e) => {
            const input = e.target as HTMLInputElement;
            if (input.validity.rangeUnderflow) {
              input.setCustomValidity('⏱️ O tempo mínimo é 0.01 horas (36 segundos). Para viagens rápidas, use valores decimais como 0.5h (30 min).');
            } else if (input.validity.rangeOverflow) {
              input.setCustomValidity('⏱️ O tempo máximo é 100 horas. Para viagens longas, considere dividir em etapas.');
            } else {
              input.setCustomValidity('⏱️ Digite um tempo válido entre 0.01 e 100 horas.');
            }
          }}
          onInput={(e) => {
            const input = e.target as HTMLInputElement;
            input.setCustomValidity('');
          }}
          required
          title="Tempo estimado em horas. Ex: 2.5h = 2 horas e 30 minutos"
        />
      </div>
    </div>

    <div className="space-y-2">
      <div className="flex items-center">
        <Label htmlFor="valor_pedagio">Valor do Pedágio (R$)</Label>
        <TooltipInfo content="Soma de todos os pedágios da rota. Verifique os valores atualizados no site das concessionárias. Ex: Se passar por 3 pedágios de R$ 15,00 cada, o total é R$ 45,00." />
      </div>
      <Input
        id="valor_pedagio"
        type="number"
        step="0.01"
        min="0"
        max="1000"
        placeholder="0.00"
        value={formData.valor_pedagio}
        onChange={(e) => setFormData({ ...formData, valor_pedagio: e.target.value })}
        onInvalid={(e) => {
          const input = e.target as HTMLInputElement;
          if (input.validity.rangeOverflow) {
            input.setCustomValidity('💰 O valor máximo de pedágio é R$ 1.000. Verifique se você não digitou errado.');
          } else {
            input.setCustomValidity('💰 Digite um valor de pedágio válido (mínimo R$ 0).');
          }
        }}
        onInput={(e) => {
          const input = e.target as HTMLInputElement;
          input.setCustomValidity('');
        }}
        title="Valor total dos pedágios na rota em Reais. Ex: R$ 75,00"
      />
    </div>
    
    <DialogFooter>
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancelar
      </Button>
      <Button type="submit">
        {isEdit ? 'Atualizar' : 'Criar'} Rota
      </Button>
    </DialogFooter>
  </form>
)

export default function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [filteredRoutes, setFilteredRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingRoute, setEditingRoute] = useState<Route | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [importOpen, setImportOpen] = useState(false)
  const [formData, setFormData] = useState({
    origem: '',
    destino: '',
    distancia_km: '',
    tempo_estimado_h: '',
    valor_pedagio: '0'
  })
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      fetchRoutes()
    }
  }, [user])

  useEffect(() => {
    filterRoutes()
  }, [routes, searchTerm])

  const fetchRoutes = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setRoutes(data || [])
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar rotas',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const filterRoutes = () => {
    let filtered = routes

    if (searchTerm) {
      filtered = filtered.filter(route =>
        route.origem.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.destino.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredRoutes(filtered)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      const routeData = {
        origem: formData.origem,
        destino: formData.destino,
        distancia_km: parseFloat(formData.distancia_km),
        tempo_estimado_h: parseFloat(formData.tempo_estimado_h),
        valor_pedagio: parseFloat(formData.valor_pedagio),
        user_id: user.id
      }

      const { data, error } = await supabase
        .from('routes')
        .insert(routeData)
        .select()

      if (error) throw error

      if (data) {
        setRoutes([data[0], ...routes])
        resetForm()
        setIsDialogOpen(false)
        toast({
          title: 'Rota criada!',
          description: 'A nova rota foi criada com sucesso.'
        })
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar rota',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const handleEdit = (route: Route) => {
    setEditingRoute(route)
    setFormData({
      origem: route.origem,
      destino: route.destino,
      distancia_km: route.distancia_km.toString(),
      tempo_estimado_h: route.tempo_estimado_h.toString(),
      valor_pedagio: route.valor_pedagio.toString()
    })
    setIsEditDialogOpen(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingRoute || !user) return

    try {
      const routeData = {
        origem: formData.origem,
        destino: formData.destino,
        distancia_km: parseFloat(formData.distancia_km),
        tempo_estimado_h: parseFloat(formData.tempo_estimado_h),
        valor_pedagio: parseFloat(formData.valor_pedagio)
      }

      const { data, error } = await supabase
        .from('routes')
        .update(routeData)
        .eq('id', editingRoute.id)
        .select()

      if (error) throw error

      if (data) {
        setRoutes(routes.map(r => r.id === editingRoute.id ? data[0] : r))
        resetForm()
        setIsEditDialogOpen(false)
        setEditingRoute(null)
        toast({
          title: 'Rota atualizada!',
          description: 'A rota foi atualizada com sucesso.'
        })
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar rota',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const handleDelete = async (routeId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('routes')
        .delete()
        .eq('id', routeId)

      if (error) throw error

      setRoutes(routes.filter(r => r.id !== routeId))
      toast({
        title: 'Rota excluída!',
        description: 'A rota foi excluída com sucesso.'
      })
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir rota',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const resetForm = () => {
    setFormData({
      origem: '',
      destino: '',
      distancia_km: '',
      tempo_estimado_h: '',
      valor_pedagio: '0'
    })
  }

  const handleCancelForm = () => {
    resetForm()
    setIsDialogOpen(false)
    setIsEditDialogOpen(false)
    setEditingRoute(null)
  }

  const handleImport = async (data: any[]) => {
    if (!user) return
    const routesToInsert = data.map(r => ({ ...r, user_id: user.id }))
    const { error } = await supabase.from('routes').insert(routesToInsert)
    if (error) throw error
    fetchRoutes()
  }

  const handleExport = () => {
    const csv = [
      ['Origem', 'Destino', 'Distância (km)', 'Tempo (h)', 'Pedágio (R$)'].join(','),
      ...routes.map(r => [r.origem, r.destino, r.distancia_km, r.tempo_estimado_h, r.valor_pedagio].join(','))
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rotas-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    toast({ title: "Exportado", description: "Rotas exportadas com sucesso" })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Route className="h-8 w-8 text-primary" />
            Gestão de Rotas
          </h1>
          <p className="text-muted-foreground">Carregando rotas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header com busca */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center min-h-[80px]">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Route className="h-8 w-8 text-primary" />
              Gestão de Rotas
            </h1>
            <p className="text-muted-foreground">
              Gerencie as rotas de transporte da sua frota.
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setImportOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Importar CSV
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Rota
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nova Rota</DialogTitle>
                  <DialogDescription>
                    Adicione uma nova rota ao sistema.
                  </DialogDescription>
                </DialogHeader>
                <RouteForm 
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={handleSubmit}
                  onCancel={handleCancelForm}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Barra de busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por origem ou destino..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Lista de rotas */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredRoutes.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <MapPin className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">
              {routes.length === 0 ? 'Nenhuma rota cadastrada' : 'Nenhuma rota encontrada'}
            </h3>
            <p className="text-muted-foreground">
              {routes.length === 0 
                ? 'Clique em "Nova Rota" para começar.' 
                : 'Tente ajustar o termo de busca.'
              }
            </p>
          </div>
        ) : (
          filteredRoutes.map((route) => (
            <Card key={route.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">
                    {route.origem} → {route.destino}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(route)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir esta rota? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(route.id)}>
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">De:</span>
                    <span>{route.origem}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Para:</span>
                    <span>{route.destino}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{route.distancia_km}</p>
                    <p className="text-xs text-muted-foreground">km</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <p className="text-2xl font-bold text-primary">{route.tempo_estimado_h}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">horas</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-success">R$ {route.valor_pedagio.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">pedágio</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialog de edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Rota</DialogTitle>
            <DialogDescription>
              Edite as informações da rota.
            </DialogDescription>
          </DialogHeader>
          <RouteForm 
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleEditSubmit}
            onCancel={handleCancelForm}
            isEdit 
          />
        </DialogContent>
      </Dialog>

      <CSVImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        type="routes"
        onImport={handleImport}
      />
    </div>
  )
}