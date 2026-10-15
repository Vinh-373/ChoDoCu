import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { tinNhanApi } from "../../api/tinNhan";
import Icon from "../../components/common/Icon";
import { Empty, ErrorBox, Spinner } from "../../components/common/State";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useFetch } from "../../hooks/useFetch";
import { getErrorMessage } from "../../utils/error";
import { formatDateTime } from "../../utils/format";
import type { TinNhan } from "../../types";

const PAGE_SIZE = 30;
const POLL_MS = 5000;

function Thread({ idHoiThoai, idNguoiKia, tenNguoiKia }: { idHoiThoai: number; idNguoiKia: number; tenNguoiKia: string }) {
  const { user } = useAuth();
  const toast = useToast();
  const [latest, setLatest] = useState<TinNhan[]>([]); // trang 1 (mới nhất), cập nhật theo polling
  const [older, setOlder] = useState<TinNhan[]>([]); // các trang cũ hơn đã tải thêm
  const [nextPage, setNextPage] = useState(2);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastIdRef = useRef(0);

  const loadLatest = useCallback(async () => {
    try {
      const res = await tinNhanApi.tinNhan(idHoiThoai, 1, PAGE_SIZE);
      setLatest(res.items);
      setTotalPages(res.totalPages);
      setError(null);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [idHoiThoai]);

  useEffect(() => {
    setLatest([]);
    setOlder([]);
    setNextPage(2);
    setLoading(true);
    lastIdRef.current = 0;
    void loadLatest();
    const t = window.setInterval(() => void loadLatest(), POLL_MS);
    return () => window.clearInterval(t);
  }, [idHoiThoai, loadLatest]);

  // Chỉ cuộn xuống đáy khi có tin mới nhất thay đổi (không cuộn khi tải tin cũ).
  useEffect(() => {
    const last = latest[latest.length - 1]?.id ?? 0;
    if (last !== lastIdRef.current) {
      lastIdRef.current = last;
      bottomRef.current?.scrollIntoView({ block: "end" });
    }
  }, [latest]);

  const loadOlder = async () => {
    try {
      const res = await tinNhanApi.tinNhan(idHoiThoai, nextPage, PAGE_SIZE);
      setOlder((cur) => [...res.items, ...cur]);
      setNextPage((p) => p + 1);
      setTotalPages(res.totalPages);
    } catch (e) {
      toast(getErrorMessage(e), "error");
    }
  };

  const send = async (e: FormEvent) => {
    e.preventDefault();
    const content = text.trim();
    if (!content) return;
    setSending(true);
    try {
      await tinNhanApi.gui(idNguoiKia, content);
      setText("");
      await loadLatest();
    } catch (err) {
      toast(getErrorMessage(err), "error");
    } finally {
      setSending(false);
    }
  };

  // Gộp và khử trùng theo id phòng khi tin mới đẩy tin cũ sang trang 2.
  const merged = Array.from(new Map([...older, ...latest].map((m) => [m.id, m])).values()).sort((a, b) => a.id - b.id);

  return (
    <div className="chat-thread">
      <div className="chat-head">
        <Link to="/tin-nhan" className="icon-btn hide-md" aria-label="Quay lại danh sách">
          <Icon name="left" size={18} />
        </Link>
        <strong>{tenNguoiKia}</strong>
      </div>
      <div className="chat-body">
        {loading ? (
          <Spinner />
        ) : error && merged.length === 0 ? (
          <ErrorBox message={error} onRetry={() => void loadLatest()} />
        ) : (
          <>
            {nextPage <= totalPages && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => void loadOlder()}>
                Xem tin cũ hơn
              </button>
            )}
            {merged.map((m) => (
              <div key={m.id} className={`bubble ${m.idNguoiGui === user?.idNguoiDung ? "mine" : ""}`}>
                <p>{m.noiDung}</p>
                <span className="hint">{formatDateTime(m.ngayTao)}</span>
              </div>
            ))}
            <div ref={bottomRef} />
          </>
        )}
      </div>
      <form className="chat-form" onSubmit={send}>
        <input type="text" value={text} maxLength={2000} onChange={(e) => setText(e.target.value)} placeholder="Nhập tin nhắn…" aria-label="Tin nhắn" />
        <button className="btn" disabled={sending || !text.trim()}>
          <Icon name="send" size={16} /> Gửi
        </button>
      </form>
    </div>
  );
}

export default function ChatPage() {
  useDocumentTitle("Tin nhắn");
  const { idHoiThoai } = useParams();
  const activeId = idHoiThoai ? Number(idHoiThoai) : undefined;
  const { data, loading, error, reload } = useFetch(() => tinNhanApi.hoiThoai(), [activeId]);
  const list = data ?? [];
  const active = list.find((h) => h.id === activeId);

  return (
    <>
      <div className="page-head">
        <h1>Tin nhắn</h1>
      </div>
      <div className={`chat ${activeId ? "has-thread" : ""}`}>
        <div className="chat-list">
          {loading && !data ? (
            <Spinner />
          ) : error ? (
            <ErrorBox message={error} onRetry={reload} />
          ) : list.length === 0 ? (
            <Empty title="Chưa có cuộc trò chuyện">Mở một tin đăng và bấm “Nhắn cho người bán” để bắt đầu.</Empty>
          ) : (
            list.map((h) => (
              <Link key={h.id} to={`/tin-nhan/${h.id}`} className={`list-item ${h.id === activeId ? "is-active" : ""}`}>
                <div>
                  <strong>{h.tenNguoiDungKia}</strong>
                  <p className="muted">{h.tinNhanCuoi ?? "Chưa có tin nhắn"}</p>
                </div>
              </Link>
            ))
          )}
        </div>
        {activeId && active ? (
          <Thread key={active.id} idHoiThoai={active.id} idNguoiKia={active.idNguoiDungKia} tenNguoiKia={active.tenNguoiDungKia} />
        ) : activeId && !loading ? (
          <div className="chat-empty">Không tìm thấy cuộc trò chuyện này.</div>
        ) : (
          <div className="chat-empty">Chọn một cuộc trò chuyện để xem tin nhắn.</div>
        )}
      </div>
    </>
  );
}
