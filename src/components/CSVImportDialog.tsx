import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CSVImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: 'vehicles' | 'routes'
  onImport: (data: any[]) => Promise<void>
}

export function CSVImportDialog({ open, onOpenChange, type, onImport }: CSVImportDialogProps) {
  const { toast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [headers, setHeaders] = useState<string[]>([])
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [step, setStep] = useState<'upload' | 'mapping'>('upload')
  const [parsedData, setParsedData] = useState<any[]>([])

  const fieldMappings = type === 'vehicles' 
    ? {
        tipo: 'Tipo',
        capacidade_ton: 'Capacidade (ton)',
        km_por_litro: 'KM por Litro',
        custo_por_km: 'Custo por KM',
        status: 'Status'
      }
    : {
        origem: 'Origem',
        destino: 'Destino',
        distancia_km: 'Distância (km)',
        tempo_estimado_h: 'Tempo Estimado (h)'
      }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0]
    if (!uploadedFile) return

    setFile(uploadedFile)
    const reader = new FileReader()
    
    reader.onload = (event) => {
      const text = event.target?.result as string
      const lines = text.split('\n').filter(line => line.trim())
      
      if (lines.length === 0) {
        toast({
          title: "Erro",
          description: "Arquivo CSV vazio",
          variant: "destructive"
        })
        return
      }

      const fileHeaders = lines[0].split(',').map(h => h.trim())
      setHeaders(fileHeaders)
      
      // Parse data
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim())
        const row: Record<string, string> = {}
        fileHeaders.forEach((header, index) => {
          row[header] = values[index] || ''
        })
        return row
      })
      
      setParsedData(data)
      setStep('mapping')
    }
    
    reader.readAsText(uploadedFile)
  }

  const handleImport = async () => {
    try {
      const mappedData = parsedData.map(row => {
        const mappedRow: Record<string, any> = {}
        Object.entries(mapping).forEach(([dbField, csvHeader]) => {
          const value = row[csvHeader]
          
          // Convert numeric fields
          if (['capacidade_ton', 'km_por_litro', 'custo_por_km', 'distancia_km', 'tempo_estimado_h'].includes(dbField)) {
            mappedRow[dbField] = value ? parseFloat(value) : 0
          } else {
            mappedRow[dbField] = value
          }
        })
        return mappedRow
      })

      await onImport(mappedData)
      
      toast({
        title: "Sucesso",
        description: `${mappedData.length} registros importados`
      })
      
      // Reset
      setFile(null)
      setHeaders([])
      setMapping({})
      setParsedData([])
      setStep('upload')
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: "Erro ao importar",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Importar CSV - {type === 'vehicles' ? 'Veículos' : 'Rotas'}</DialogTitle>
          <DialogDescription>
            {step === 'upload' 
              ? 'Selecione um arquivo CSV para importar'
              : 'Mapeie as colunas do CSV para os campos do sistema'}
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' ? (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <Label htmlFor="csv-upload" className="cursor-pointer">
                <div className="text-sm text-muted-foreground mb-2">
                  Clique para selecionar ou arraste um arquivo CSV
                </div>
                <input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button variant="outline" type="button" asChild>
                  <span>
                    <Upload className="mr-2 h-4 w-4" />
                    Selecionar Arquivo
                  </span>
                </Button>
              </Label>
              {file && (
                <div className="mt-4 text-sm text-foreground">
                  Arquivo selecionado: {file.name}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Foram encontrados {parsedData.length} registros no arquivo
            </div>
            
            {Object.entries(fieldMappings).map(([dbField, label]) => (
              <div key={dbField} className="space-y-2">
                <Label>{label}</Label>
                <Select 
                  value={mapping[dbField]} 
                  onValueChange={(value) => setMapping(prev => ({ ...prev, [dbField]: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a coluna do CSV" />
                  </SelectTrigger>
                  <SelectContent>
                    {headers.map(header => (
                      <SelectItem key={header} value={header}>{header}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setStep('upload')}>
                Voltar
              </Button>
              <Button 
                onClick={handleImport}
                disabled={Object.keys(mapping).length !== Object.keys(fieldMappings).length}
              >
                Importar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
