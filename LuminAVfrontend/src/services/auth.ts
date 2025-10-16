import { api } from "./api";

export type RegisterPayload = { fullName: string; email: string; password: string; };
export type RegisterResponse = { id: number; fullName: string; email: string; role: string; createdAt: string; };

export const registerRequest = (data: RegisterPayload) =>
  api.post<RegisterResponse>("/auth/register", data);

export type LoginPayload = { email: string; password: string; };
export type LoginResponse = { id: number; fullName: string; email: string; role: string; };

export const loginRequest = (data: LoginPayload) =>
  api.post<LoginResponse>("/auth/login", data);

