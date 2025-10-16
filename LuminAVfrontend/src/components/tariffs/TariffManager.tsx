import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, Clock, DollarSign, Save } from 'lucide-react';

interface TariffConfig {
  pricePerKwh: number;
  hasPeakHours: boolean;
  peakStartTime: string;
  peakEndTime: string;
  peakPriceMultiplier: number;
  currency: string;
}

export const TariffManager: React.FC = () => {
  const [tariffConfig, setTariffConfig] = useState<TariffConfig>({
    pricePerKwh: 0.12,
    hasPeakHours: true,
    peakStartTime: '14:00',
    peakEndTime: '20:00',
    peakPriceMultiplier: 1.5,
    currency: 'EUR'
  });

  const [isModified, setIsModified] = useState(false);
  const { toast } = useToast();

  const handleConfigChange = (field: keyof TariffConfig, value: any) => {
    setTariffConfig(prev => ({
      ...prev,
      [field]: value
    }));
    setIsModified(true);
  };

  const handleSave = () => {
    // In real app, this would call the API
    console.log('Saving tariff config:', tariffConfig);
    
    toast({
      title: "Configuración guardada",
      description: "La configuración de tarifas ha sido actualizada correctamente.",
    });
    
    setIsModified(false);
  };

  const calculatePeakPrice = () => {
    return (tariffConfig.pricePerKwh * tariffConfig.peakPriceMultiplier).toFixed(4);
  };

  const currencies = [
    { value: 'EUR', label: '€ (Euro)' },
    { value: 'USD', label: '$ (Dólar)' },
    { value: 'GBP', label: '£ (Libra)' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Tarifas</h1>
          <p className="text-muted-foreground">
            Configura los precios y horarios de tu tarifa eléctrica
          </p>
        </div>
        {isModified && (
          <Button variant="energy" onClick={handleSave}>
            <Save className="h-4 w-4" />
            Guardar Cambios
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Configuration */}
        <Card className="gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Configuración Básica
            </CardTitle>
            <CardDescription>
              Establece el precio base y la moneda de tu tarifa eléctrica
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="currency">Moneda</Label>
              <Select 
                value={tariffConfig.currency} 
                onValueChange={(value) => handleConfigChange('currency', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona la moneda" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pricePerKwh">Precio por kWh</Label>
              <div className="relative">
                <Input
                  id="pricePerKwh"
                  type="number"
                  step="0.001"
                  value={tariffConfig.pricePerKwh}
                  onChange={(e) => handleConfigChange('pricePerKwh', parseFloat(e.target.value))}
                  className="pr-12"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  {tariffConfig.currency === 'EUR' ? '€' : tariffConfig.currency === 'USD' ? '$' : '£'}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Precio base por kWh durante horario normal
              </p>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Precio Actual</p>
                  <p className="text-sm text-muted-foreground">Horario normal</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">
                    {tariffConfig.pricePerKwh.toFixed(4)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {tariffConfig.currency === 'EUR' ? '€' : tariffConfig.currency === 'USD' ? '$' : '£'}/kWh
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Peak Hours Configuration */}
        <Card className="gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Horarios Punta
            </CardTitle>
            <CardDescription>
              Configura los horarios de mayor costo energético
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Activar horarios punta</Label>
                <p className="text-sm text-muted-foreground">
                  Precios diferenciados por horario
                </p>
              </div>
              <Switch
                checked={tariffConfig.hasPeakHours}
                onCheckedChange={(checked) => handleConfigChange('hasPeakHours', checked)}
              />
            </div>

            {tariffConfig.hasPeakHours && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="peakStartTime">Hora de inicio</Label>
                    <Input
                      id="peakStartTime"
                      type="time"
                      value={tariffConfig.peakStartTime}
                      onChange={(e) => handleConfigChange('peakStartTime', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="peakEndTime">Hora de fin</Label>
                    <Input
                      id="peakEndTime"
                      type="time"
                      value={tariffConfig.peakEndTime}
                      onChange={(e) => handleConfigChange('peakEndTime', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="peakMultiplier">Multiplicador horario punta</Label>
                  <Input
                    id="peakMultiplier"
                    type="number"
                    step="0.1"
                    value={tariffConfig.peakPriceMultiplier}
                    onChange={(e) => handleConfigChange('peakPriceMultiplier', parseFloat(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground">
                    Factor por el que se multiplica el precio base
                  </p>
                </div>

                <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-warning-foreground">Precio Horario Punta</p>
                      <p className="text-sm text-muted-foreground">
                        {tariffConfig.peakStartTime} - {tariffConfig.peakEndTime}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-warning">
                        {calculatePeakPrice()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {tariffConfig.currency === 'EUR' ? '€' : tariffConfig.currency === 'USD' ? '$' : '£'}/kWh
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary Card */}
      <Card className="gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Resumen de Configuración
          </CardTitle>
          <CardDescription>
            Vista general de tu configuración de tarifas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Precio Normal</p>
              <p className="text-xl font-bold text-primary">
                {tariffConfig.pricePerKwh.toFixed(4)} {tariffConfig.currency === 'EUR' ? '€' : tariffConfig.currency === 'USD' ? '$' : '£'}/kWh
              </p>
            </div>
            
            {tariffConfig.hasPeakHours && (
              <>
                <div className="text-center p-4 bg-warning/10 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Precio Punta</p>
                  <p className="text-xl font-bold text-warning">
                    {calculatePeakPrice()} {tariffConfig.currency === 'EUR' ? '€' : tariffConfig.currency === 'USD' ? '$' : '£'}/kWh
                  </p>
                </div>
                
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Horario Punta</p>
                  <p className="text-xl font-bold text-foreground">
                    {tariffConfig.peakStartTime} - {tariffConfig.peakEndTime}
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};