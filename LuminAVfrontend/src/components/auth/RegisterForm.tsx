import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Zap, Mail, Lock, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { register, isLoading, error } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await register(name, email, password);
    if (ok) {
      toast({
        title: "¡Cuenta creada con éxito!",
        description: "Bienvenido a LuminAV. Tu cuenta ha sido creada correctamente.",
      });
      // Redirige a donde prefieras tras registrarse (devices o dashboard)
      navigate("/devices");
    } else {
      toast({
        variant: "destructive",
        title: "Error de registro",
        description: error ?? "No se pudo crear la cuenta. Inténtalo de nuevo.",
      });
    }
  };

  return (
    <Card className="w-full max-w-md gradient-card shadow-card">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 gradient-energy rounded-full shadow-energy">
            <Zap className="h-8 w-8 text-primary-foreground" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">LuminAV</CardTitle>
        <CardDescription>Crea tu cuenta para gestionar tu energía</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre completo</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="Tu nombre completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Crea una contraseña segura"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
                minLength={6}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Button type="submit" className="w-full" variant="energy" disabled={isLoading}>
              {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={onSwitchToLogin}
              disabled={isLoading}
            >
              ¿Ya tienes cuenta? Inicia sesión
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
