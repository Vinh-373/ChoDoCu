import { useEffect } from "react";

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · Chợ Đồ Cũ` : "Chợ Đồ Cũ";
  }, [title]);
}
