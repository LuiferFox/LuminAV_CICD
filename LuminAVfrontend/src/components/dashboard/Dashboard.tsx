// src/components/dashboard/Dashboard.tsx
import React, { useEffect, useMemo, useState } from "react";
import { MetricCard } from "./MetricCard";
import { EnergyChart } from "./EnergyChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Zap, DollarSign, Clock, TrendingUp } from "lucide-react";
import { getDashboardSummary, DashboardSummary } from "@/services/dashboard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { da } from "date-fns/locale";

export const Dashboard: React.FC = () => {
  const { toast } = useToast();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(false);

  const ownerId = useMemo(() => {
    const v = localStorage.getItem("ownerId");
    const n = v ? Number(v) : NaN;
    return Number.isNaN(n) ? null : n;
  }, []);

  // últimos 7 días
  const to = new Date();
  const from = new Date(); from.setDate(to.getDate() - 7);
  const fromISO = from.toISOString();
  const toISO = to.toISOString();

  const load = async () => {
    if (!ownerId) {
      toast({ variant: "destructive", title: "No hay usuario activo", description: "Inicia sesión o regístrate." });
      return;
    }
    setLoading(true);
    try {
      const res = await getDashboardSummary(ownerId, fromISO, toISO);
      setData(res.data);
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Error al cargar", description: "No se pudo obtener el dashboard." });
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [ownerId]);

  // Cards
  const metrics = [
    { title: "Consumo Total", value: `${data?.totalKwh ?? 0} kWh`, subtitle: "Últimos 7 días", icon: Zap, trend: undefined as number|undefined },
    { title: "Costo Estimado", value: (data ? (data.totalCost).toLocaleString("es-CO",{style:"currency",currency:"COP"}) : "$0"), subtitle: "Tarifa actual", icon: DollarSign, trend: undefined },
    { title: "Horario Punta", value: "—", subtitle: "Del consumo total", icon: Clock, trend: undefined },
    { title: "Eficiencia", value: "—", subtitle: "Respecto al objetivo", icon: TrendingUp, trend: undefined },
  ];

  // Charts
  const hourlyData = {
    labels: (data?.byHour ?? []).map(p => p.bucket.split(" ")[1] ?? p.bucket),
    datasets: [{
      label: "kWh",
      data: (data?.byHour ?? []).map(p => p.kwh),
      borderColor: "hsl(var(--primary))",
      backgroundColor: "hsl(var(--primary) / 0.1)",
      fill: true,
      tension: 0.4,
    }],
  };

  const dailyData = {
    labels: (data?.byDay ?? []).map(p => p.bucket),
    datasets: [{
      label: "kWh",
      data: (data?.byDay ?? []).map(p => p.kwh),
      backgroundColor: (data?.byDay ?? []).map(() => "hsl(var(--primary))"),
    }],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Energético</h1>
          <p className="text-muted-foreground">Monitorea tu consumo y optimiza tu eficiencia energética</p>
        </div>
        <Button onClick={load} disabled={loading}>{loading ? "Cargando..." : "Actualizar"}</Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, i) => (<MetricCard key={i} {...m} />))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EnergyChart type="line" title="Consumo por Hora" description="Últimas horas" data={hourlyData} />
        <EnergyChart type="bar" title="Consumo por Día" description="Últimos 7 días" data={dailyData} />
      </div>

      {/* Top Devices Table */}
      <Card className="gradient-card shadow-card">
        <CardHeader>
          <CardTitle>Top 5 Dispositivos</CardTitle>
          <CardDescription>Mayor consumo en el periodo</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dispositivo</TableHead>
                <TableHead className="text-right">kWh</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.topDevices ?? []).map((d) => (
                <TableRow key={d.deviceId}>
                  <TableCell className="font-medium">{d.name}</TableCell>
                  <TableCell className="text-right">{d.kwh}</TableCell>
                </TableRow>
              ))}
              {(!data || data.topDevices.length === 0) && (
                <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground">Sin datos</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
export default Dashboard;