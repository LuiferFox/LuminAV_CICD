
import { api } from "@/services/api";

export type CreateReading = {
  deviceId: number;
  watt: number;
  minutes?: number;     // default 60 en backend si lo dejas así
  recordedAt?: string;  // ISO opcional
};

export type ReadingDTO = {
  id: number;
  device: { id: number; name: string };
  watt: number;
  minutes: number;
  recordedAt: string;   // ISO
};

export const listReadings = (ownerId: number, fromISO: string, toISO: string, deviceId?: number) =>
  api.get<ReadingDTO[]>("/readings", { params: { ownerId, from: fromISO, to: toISO, deviceId } });

export const createReading = (data: CreateReading) =>
  api.post<ReadingDTO>("/readings", data);

export const bulkReadings = (items: CreateReading[]) =>
  api.post("/readings/bulk", { readings: items });
