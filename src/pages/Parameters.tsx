import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Settings, Fuel, DollarSign, Clock, Truck } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Parameters() {
  const [parameters, setParameters] = useState({
    fuelPrice: 5.85,
    insuranceRate: 0.025,
    maintenanceRate: 0.15,
    driverHourlyRate: 25.0,
    tollRate: 0.08,
    profitMargin: 0.20,
    workingHoursPerDay: 8,
    workingDaysPerMonth: 22,
    averageSpeed: 60
  });

  const handleParameterChange = (key: string, value: number) => {
    setParameters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    toast({
      title: "Parâmetros salvos",
      description: "As configurações foram atualizadas com sucesso.",
    });
  };

  const resetToDefault = () => {
    setParameters({
      fuelPrice: 5.85,
      insuranceRate: 0.025,
      maintenanceRate: 0.15,
      driverHourlyRate: 25.0,
      tollRate: 0.08,
      profitMargin: 0.20,
      workingHoursPerDay: 8,
      workingDaysPerMonth: 22,
      averageSpeed: 60
    });
    toast({
      title: "Parâmetros redefinidos",
      description: "Valores padrão foram restaurados.",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Parâmetros do Sistema</h1>
          <p className="text-muted-foreground">
            Configure os parâmetros utilizados nos cálculos de custos e simulações
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetToDefault}>
            Restaurar Padrão
          </Button>
          <Button onClick={handleSave}>
            <Settings className="h-4 w-4 mr-2" />
            Salvar Alterações
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Custos Operacionais */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <CardTitle>Custos Operacionais</CardTitle>
            </div>
            <CardDescription>
              Parâmetros relacionados aos custos de operação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fuelPrice">Preço do Combustível (R$/L)</Label>
              <Input
                id="fuelPrice"
                type="number"
                step="0.01"
                value={parameters.fuelPrice}
                onChange={(e) => handleParameterChange('fuelPrice', parseFloat(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="insuranceRate">Taxa de Seguro (%)</Label>
              <Input
                id="insuranceRate"
                type="number"
                step="0.001"
                value={parameters.insuranceRate * 100}
                onChange={(e) => handleParameterChange('insuranceRate', parseFloat(e.target.value) / 100)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maintenanceRate">Taxa de Manutenção (% do valor do veículo/ano)</Label>
              <Input
                id="maintenanceRate"
                type="number"
                step="0.01"
                value={parameters.maintenanceRate * 100}
                onChange={(e) => handleParameterChange('maintenanceRate', parseFloat(e.target.value) / 100)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tollRate">Taxa de Pedágio (R$/km)</Label>
              <Input
                id="tollRate"
                type="number"
                step="0.01"
                value={parameters.tollRate}
                onChange={(e) => handleParameterChange('tollRate', parseFloat(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Recursos Humanos */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <CardTitle>Recursos Humanos</CardTitle>
            </div>
            <CardDescription>
              Parâmetros relacionados ao pessoal e jornada de trabalho
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="driverHourlyRate">Custo Motorista (R$/hora)</Label>
              <Input
                id="driverHourlyRate"
                type="number"
                step="0.50"
                value={parameters.driverHourlyRate}
                onChange={(e) => handleParameterChange('driverHourlyRate', parseFloat(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="workingHoursPerDay">Horas de Trabalho/Dia</Label>
              <Input
                id="workingHoursPerDay"
                type="number"
                value={parameters.workingHoursPerDay}
                onChange={(e) => handleParameterChange('workingHoursPerDay', parseInt(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="workingDaysPerMonth">Dias de Trabalho/Mês</Label>
              <Input
                id="workingDaysPerMonth"
                type="number"
                value={parameters.workingDaysPerMonth}
                onChange={(e) => handleParameterChange('workingDaysPerMonth', parseInt(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="averageSpeed">Velocidade Média (km/h)</Label>
              <Input
                id="averageSpeed"
                type="number"
                value={parameters.averageSpeed}
                onChange={(e) => handleParameterChange('averageSpeed', parseInt(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Margem e Rentabilidade */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Fuel className="h-5 w-5 text-primary" />
              <CardTitle>Margem e Rentabilidade</CardTitle>
            </div>
            <CardDescription>
              Configurações de margem de lucro e rentabilidade
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profitMargin">Margem de Lucro (%)</Label>
              <Input
                id="profitMargin"
                type="number"
                step="0.01"
                value={parameters.profitMargin * 100}
                onChange={(e) => handleParameterChange('profitMargin', parseFloat(e.target.value) / 100)}
              />
            </div>
            
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Resumo dos Parâmetros</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Combustível: R$ {parameters.fuelPrice.toFixed(2)}/L</div>
                <div>Seguro: {(parameters.insuranceRate * 100).toFixed(1)}%</div>
                <div>Manutenção: {(parameters.maintenanceRate * 100).toFixed(1)}%</div>
                <div>Motorista: R$ {parameters.driverHourlyRate.toFixed(2)}/h</div>
                <div>Pedágio: R$ {parameters.tollRate.toFixed(2)}/km</div>
                <div>Margem: {(parameters.profitMargin * 100).toFixed(1)}%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status do Sistema */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              <CardTitle>Status do Sistema</CardTitle>
            </div>
            <CardDescription>
              Informações sobre a configuração atual do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Sistema de Cálculos</span>
              <Badge className="bg-green-500/10 text-green-700 border-green-200">
                Ativo
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Parâmetros Atualizados</span>
              <Badge className="bg-blue-500/10 text-blue-700 border-blue-200">
                Hoje
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Última Simulação</span>
              <Badge className="bg-gray-500/10 text-gray-700 border-gray-200">
                2 horas atrás
              </Badge>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-medium">Valores Calculados</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>Custo base por km: R$ {(parameters.fuelPrice / 10 + parameters.tollRate).toFixed(2)}</div>
                <div>Custo mensal motorista: R$ {(parameters.driverHourlyRate * parameters.workingHoursPerDay * parameters.workingDaysPerMonth).toFixed(2)}</div>
                <div>Tempo médio 100km: {(100 / parameters.averageSpeed).toFixed(1)}h</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}