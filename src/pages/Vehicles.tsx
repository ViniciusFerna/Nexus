import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { VehicleCostsDialog } from "@/components/VehicleCostsDialog"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Truck, Plus, Edit, Trash2, Search, Filter, Upload, Download, DollarSign } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/useAuth"
import { CSVImportDialog } from "@/components/CSVImportDialog"

type VehicleStatus = 'Disponível' | 'Em_Manutenção' | 'Em_Uso'

interface Vehicle {
  id: string
  user_id: string
  tipo: string
  capacidade_ton: number
  km_por_litro: number
  status: VehicleStatus
  created_at: string
  updated_at: string
}

// Componente de formulário movido para fora para evitar recriação
const VehicleForm = ({ 
  formData, 
  setFormData, 
  onSubmit, 
  onCancel, 
  isEdit = false 
}: { 
  formData: { tipo: string; capacidade_ton: string; km_por_litro: string; status: VehicleStatus }
  setFormData: (data: any) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  isEdit?: boolean
}) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="tipo">Tipo de Veículo</Label>
      <Input
        id="tipo"
        placeholder="Ex: Caminhão, Van, Carreta"
        value={formData.tipo}
        onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
        required
      />
    </div>
    
    <div className="grid grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label htmlFor="capacidade_ton">Capacidade (ton)</Label>
        <Input
          id="capacidade_ton"
          type="number"
          step="0.01"
          min="0.1"
          placeholder="40.00"
          value={formData.capacidade_ton}
          onChange={(e) => setFormData({ ...formData, capacidade_ton: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="km_por_litro">Km/litro</Label>
        <Input
          id="km_por_litro"
          type="number"
          step="0.01"
          min="0.1"
          placeholder="3.20"
          value={formData.km_por_litro}
          onChange={(e) => setFormData({ ...formData, km_por_litro: e.target.value })}
          required
        />
      </div>
    </div>

    <div className="space-y-2">
      <Label htmlFor="status">Status</Label>
      <Select value={formData.status} onValueChange={(value: VehicleStatus) => setFormData({ ...formData, status: value })}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione o status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Disponível">Disponível</SelectItem>
          <SelectItem value="Em_Manutenção">Em Manutenção</SelectItem>
          <SelectItem value="Em_Uso">Em Uso</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <DialogFooter>
      <Button type="button" variant="secondary" onClick={onCancel}>
        Cancelar
      </Button>
      <Button type="submit">
        {isEdit ? 'Atualizar' : 'Cadastrar'} Veículo
      </Button>
    </DialogFooter>
  </form>
)

const Vehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [importOpen, setImportOpen] = useState(false)
  const [costsDialogVehicle, setCostsDialogVehicle] = useState<Vehicle | null>(null)
  const [formData, setFormData] = useState({
    tipo: '',
    capacidade_ton: '',
    km_por_litro: '',
    status: 'Disponível' as VehicleStatus
  })
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchVehicles()
    }
  }, [user])

  useEffect(() => {
    filterVehicles()
  }, [vehicles, searchTerm, statusFilter])

  const fetchVehicles = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setVehicles((data || []).map(vehicle => ({
        ...vehicle,
        status: vehicle.status as VehicleStatus
      })))
    } catch (error) {
      console.error('Error fetching vehicles:', error)
      toast({
        title: "Erro ao carregar veículos",
        description: "Não foi possível carregar a lista de veículos.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterVehicles = () => {
    let filtered = vehicles

    if (searchTerm) {
      filtered = filtered.filter(vehicle =>
        vehicle.tipo.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter) {
      filtered = filtered.filter(vehicle => vehicle.status === statusFilter)
    }

    setFilteredVehicles(filtered)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para cadastrar veículos.",
        variant: "destructive",
      })
      return
    }

    try {
      const { data, error } = await supabase
        .from('vehicles')
        .insert([
          {
            user_id: user.id,
            tipo: formData.tipo,
            capacidade_ton: parseFloat(formData.capacidade_ton),
            km_por_litro: parseFloat(formData.km_por_litro),
            status: formData.status
          }
        ])
        .select()

      if (error) throw error

      if (data) {
        const newVehicle = { ...data[0], status: data[0].status as VehicleStatus }
        setVehicles([newVehicle, ...vehicles])
        resetForm()
        setIsDialogOpen(false)
        toast({
          title: "Veículo cadastrado",
          description: "O veículo foi adicionado com sucesso à frota.",
        })
      }
    } catch (error) {
      console.error('Error creating vehicle:', error)
      toast({
        title: "Erro ao cadastrar veículo",
        description: "Não foi possível cadastrar o veículo. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle)
    setFormData({
      tipo: vehicle.tipo,
      capacidade_ton: vehicle.capacidade_ton.toString(),
      km_por_litro: vehicle.km_por_litro.toString(),
      status: vehicle.status
    })
    setIsEditDialogOpen(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingVehicle) return

    try {
      const { data, error } = await supabase
        .from('vehicles')
        .update({
          tipo: formData.tipo,
          capacidade_ton: parseFloat(formData.capacidade_ton),
          km_por_litro: parseFloat(formData.km_por_litro),
          status: formData.status
        })
        .eq('id', editingVehicle.id)
        .select()

      if (error) throw error

      if (data) {
        const updatedVehicle = { ...data[0], status: data[0].status as VehicleStatus }
        setVehicles(vehicles.map(v => v.id === editingVehicle.id ? updatedVehicle : v))
        resetForm()
        setIsEditDialogOpen(false)
        setEditingVehicle(null)
        toast({
          title: "Veículo atualizado",
          description: "As informações do veículo foram atualizadas com sucesso.",
        })
      }
    } catch (error) {
      console.error('Error updating vehicle:', error)
      toast({
        title: "Erro ao atualizar veículo",
        description: "Não foi possível atualizar o veículo. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (vehicleId: string) => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', vehicleId)

      if (error) throw error

      setVehicles(vehicles.filter(v => v.id !== vehicleId))
      toast({
        title: "Veículo removido",
        description: "O veículo foi removido da frota.",
      })
    } catch (error) {
      console.error('Error deleting vehicle:', error)
      toast({
        title: "Erro ao remover veículo",
        description: "Não foi possível remover o veículo. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      tipo: '',
      capacidade_ton: '',
      km_por_litro: '',
      status: 'Disponível'
    })
  }

  const handleImport = async (data: any[]) => {
    if (!user) return
    
    const vehiclesToInsert = data.map(vehicle => ({
      ...vehicle,
      user_id: user.id
    }))

    const { error } = await supabase
      .from('vehicles')
      .insert(vehiclesToInsert)

    if (error) throw error
    fetchVehicles()
  }

  const handleExport = () => {
    const csv = [
      ['Tipo', 'Capacidade (ton)', 'KM/Litro', 'Status'].join(','),
      ...vehicles.map(v => 
        [v.tipo, v.capacidade_ton, v.km_por_litro, v.status].join(',')
      )
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `veiculos-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    
    toast({
      title: "Exportado",
      description: "Veículos exportados com sucesso"
    })
  }

  const getStatusBadge = (status: VehicleStatus) => {
    switch (status) {
      case 'Disponível':
        return <Badge className="bg-success/20 text-success-foreground border-success/30">Disponível</Badge>
      case 'Em_Manutenção':
        return <Badge variant="destructive">Em Manutenção</Badge>
      case 'Em_Uso':
        return <Badge variant="secondary">Em Uso</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleCancelForm = () => {
    resetForm()
    setIsDialogOpen(false)
    setIsEditDialogOpen(false)
    setEditingVehicle(null)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Truck className="h-8 w-8 text-primary" />
            Gestão de Veículos
          </h1>
          <p className="text-muted-foreground">Carregando veículos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header com busca e filtros */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between min-h-[80px]">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Truck className="h-8 w-8 text-primary" />
              Gestão de Veículos
            </h1>
            <p className="text-muted-foreground">
              Cadastre e gerencie a frota de veículos para suas simulações de transporte.
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
                  Novo Veículo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cadastrar Novo Veículo</DialogTitle>
                  <DialogDescription>
                    Preencha as informações do veículo para adicionar à frota.
                  </DialogDescription>
                </DialogHeader>
                <VehicleForm 
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={handleSubmit}
                  onCancel={handleCancelForm}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Barra de busca e filtros */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por tipo de veículo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter || "all"} onValueChange={(value) => setStatusFilter(value === "all" ? "" : value)}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="Disponível">Disponível</SelectItem>
              <SelectItem value="Em_Manutenção">Em Manutenção</SelectItem>
              <SelectItem value="Em_Uso">Em Uso</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Lista de veículos */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredVehicles.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Truck className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">
              {vehicles.length === 0 ? 'Nenhum veículo cadastrado' : 'Nenhum veículo encontrado'}
            </h3>
            <p className="text-muted-foreground">
              {vehicles.length === 0 
                ? 'Clique em "Novo Veículo" para começar.' 
                : 'Tente ajustar os filtros de busca.'
              }
            </p>
          </div>
        ) : (
          filteredVehicles.map((vehicle) => (
            <Card key={vehicle.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{vehicle.tipo}</CardTitle>
                    {getStatusBadge(vehicle.status)}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCostsDialogVehicle(vehicle)}
                      title="Gerenciar custos do veículo"
                    >
                      <DollarSign className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(vehicle)}
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
                            Tem certeza que deseja excluir este veículo? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(vehicle.id)}>
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{vehicle.capacidade_ton}</p>
                    <p className="text-xs text-muted-foreground">toneladas</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{vehicle.km_por_litro}</p>
                    <p className="text-xs text-muted-foreground">km/litro</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialog de edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Veículo</DialogTitle>
            <DialogDescription>
              Altere as informações do veículo {editingVehicle?.tipo}.
            </DialogDescription>
          </DialogHeader>
          <VehicleForm 
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
        type="vehicles"
        onImport={handleImport}
      />

      {costsDialogVehicle && (
        <VehicleCostsDialog
          vehicleId={costsDialogVehicle.id}
          vehicleName={costsDialogVehicle.tipo}
          open={!!costsDialogVehicle}
          onOpenChange={(open) => !open && setCostsDialogVehicle(null)}
        />
      )}
    </div>
  )
}

export default Vehicles