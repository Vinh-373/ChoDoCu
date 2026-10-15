import client from "./client";
import type { PhuongXa, ThanhPho } from "../types";

export const diaChiApi = {
  thanhPho: () => client.get<ThanhPho[]>("/dia-chi/thanh-pho").then((r) => r.data),
  phuongXa: (idThanhPho: number) =>
    client.get<PhuongXa[]>(`/dia-chi/thanh-pho/${idThanhPho}/phuong-xa`).then((r) => r.data),
};
