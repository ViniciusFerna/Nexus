import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calculator, TrendingUp, DollarSign, Percent } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface FreightPriceCalculatorProps {
  custoTotal: number
  onPriceCalculated?: (price: number, margin: number) => void
}

export function FreightPriceCalculator({ custoTotal, onPriceCalculated }: FreightPriceCalculatorProps) {
  const [margemDesejada, setMargemDesejada] = useState<string>("15")
  const [precoSugerido, setPrecoSugerido] = useState<number>(0)
  const [lucroEstimado, setLucroEstimado] = useState<number>(0)

  useEffect(() => {
    const margem = parseFloat(margemDesejada) || 0
    if (margem >= 0 && margem < 100) {
      // Fórmula: Preço = Custo / (1 - Margem/100)
      const preco = custoTotal / (1 - margem / 100)
      const lucro = preco - custoTotal
      setPrecoSugerido(preco)
      setLucroEstimado(lucro)
      onPriceCalculated?.(preco, margem)
    } else {
      setPrecoSugerido(0)
      setLucroEstimado(0)
    }
  }, [margemDesejada, custoTotal, onPriceCalculated])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-background to-muted/30">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Calculadora de Preço de Frete</CardTitle>
        </div>
        <CardDescription>
          Defina sua margem de lucro desejada e veja o preço sugerido para o frete
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Custo Total */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              Custo Total da Viagem
            </Label>
            <Badge variant="secondary" className="font-mono">
              {formatCurrency(custoTotal)}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Soma de todos os custos (combustível, pedágios, variáveis, fixos e extras)
          </p>
        </div>

        {/* Margem Desejada */}
        <div className="space-y-2">
          <Label htmlFor="margem" className="flex items-center gap-2">
            <Percent className="h-4 w-4 text-primary" />
            Margem de Lucro Desejada (%)
          </Label>
          <Input
            id="margem"
            type="number"
            min="0"
            max="99"
            step="0.1"
            value={margemDesejada}
            onChange={(e) => setMargemDesejada(e.target.value)}
            className="font-mono"
            placeholder="Ex: 15"
          />
          <p className="text-xs text-muted-foreground">
            Percentual de lucro sobre o preço de venda. Margens típicas: 10-20% para fretes rodoviários
          </p>
        </div>

        {/* Resultados */}
        {precoSugerido > 0 && (
          <div className="space-y-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2 text-primary font-semibold">
              <TrendingUp className="h-5 w-5" />
              <span>Resultados</span>
            </div>
            
            <div className="grid gap-3">
              <div className="flex items-center justify-between p-3 rounded-md bg-background">
                <span className="text-sm font-medium">Preço de Venda Sugerido</span>
                <span className="text-xl font-bold text-primary">
                  {formatCurrency(precoSugerido)}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-md bg-background">
                <span className="text-sm font-medium">Lucro Estimado</span>
                <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                  {formatCurrency(lucroEstimado)}
                </span>
              </div>
            </div>

            {/* Fórmula explicativa */}
            <div className="mt-4 p-3 rounded-md bg-muted/50 border border-border">
              <p className="text-xs font-semibold mb-2 text-foreground">📐 Fórmula Utilizada:</p>
              <code className="text-xs font-mono block bg-background p-2 rounded border border-border">
                Preço = Custo Total ÷ (1 - Margem ÷ 100)
              </code>
              <p className="text-xs text-muted-foreground mt-2">
                Exemplo: R$ {custoTotal.toFixed(2)} ÷ (1 - {margemDesejada} ÷ 100) = R$ {precoSugerido.toFixed(2)}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
