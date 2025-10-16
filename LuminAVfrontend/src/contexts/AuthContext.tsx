import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import axios from "axios";
import { registerRequest, loginRequest, RegisterResponse, LoginResponse } from "@/services/auth";

type User = {
  id: number;          // <- numérico, igual al backend
  fullName: string;
  email: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

type Props = { children: ReactNode };

const STORAGE_KEY = "luminav_user";   // guardaremos {id, fullName, email, role}
const OWNER_KEY   = "ownerId";        // guardaremos el id en string p/ devices

export const AuthProvider: React.FC<Props> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hidratar sesión al montar
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as User;
        setUser(parsed);
      }
    } catch {
      // ignora errores de parseo
    }
  }, []);

  const persistUser = (u: User) => {
    setUser(u);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    localStorage.setItem(OWNER_KEY, String(u.id));
  };

  const clearSession = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(OWNER_KEY);
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await registerRequest({ fullName: name, email, password });
      const data: RegisterResponse = res.data;
      const u: User = { id: data.id, fullName: data.fullName, email: data.email, role: data.role };
      persistUser(u);
      return true;
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const msg = (err.response?.data as any) ?? "Error de red";
        if (status === 409) setError("El email ya está registrado");
        else if (status === 400) setError(typeof msg === "string" ? msg : "Datos inválidos");
        else setError("Error al registrar");
      } else setError("Error desconocido");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await loginRequest({ email, password });
      const data: LoginResponse = res.data;
      const u: User = { id: data.id, fullName: data.fullName, email: data.email, role: data.role };
      persistUser(u);
      return true;
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const msg = (err.response?.data as any) ?? "Error de red";
        if (status === 401) setError("Credenciales inválidas");
        else if (status === 400) setError(typeof msg === "string" ? msg : "Datos inválidos");
        else setError("Error al iniciar sesión");
      } else setError("Error desconocido");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearSession();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, error, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
