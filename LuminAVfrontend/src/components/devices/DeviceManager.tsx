import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Zap, Home, Cpu, RefreshCcw } from "lucide-react";
import { createDevice, deleteDevice, listDevices, updateDevice } from "@/services/devices";

type UiDevice = {
  id: number;
  name: string;
  type: string;
  power: number;       // UI usa 'power', backend usa 'watt'
  location: string;
  status: "active" | "inactive";
};

export const DeviceManager: React.FC = () => {
  const { toast } = useToast();

  const [devices, setDevices] = useState<UiDevice[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<UiDevice | null>(null);
  const [formData, setFormData] = useState({ name: "", type: "", power: "", location: "" });

  // Lee el ownerId (guardado por el AuthContext al registrarte o loguearte)
  const ownerId: number | null = useMemo(() => {
    const v = localStorage.getItem("ownerId");
    if (!v) return null;
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
  }, []);

  const deviceTypes = [
    "Climatización",
    "Electrodoméstico",
    "Iluminación",
    "Electrónica",
    "Calefacción",
    "Otros",
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Climatización":
      case "Calefacción":
        return <Zap className="h-4 w-4" />;
      case "Electrodoméstico":
        return <Home className="h-4 w-4" />;
      default:
        return <Cpu className="h-4 w-4" />;
    }
  };

  const load = async () => {
    if (!ownerId) {
      toast({
        variant: "destructive",
        title: "No hay usuario activo",
        description: "Debes registrarte o iniciar sesión para ver/crear dispositivos.",
      });
      return;
    }
    setLoading(true);
    try {
      const res = await listDevices(ownerId);
      const rows: UiDevice[] = (res.data || []).map((d) => ({
        id: d.id,
        name: d.name,
        type: d.type,
        power: d.watt,                         // mapeo watt -> power
        location: d.location,
        status: "active",                      // si aún no guardas estado en backend
      }));
      setDevices(rows);
    } catch (e: any) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Error al cargar",
        description: "No se pudieron obtener los dispositivos.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerId]);

  const handleAddDevice = () => {
    setEditingDevice(null);
    setFormData({ name: "", type: "", power: "", location: "" });
    setIsDialogOpen(true);
  };

  const handleEditDevice = (device: UiDevice) => {
    setEditingDevice(device);
    setFormData({
      name: device.name,
      type: device.type,
      power: device.power.toString(),
      location: device.location,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteDevice = async (id: number) => {
    if (!ownerId) return;
    try {
      await deleteDevice(ownerId, id);
      setDevices((prev) => prev.filter((d) => d.id !== id));
      toast({ title: "Dispositivo eliminado", description: "El dispositivo fue eliminado." });
    } catch (e: any) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Error al eliminar",
        description: "No fue posible eliminar el dispositivo.",
      });
    }
  };

  const handleSaveDevice = async () => {
    if (!formData.name || !formData.type || !formData.power || !formData.location) {
      toast({
        variant: "destructive",
        title: "Campos incompletos",
        description: "Por favor, completa todos los campos.",
      });
      return;
    }
    if (!ownerId) {
      toast({
        variant: "destructive",
        title: "No hay usuario activo",
        description: "Inicia sesión o regístrate.",
      });
      return;
    }

    const watt = parseInt(formData.power, 10);
    if (Number.isNaN(watt) || watt <= 0) {
      toast({ variant: "destructive", title: "Potencia inválida", description: "Ingresa un número mayor a 0." });
      return;
    }

    const payload = {
      name: formData.name,
      type: formData.type,
      watt,                          // backend espera 'watt'
      location: formData.location,
    };

    try {
      if (editingDevice) {
        const res = await updateDevice(ownerId, editingDevice.id, payload);
        const updated: UiDevice = {
          id: res.data.id,
          name: res.data.name,
          type: res.data.type,
          power: res.data.watt,
          location: res.data.location,
          status: editingDevice.status,
        };
        setDevices((prev) => prev.map((d) => (d.id === editingDevice.id ? updated : d)));
        toast({ title: "Dispositivo actualizado", description: "Cambios guardados correctamente." });
      } else {
        const res = await createDevice(ownerId, payload);
        const created: UiDevice = {
          id: res.data.id,
          name: res.data.name,
          type: res.data.type,
          power: res.data.watt,
          location: res.data.location,
          status: "active",
        };
        setDevices((prev) => [...prev, created]);
        toast({ title: "Dispositivo agregado", description: "Dispositivo creado en la base de datos." });
      }
      setIsDialogOpen(false);
      setFormData({ name: "", type: "", power: "", location: "" });
    } catch (e: any) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Error al guardar",
        description: "No fue posible guardar el dispositivo.",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Dispositivos</h1>
          <p className="text-muted-foreground">Administra todos tus dispositivos y equipos energéticos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={load} disabled={loading}>
            <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Button variant="energy" onClick={handleAddDevice}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Dispositivo
          </Button>
        </div>
      </div>

      {/* Devices Table */}
      <Card className="gradient-card shadow-card">
        <CardHeader>
          <CardTitle>Dispositivos Registrados</CardTitle>
          <CardDescription>Lista de todos los dispositivos monitoreados en tu sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dispositivo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Potencia</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices.map((device) => (
                <TableRow key={device.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(device.type)}
                      {device.name}
                    </div>
                  </TableCell>
                  <TableCell>{device.type}</TableCell>
                  <TableCell>{device.power}W</TableCell>
                  <TableCell>{device.location}</TableCell>
                  <TableCell>
                    <Badge
                      variant={device.status === "active" ? "default" : "secondary"}
                      className={device.status === "active" ? "bg-success" : ""}
                    >
                      {device.status === "active" ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditDevice(device)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDevice(device.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {devices.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No hay dispositivos. ¡Agrega el primero!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Device Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingDevice ? "Editar Dispositivo" : "Agregar Dispositivo"}</DialogTitle>
            <DialogDescription>
              {editingDevice ? "Modifica los datos del dispositivo seleccionado" : "Ingresa los datos del nuevo dispositivo"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del dispositivo</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Aire Acondicionado Sala"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  {deviceTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="power">Potencia (W)</Label>
              <Input
                id="power"
                type="number"
                value={formData.power}
                onChange={(e) => setFormData({ ...formData, power: e.target.value })}
                placeholder="Ej: 2500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Ej: Sala Principal"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="energy" onClick={handleSaveDevice}>
              {editingDevice ? "Actualizar" : "Agregar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
