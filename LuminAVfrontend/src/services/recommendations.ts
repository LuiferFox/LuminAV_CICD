
import { api } from "@/services/api";

export type RecommendationDTO = {
  id: number;
  message: string;
  level: "INFO" | "WARN" | "ALERT";
  createdAt: string;
};

export const listRecommendations = (ownerId: number, limit = 20) =>
  api.get<RecommendationDTO[]>("/recommendations", { params: { ownerId, limit }});

