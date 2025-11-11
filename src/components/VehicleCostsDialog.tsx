import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Plus, Trash2, Edit, DollarSign } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { ScrollArea } from "@/components/ui/scroll-area"

interface VehicleCost {
  id: string
  nome: string
  valor_mensal: number
  ativo: boolean
}

interface VehicleCostsDialogProps {
  vehicleId: string
  vehicleName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const VehicleCostsDialog = ({ vehicleId, vehicleName, open, onOpenChange }: VehicleCostsDialogProps) => {
  const [costs, setCosts] = useState<VehicleCost[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [editingCost, setEditingCost] = useState<VehicleCost | null>(null)
  const [formData, setFormData] = useState({ nome: '', valor_mensal: '' })
  const { toast } = useToast()

  useEffect(() => {
    if (open && vehicleId) {
      fetchCosts()
    }
  }, [open, vehicleId])

  const fetchCosts = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('custos_veiculo')
        .select('*')
        .eq('veiculo_id', vehicleId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setCosts(data || [])
    } catch (error) {
      console.error('Erro ao carregar custos:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os custos do veículo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      if (editingCost) {
        const { error } = await supabase
          .from('custos_veiculo')
          .update({
            nome: formData.nome,
            valor_mensal: parseFloat(formData.valor_mensal),
          })
          .eq('id', editingCost.id)

        if (error) throw error
        toast({ title: "Custo atualizado com sucesso!" })
      } else {
        const { error } = await supabase
          .from('custos_veiculo')
          .insert({
            user_id: user.id,
            veiculo_id: vehicleId,
            nome: formData.nome,
            valor_mensal: parseFloat(formData.valor_mensal),
            ativo: true,
          })

        if (error) throw error
        toast({ title: "Custo adicionado com sucesso!" })
      }

      setFormData({ nome: '', valor_mensal: '' })
      setEditingCost(null)
      fetchCosts()
    } catch (error) {
      console.error('Erro ao salvar custo:', error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar o custo.",
        variant: "destructive",
      })
    }
  }

  const handleToggle = async (cost: VehicleCost) => {
    try {
      const { error } = await supabase
        .from('custos_veiculo')
        .update({ ativo: !cost.ativo })
        .eq('id', cost.id)

      if (error) throw error
      fetchCosts()
    } catch (error) {
      console.error('Erro ao alternar status:', error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (costId: string) => {
    try {
      const { error } = await supabase
        .from('custos_veiculo')
        .delete()
        .eq('id', costId)

      if (error) throw error
      toast({ title: "Custo removido com sucesso!" })
      fetchCosts()
    } catch (error) {
      console.error('Erro ao remover custo:', error)
      toast({
        title: "Erro",
        description: "Não foi possível remover o custo.",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (cost: VehicleCost) => {
    setEditingCost(cost)
    setFormData({
      nome: cost.nome,
      valor_mensal: cost.valor_mensal.toString(),
    })
  }

  const totalMensal = costs
    .filter(c => c.ativo)
    .reduce((sum, c) => sum + Number(c.valor_mensal), 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Custos do Veículo: {vehicleName}
          </DialogTitle>
          <DialogDescription>
            Gerencie os custos mensais específicos deste veículo (seguro, manutenção, IPVA, etc.)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-3 p-4 bg-muted/30 rounded-lg">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="nome">Nome do Custo</Label>
                <Input
                  id="nome"
                  placeholder="Ex: Seguro, IPVA, Manutenção"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="valor">Valor Mensal (R$)</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.valor_mensal}
                  onChange={(e) => setFormData({ ...formData, valor_mensal: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm" className="flex-1">
                {editingCost ? <><Edit className="h-4 w-4 mr-1" /> Atualizar</> : <><Plus className="h-4 w-4 mr-1" /> Adicionar</>}
              </Button>
              {editingCost && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingCost(null)
                    setFormData({ nome: '', valor_mensal: '' })
                  }}
                >
                  Cancelar
                </Button>
              )}
            </div>
          </form>

          {/* Lista de Custos */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Custos Cadastrados</h3>
              <Badge variant="secondary">
                Total Mensal Ativo: R$ {totalMensal.toFixed(2)}
              </Badge>
            </div>
            
            <ScrollArea className="h-[300px] rounded-md border p-3">
              {isLoading ? (
                <p className="text-sm text-muted-foreground text-center py-8">Carregando...</p>
              ) : costs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhum custo cadastrado ainda. Adicione o primeiro custo acima.
                </p>
              ) : (
                <div className="space-y-2">
                  {costs.map((cost) => (
                    <div
                      key={cost.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-background border"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{cost.nome}</p>
                          {!cost.ativo && <Badge variant="outline">Inativo</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          R$ {cost.valor_mensal.toFixed(2)} / mês
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={cost.ativo}
                          onCheckedChange={() => handleToggle(cost)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(cost)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(cost.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
