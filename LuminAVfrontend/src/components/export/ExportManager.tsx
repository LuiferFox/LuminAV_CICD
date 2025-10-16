import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Download, FileText, Calendar, Database } from 'lucide-react';

interface ExportConfig {
  dataType: 'devices' | 'readings' | 'both';
  format: 'csv' | 'xlsx';
  dateRange: 'all' | 'last30' | 'last90' | 'thisYear';
  includeHeaders: boolean;
  includeMetadata: boolean;
}

export const ExportManager: React.FC = () => {
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    dataType: 'both',
    format: 'csv',
    dateRange: 'last30',
    includeHeaders: true,
    includeMetadata: false
  });

  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleConfigChange = (field: keyof ExportConfig, value: any) => {
    setExportConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateCSV = (data: any[], headers: string[]) => {
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => 
        JSON.stringify(row[header] || '')
      ).join(','))
    ].join('\n');

    return csvContent;
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    setIsExporting(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Sample data - in real app this would come from API
      const devicesData = [
        {
          id: '1',
          name: 'Aire Acondicionado Sala',
          type: 'Climatización',
          power: 2500,
          location: 'Sala Principal',
          status: 'active'
        },
        {
          id: '2',
          name: 'Refrigerador Cocina',
          type: 'Electrodoméstico',
          power: 150,
          location: 'Cocina',
          status: 'active'
        },
        {
          id: '3',
          name: 'Sistema Iluminación LED',
          type: 'Iluminación',
          power: 45,
          location: 'Toda la casa',
          status: 'active'
        }
      ];

      const readingsData = [
        {
          id: '1',
          deviceId: '1',
          deviceName: 'Aire Acondicionado Sala',
          value: 12.5,
          timestamp: '2024-01-15T14:30:00',
          date: '2024-01-15',
          time: '14:30:00'
        },
        {
          id: '2',
          deviceId: '2',
          deviceName: 'Refrigerador Cocina',
          value: 3.2,
          timestamp: '2024-01-15T14:30:00',
          date: '2024-01-15',
          time: '14:30:00'
        },
        {
          id: '3',
          deviceId: '1',
          deviceName: 'Aire Acondicionado Sala',
          value: 15.8,
          timestamp: '2024-01-14T16:45:00',
          date: '2024-01-14',
          time: '16:45:00'
        }
      ];

      const currentDate = new Date().toISOString().split('T')[0];
      
      if (exportConfig.dataType === 'devices' || exportConfig.dataType === 'both') {
        const deviceHeaders = exportConfig.includeHeaders 
          ? ['ID', 'Nombre', 'Tipo', 'Potencia (W)', 'Ubicación', 'Estado']
          : ['id', 'name', 'type', 'power', 'location', 'status'];
        
        const deviceCSV = generateCSV(devicesData, ['id', 'name', 'type', 'power', 'location', 'status']);
        const deviceContent = exportConfig.includeHeaders 
          ? `ID,Nombre,Tipo,Potencia (W),Ubicación,Estado\n${deviceCSV.split('\n').slice(1).join('\n')}`
          : deviceCSV;
        
        downloadFile(
          deviceContent,
          `luminav-dispositivos-${currentDate}.${exportConfig.format}`,
          'text/csv'
        );
      }

      if (exportConfig.dataType === 'readings' || exportConfig.dataType === 'both') {
        const readingHeaders = exportConfig.includeHeaders
          ? ['ID', 'ID Dispositivo', 'Nombre Dispositivo', 'Valor (kWh)', 'Fecha y Hora', 'Fecha', 'Hora']
          : ['id', 'deviceId', 'deviceName', 'value', 'timestamp', 'date', 'time'];
        
        const readingsCSV = generateCSV(readingsData, ['id', 'deviceId', 'deviceName', 'value', 'timestamp', 'date', 'time']);
        const readingsContent = exportConfig.includeHeaders
          ? `ID,ID Dispositivo,Nombre Dispositivo,Valor (kWh),Fecha y Hora,Fecha,Hora\n${readingsCSV.split('\n').slice(1).join('\n')}`
          : readingsCSV;
        
        downloadFile(
          readingsContent,
          `luminav-lecturas-${currentDate}.${exportConfig.format}`,
          'text/csv'
        );
      }

      toast({
        title: "Exportación completada",
        description: `Los datos han sido exportados correctamente en formato ${exportConfig.format.toUpperCase()}.`,
      });

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error en la exportación",
        description: "No se pudieron exportar los datos. Inténtalo de nuevo.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getDataTypeDescription = () => {
    switch (exportConfig.dataType) {
      case 'devices':
        return 'Solo información de dispositivos registrados';
      case 'readings':
        return 'Solo lecturas de energía registradas';
      case 'both':
        return 'Dispositivos y lecturas de energía';
      default:
        return '';
    }
  };

  const getDateRangeDescription = () => {
    switch (exportConfig.dateRange) {
      case 'all':
        return 'Todos los registros disponibles';
      case 'last30':
        return 'Últimos 30 días';
      case 'last90':
        return 'Últimos 90 días';
      case 'thisYear':
        return 'Este año';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Exportación de Datos</h1>
        <p className="text-muted-foreground">
          Descarga tus datos de dispositivos y lecturas en formato CSV o Excel
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export Configuration */}
        <Card className="gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Configuración de Exportación
            </CardTitle>
            <CardDescription>
              Personaliza los datos que deseas exportar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Tipo de datos</Label>
              <Select 
                value={exportConfig.dataType} 
                onValueChange={(value: 'devices' | 'readings' | 'both') => handleConfigChange('dataType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="devices">Solo Dispositivos</SelectItem>
                  <SelectItem value="readings">Solo Lecturas</SelectItem>
                  <SelectItem value="both">Dispositivos y Lecturas</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {getDataTypeDescription()}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Formato de archivo</Label>
              <Select 
                value={exportConfig.format} 
                onValueChange={(value: 'csv' | 'xlsx') => handleConfigChange('format', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (Comma Separated Values)</SelectItem>
                  <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Rango de fechas</Label>
              <Select 
                value={exportConfig.dateRange} 
                onValueChange={(value: 'all' | 'last30' | 'last90' | 'thisYear') => handleConfigChange('dateRange', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los registros</SelectItem>
                  <SelectItem value="last30">Últimos 30 días</SelectItem>
                  <SelectItem value="last90">Últimos 90 días</SelectItem>
                  <SelectItem value="thisYear">Este año</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {getDateRangeDescription()}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeHeaders"
                  checked={exportConfig.includeHeaders}
                  onCheckedChange={(checked) => handleConfigChange('includeHeaders', checked)}
                />
                <Label htmlFor="includeHeaders" className="text-sm">
                  Incluir encabezados de columna
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeMetadata"
                  checked={exportConfig.includeMetadata}
                  onCheckedChange={(checked) => handleConfigChange('includeMetadata', checked)}
                />
                <Label htmlFor="includeMetadata" className="text-sm">
                  Incluir metadatos del sistema
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export Preview */}
        <Card className="gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Vista Previa de Exportación
            </CardTitle>
            <CardDescription>
              Resumen de los datos que se exportarán
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Tipo de datos</span>
                </div>
                <span className="text-sm font-medium">
                  {exportConfig.dataType === 'devices' ? 'Dispositivos' : 
                   exportConfig.dataType === 'readings' ? 'Lecturas' : 'Ambos'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Formato</span>
                </div>
                <span className="text-sm font-medium">{exportConfig.format.toUpperCase()}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Período</span>
                </div>
                <span className="text-sm font-medium">
                  {exportConfig.dateRange === 'all' ? 'Todos' :
                   exportConfig.dateRange === 'last30' ? '30 días' :
                   exportConfig.dateRange === 'last90' ? '90 días' : 'Este año'}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="text-center space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Registros estimados a exportar
                  </p>
                  <p className="text-3xl font-bold text-primary">
                    {exportConfig.dataType === 'devices' ? '3' :
                     exportConfig.dataType === 'readings' ? '3' : '6'}
                  </p>
                </div>

                <Button
                  variant="energy"
                  size="lg"
                  onClick={handleExport}
                  disabled={isExporting}
                  className="w-full"
                >
                  {isExporting ? (
                    <>
                      <Download className="h-4 w-4 animate-pulse" />
                      Exportando...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Exportar Datos
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export History */}
      <Card className="gradient-card shadow-card">
        <CardHeader>
          <CardTitle>Historial de Exportaciones</CardTitle>
          <CardDescription>
            Últimas exportaciones realizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { date: '2024-01-15', type: 'Dispositivos y Lecturas', format: 'CSV', status: 'Completada' },
              { date: '2024-01-10', type: 'Solo Lecturas', format: 'Excel', status: 'Completada' },
              { date: '2024-01-05', type: 'Solo Dispositivos', format: 'CSV', status: 'Completada' },
            ].map((export_, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{export_.type}</p>
                    <p className="text-xs text-muted-foreground">{export_.date} • {export_.format}</p>
                  </div>
                </div>
                <span className="text-xs text-success font-medium">{export_.status}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};