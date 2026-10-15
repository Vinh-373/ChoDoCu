import client from "./client";
import type { DichVu, MuaDichVuResponse } from "../types";

export const dichVuApi = {
  danhSach: () => client.get<DichVu[]>("/dich-vu").then((r) => r.data),
  mua: (idDichVu: number, phuongThucTT: string) =>
    client.post<MuaDichVuResponse>("/thanh-toan/mua-dich-vu", { idDichVu, phuongThucTT }).then((r) => r.data),
  /** Chỉ để thử nghiệm: BE thật sẽ nhận kết quả từ cổng thanh toán (webhook), không phải từ trình duyệt. */
  xacNhan: (idThanhToan: number, thanhCong: boolean) =>
    client.post("/thanh-toan/xac-nhan", { idThanhToan, thanhCong }).then(() => undefined),
};
