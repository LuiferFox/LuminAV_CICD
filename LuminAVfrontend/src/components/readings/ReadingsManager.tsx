// src/components/readings/ReadingsManager.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Activity, Calendar, RefreshCcw } from "lucide-react";
import { EnergyChart } from "@/components/dashboard/EnergyChart";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { listDevices, DeviceDTO } from "@/services/devices";
import { listReadings, createReading } from "@/services/readings";

type UiReading = {
  id: number;
  deviceId: number;
  deviceName: string;
  kwh: number;
  timestamp: Date;
};

export const ReadingsManager: React.FC = () => {
  const { toast } = useToast();

  const [devices, setDevices] = useState<DeviceDTO[]>([]);
  const [readings, setReadings] = useState<UiReading[]>([]);
  const [loading, setLoading] = useState(false);

  const to = new Date();
  const from = new Date(); from.setDate(to.getDate() - 7);
  const fromISO = from.toISOString();
  const toISO = to.toISOString();

  const ownerId = useMemo(() => {
    const v = localStorage.getItem("ownerId");
    const n = v ? Number(v) : NaN;
    return Number.isNaN(n) ? null : n;
  }, []);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ deviceId: "", kwh: "", date: "", time: "", minutes: "60" });

  const loadAll = async () => {
    if (!ownerId) {
      toast({ variant: "destructive", title: "No hay usuario activo", description: "Inicia sesión o regístrate." });
      return;
    }
    setLoading(true);
    try {
      const [dres, rres] = await Promise.all([
        listDevices(ownerId),
        listReadings(ownerId, fromISO, toISO),
      ]);
      setDevices(dres.data);

      const mapped: UiReading[] = rres.data.map((r) => ({
        id: r.id,
        deviceId: r.device.id,
        deviceName: r.device.name,
        kwh: ((r.watt * ((r.minutes ?? 60) / 60)) / 1000),
        timestamp: new Date(r.recordedAt),
      })).sort((a,b)=> b.timestamp.getTime() - a.timestamp.getTime());

      setReadings(mapped);
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Error al cargar", description: "No se pudieron obtener dispositivos/lecturas." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); /* eslint-disable-next-line */ }, [ownerId]);

  const handleAddReading = () => {
    const now = new Date();
    setFormData({
      deviceId: "",
      kwh: "",
      date: format(now, "yyyy-MM-dd"),
      time: format(now, "HH:mm"),
      minutes: "60",
    });
    setIsDialogOpen(true);
  };

  const handleSaveReading = async () => {
    if (!formData.deviceId || !formData.kwh || !formData.date || !formData.time || !formData.minutes) {
      toast({ variant: "destructive", title: "Error", description: "Completa todos los campos." });
      return;
    }
    const deviceId = Number(formData.deviceId);
    const kwh = Number(formData.kwh);
    const minutes = Number(formData.minutes);
    if (Number.isNaN(deviceId) || Number.isNaN(kwh) || kwh <= 0 || Number.isNaN(minutes) || minutes <= 0) {
      toast({ variant: "destructive", title: "Valores inválidos", description: "Revisa el dispositivo, kWh y minutos." });
      return;
    }
    const hours = minutes / 60;
    const watt = Math.round((kwh * 1000) / (hours || 1));
    const timestampISO = new Date(`${formData.date}T${formData.time}:00`).toISOString();

    try {
      const saved = await createReading({ deviceId, watt, minutes, recordedAt: timestampISO });
      const ui: UiReading = {
        id: saved.data.id,
        deviceId,
        deviceName: saved.data.device.name,
        kwh: ((saved.data.watt * (minutes/60)) / 1000),
        timestamp: new Date(saved.data.recordedAt),
      };
      setReadings(prev => [ui, ...prev]);
      toast({ title: "Lectura registrada", description: "Guardada en la base de datos." });
      setIsDialogOpen(false);
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Error al guardar", description: "No fue posible guardar la lectura." });
    }
  };

  const getDeviceChartData = (deviceId: number) => {
    const deviceReadings = readings
      .filter(r => r.deviceId === deviceId)
      .sort((a,b) => a.timestamp.getTime() - b.timestamp.getTime());

    const labels = deviceReadings.map(r => format(r.timestamp, "dd/MM", { locale: es }));
    const data = deviceReadings.map(r => Number(r.kwh.toFixed(3)));

    return {
      labels,
      datasets: [{
        label: "kWh",
        data,
        borderColor: "hsl(var(--primary))",
        backgroundColor: "hsl(var(--primary) / 0.1)",
        fill: true,
        tension: 0.4,
      }],
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Lecturas de Energía</h1>
          <p className="text-muted-foreground">Registra y monitorea el consumo energético de tus dispositivos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadAll} disabled={loading}>
            <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Button variant="energy" onClick={handleAddReading}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Lectura
          </Button>
        </div>
      </div>

      {/* Device Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {devices.map((device) => {
          const dr = readings.filter(r => r.deviceId === device.id);
          const chartData = getDeviceChartData(device.id);
          return (
            <Card key={device.id} className="gradient-card shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  {device.name}
                </CardTitle>
                <CardDescription>Últimas {dr.length} lecturas registradas</CardDescription>
              </CardHeader>
              <CardContent>
                {dr.length > 0 ? (
                  <div className="space-y-4">
                    <div className="h-[150px]">
                      <EnergyChart type="line" title="" data={chartData}
                        options={{ plugins: { legend: { display: false } }, scales: { x: { display:false }, y: { display:false }}}}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">
                        {dr[0]?.kwh.toFixed(3)} kWh
                      </p>
                      <p className="text-sm text-muted-foreground">Última lectura</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">Sin lecturas registradas</div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Readings Table */}
      <Card className="gradient-card shadow-card">
        <CardHeader>
          <CardTitle>Historial de Lecturas (últimos 7 días)</CardTitle>
          <CardDescription>Todas las lecturas registradas en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dispositivo</TableHead>
                <TableHead>kWh</TableHead>
                <TableHead>Fecha y Hora</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {readings.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    {r.deviceName}
                  </TableCell>
                  <TableCell className="text-primary font-semibold">{r.kwh.toFixed(3)} kWh</TableCell>
                  <TableCell className="text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {format(r.timestamp, "dd/MM/yyyy HH:mm", { locale: es })}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {readings.length === 0 && (
                <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">Sin datos</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Reading Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Registrar Nueva Lectura</DialogTitle>
            <DialogDescription>Ingresa los datos de la lectura de energía</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="device">Dispositivo</Label>
              <Select value={formData.deviceId} onValueChange={(value) => setFormData({ ...formData, deviceId: value })}>
                <SelectTrigger><SelectValue placeholder="Selecciona un dispositivo" /></SelectTrigger>
                <SelectContent>
                  {devices.map((d) => (<SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="kwh">Valor (kWh)</Label>
              <Input id="kwh" type="number" step="0.001" value={formData.kwh}
                     onChange={(e) => setFormData({ ...formData, kwh: e.target.value })} placeholder="Ej: 0.250" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Fecha</Label>
                <Input id="date" type="date" value={formData.date}
                       onChange={(e) => setFormData({ ...formData, date: e.target.value })}/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Hora</Label>
                <Input id="time" type="time" value={formData.time}
                       onChange={(e) => setFormData({ ...formData, time: e.target.value })}/>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="minutes">Minutos que representa</Label>
              <Input id="minutes" type="number" value={formData.minutes}
                     onChange={(e) => setFormData({ ...formData, minutes: e.target.value })} placeholder="60" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button variant="energy" onClick={handleSaveReading}>Registrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
