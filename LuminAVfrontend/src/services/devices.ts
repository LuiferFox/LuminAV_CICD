// src/services/devices.ts
import { api } from "@/services/api";

export type DeviceDTO = {
  id: number;
  name: string;
  type: string;
  watt: number;      // <- en backend la llamamos 'watt'
  location: string;
  status?: "ACTIVE" | "INACTIVE";
  createdAt?: string;
};

export type UpsertDevicePayload = {
  name: string;
  type: string;
  watt: number;
  location: string;
};

export const listDevices = (ownerId: number) =>
  api.get<DeviceDTO[]>("/devices", { params: { ownerId } });

export const createDevice = (ownerId: number, body: UpsertDevicePayload) =>
  api.post<DeviceDTO>("/devices", body, { params: { ownerId } });

export const updateDevice = (ownerId: number, id: number, body: UpsertDevicePayload) =>
  api.put<DeviceDTO>(`/devices/${id}`, body, { params: { ownerId } });

export const deleteDevice = (ownerId: number, id: number) =>
  api.delete<void>(`/devices/${id}`, { params: { ownerId } });
