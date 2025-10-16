// src/pages/RecommendationsManager.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Lightbulb, RefreshCw } from "lucide-react";
import { listRecommendations, RecommendationDTO } from "@/services/recommendations";

export const RecommendationsManager: React.FC = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<RecommendationDTO[]>([]);
  const [loading, setLoading] = useState(false);

  const ownerId = useMemo(() => {
    const v = localStorage.getItem("ownerId");
    const n = v ? Number(v) : NaN;
    return Number.isNaN(n) ? null : n;
  }, []);

  const load = async () => {
    if (!ownerId) {
      toast({ variant: "destructive", title: "No hay usuario activo", description: "Inicia sesión o regístrate." });
      return;
    }
    setLoading(true);
    try {
      const res = await listRecommendations(ownerId, 20);
      setItems(res.data);
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Error al cargar", description: "No se pudieron obtener recomendaciones." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [ownerId]);

  const levelColor = (level: string) =>
    level === "ALERT" ? "destructive" : level === "WARN" ? "secondary" : "default";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Recomendaciones de Ahorro</h1>
          <p className="text-muted-foreground">Sugerencias generadas automáticamente según tu consumo</p>
        </div>
        <Button variant="energy" onClick={load} disabled={loading}>
          {loading ? (<><RefreshCw className="h-4 w-4 animate-spin" /> Actualizando...</>) :
                      (<><Lightbulb className="h-4 w-4" /> Actualizar</>)}
        </Button>
      </div>

      <div className="space-y-4">
        {items.map((r) => (
          <Card key={r.id} className="gradient-card shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">{new Date(r.createdAt).toLocaleString()}</CardTitle>
                <CardDescription>Nivel: {r.level}</CardDescription>
              </div>
              <Badge variant={levelColor(r.level) as any}>{r.level}</Badge>
            </CardHeader>
            <CardContent><p>{r.message}</p></CardContent>
          </Card>
        ))}
        {items.length === 0 && (
          <Card className="gradient-card shadow-card">
            <CardContent className="p-12 text-center">
              <Lightbulb className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Sin recomendaciones aún</h3>
              <p className="text-muted-foreground">Cuando el agente detecte patrones, verás sugerencias aquí.</p>
              <div className="mt-4">
                <Button variant="energy" onClick={load}><Lightbulb className="h-4 w-4" />Actualizar</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
export default RecommendationsManager;