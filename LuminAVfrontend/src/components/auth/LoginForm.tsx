import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, error } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await login(email, password);
    if (ok) {
      toast({
        title: "¡Bienvenido a LuminAV!",
        description: "Has iniciado sesión correctamente.",
      });
      // Redirige a donde prefieras tras login
      navigate("/dashboard");
    } else {
      toast({
        variant: "destructive",
        title: "Error de autenticación",
        description: error ?? "Credenciales incorrectas. Inténtalo de nuevo.",
      });
    }
  };

  return (
    <Card className="w-full max-w-md gradient-card shadow-card">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <img src="/LuminAV.png" alt="Login Icon" className="h-12 w-12 object-contain" />
        </div>
        <CardTitle className="text-2xl font-bold">LuminAV</CardTitle>
        <CardDescription>Inicia sesión en tu panel de gestión energética</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="Tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Button type="submit" className="w-full" variant="energy" disabled={isLoading}>
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={onSwitchToRegister}
              disabled={isLoading}
            >
              ¿No tienes cuenta? Regístrate
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
