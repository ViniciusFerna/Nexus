import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calculator } from "lucide-react"

interface FormulaCardProps {
  title: string
  description?: string
  formulas: {
    label: string
    formula: string
    example?: string
  }[]
}

export function FormulaCard({ title, description, formulas }: FormulaCardProps) {
  return (
    <Card className="bg-muted/50 border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
        {description && (
          <CardDescription className="text-sm">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {formulas.map((item, index) => (
          <div key={index} className="space-y-1">
            <p className="text-sm font-medium text-foreground">{item.label}</p>
            <div className="bg-background/50 p-3 rounded-md font-mono text-sm border border-border">
              {item.formula}
            </div>
            {item.example && (
              <p className="text-xs text-muted-foreground italic">{item.example}</p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
