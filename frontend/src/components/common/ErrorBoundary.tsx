import { Component, type ErrorInfo, type ReactNode } from "react";

interface State {
  error: Error | null;
}

/** Bắt lỗi khi render để không bao giờ trắng trang: hiện nguyên nhân và nút tải lại. */
export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="container page">
        <div className="state state-error" role="alert">
          <strong>Trang gặp lỗi khi hiển thị</strong>
          <p>{this.state.error.message}</p>
          <p className="hint">Nếu lỗi nhắc tới dữ liệu API, hãy kiểm tra BE đã chạy và VITE_PROXY_TARGET trong file .env.</p>
          <button type="button" className="btn" onClick={() => window.location.reload()}>
            Tải lại trang
          </button>
        </div>
      </div>
    );
  }
}
