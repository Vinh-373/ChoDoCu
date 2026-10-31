/** Kiểu nội bộ mô tả một dòng giao dịch dùng để dựng giao diện quản trị khi chưa có API tổng hợp. */
export type MockStatus = "ThanhCong" | "ChoXuLy" | "ThatBai";

/** Các trường dùng chung ở bảng giao dịch và trang chi tiết của dữ liệu minh họa. */
export interface MockPayment {
  id: string;
  transactionRef: string;
  serviceName: string;
  serviceTag: string;
  buyer: string;
  buyerPhone: string;
  amount: number;
  methodIndex: number;
  fallbackMethod: string;
  status: MockStatus;
  minutesAgo: number;
}

/**
 * DỮ LIỆU MINH HỌA, KHÔNG PHẢI giao dịch trong database.
 * Backend hiện chỉ có lịch sử mua dịch vụ theo tài khoản đăng nhập; chưa có API admin
 * để lấy giao dịch toàn sàn, thông tin người mua, mã tham chiếu cổng và trạng thái lịch sử.
 */
export const MOCK_PAYMENTS: MockPayment[] = [
  { id: "GD98231", transactionRef: "VNP182891", serviceName: "GóiHiện", serviceTag: "Phổ thông", buyer: "Nguyễn Văn Tuấn", buyerPhone: "0912 · 345 · 678", amount: 200_000, methodIndex: 0, fallbackMethod: "VietQR", status: "ThanhCong", minutesAgo: 45 },
  { id: "GD98230", transactionRef: "MMY791002", serviceName: "GóiVIP_Pro", serviceTag: "VIP Kim Cương", buyer: "Đặng Quốc Tuấn", buyerPhone: "0988 · 123 · 234", amount: 550_000, methodIndex: 1, fallbackMethod: "Ví MoMo", status: "ThanhCong", minutesAgo: 90 },
  { id: "GD98229", transactionRef: "Đang chờ", serviceName: "GóiHiện", serviceTag: "Cơ bản", buyer: "Lê Văn Hùng", buyerPhone: "0934 · 888 · 999", amount: 100_000, methodIndex: 0, fallbackMethod: "VNPay QR", status: "ChoXuLy", minutesAgo: 190 },
  { id: "GD98228", transactionRef: "UNC-291881", serviceName: "GóiĐộcQuyền_DN", serviceTag: "Doanh nghiệp", buyer: "Cty TNHH Đồ Gia Dụng Xanh", buyerPhone: "0911 · 888 · 291", amount: 1_500_000, methodIndex: 2, fallbackMethod: "Chuyển khoản NH", status: "ThanhCong", minutesAgo: 320 },
  { id: "GD98225", transactionRef: "Lỗi: Timeout cổng", serviceName: "GóiHiện", serviceTag: "Phổ thông", buyer: "Bùi Quang Huy", buyerPhone: "0978 · 112 · 233", amount: 200_000, methodIndex: 1, fallbackMethod: "Thẻ tín dụng", status: "ThatBai", minutesAgo: 520 },
  { id: "GD98220", transactionRef: "VNP182204", serviceName: "GóiVIP_Pro", serviceTag: "VIP Kim Cương", buyer: "Phan Anh Tuấn", buyerPhone: "0903 · 654 · 789", amount: 600_000, methodIndex: 0, fallbackMethod: "VietQR", status: "ThanhCong", minutesAgo: 710 },
  { id: "GD98218", transactionRef: "Đang chờ", serviceName: "GóiHiện", serviceTag: "Phổ thông", buyer: "Trần Thị Mai", buyerPhone: "0918 · 772 · 341", amount: 200_000, methodIndex: 2, fallbackMethod: "Chuyển khoản NH", status: "ChoXuLy", minutesAgo: 850 },
  { id: "GD98214", transactionRef: "MMY738910", serviceName: "GóiHiện", serviceTag: "Cơ bản", buyer: "Hoàng Văn Long", buyerPhone: "0945 · 123 · 987", amount: 100_000, methodIndex: 1, fallbackMethod: "Ví MoMo", status: "ThanhCong", minutesAgo: 1_120 },
  { id: "GD98210", transactionRef: "VNP181834", serviceName: "GóiVIP_Pro", serviceTag: "VIP Kim Cương", buyer: "Phạm Thị Ngọc", buyerPhone: "0902 · 442 · 128", amount: 600_000, methodIndex: 0, fallbackMethod: "VNPay QR", status: "ThanhCong", minutesAgo: 1_440 },
  { id: "GD98206", transactionRef: "Timeout-8221", serviceName: "GóiHiện", serviceTag: "Cơ bản", buyer: "Võ Minh Khang", buyerPhone: "0931 · 772 · 442", amount: 100_000, methodIndex: 1, fallbackMethod: "Ví MoMo", status: "ThatBai", minutesAgo: 2_100 },
  { id: "GD98201", transactionRef: "Đang chờ", serviceName: "GóiĐộcQuyền_DN", serviceTag: "Doanh nghiệp", buyer: "Cửa hàng Nội thất An Phú", buyerPhone: "0981 · 221 · 674", amount: 1_500_000, methodIndex: 2, fallbackMethod: "Chuyển khoản NH", status: "ChoXuLy", minutesAgo: 3_800 },
  { id: "GD98196", transactionRef: "VNP180991", serviceName: "GóiVIP_Pro", serviceTag: "VIP Kim Cương", buyer: "Đỗ Hoàng Nam", buyerPhone: "0914 · 552 · 136", amount: 600_000, methodIndex: 0, fallbackMethod: "VietQR", status: "ThanhCong", minutesAgo: 7_200 },
];

/** Nhãn tiếng Việt tương ứng với trạng thái giả lập hiển thị ở bảng và trang chi tiết. */
export const MOCK_STATUS_LABELS: Record<MockStatus, string> = {
  ThanhCong: "Thành công",
  ChoXuLy: "Chờ xác nhận",
  ThatBai: "Hủy / Hết hạn",
};
