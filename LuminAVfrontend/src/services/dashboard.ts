
import { api } from "@/services/api";

export type SummaryPoint = { bucket: string; kwh: number };
export type DeviceUsage  = { deviceId: number; name: string; kwh: number };
export type DashboardSummary = {
  totalKwh: number;
  totalCost: number;
  byHour: SummaryPoint[];
  byDay: SummaryPoint[];
  topDevices: DeviceUsage[];
};

export const getDashboardSummary = (ownerId: number, fromISO: string, toISO: string) =>
  api.get<DashboardSummary>("/dashboard/summary", { params: { ownerId, from: fromISO, to: toISO }});
