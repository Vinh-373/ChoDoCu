import axios from "axios";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { baiDangApi } from "../../api/baiDang";
import ReviewDecisionPanel, { type ReviewChoice } from "../../components/admin/ReviewDecisionPanel";
import ReviewSellerCard from "../../components/admin/ReviewSellerCard";
import ReviewSpecs from "../../components/admin/ReviewSpecs";
import MaterialIcon from "../../components/common/MaterialIcon";
import { ErrorBox, Spinner } from "../../components/common/State";
import PostGallery from "../../components/post/PostGallery";
import { useToast } from "../../contexts/ToastContext";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import type { BaiDang } from "../../types";
import { getErrorMessage } from "../../utils/error";
import { formatDateTime, formatPrice, TRANG_THAI_BAI_DANG, TRANG_THAI_BAI_DANG_BADGE } from "../../utils/format";

function getReturnPath(state: unknown): string {
  const from = (state as { from?: unknown } | null)?.from;
  return typeof from === "string" &&
    (from === "/quan-tri/duyet-bai" || from.startsWith("/quan-tri/duyet-bai?"))
    ? from
    : "/quan-tri/duyet-bai";
}

export default function AdminPostReview() {
  const { id } = useParams();
  const postId = Number(id);
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const returnPath = getReturnPath(location.state);
  const [post, setPost] = useState<BaiDang | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [choice, setChoice] = useState<ReviewChoice | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  useDocumentTitle(post ? `Kiểm duyệt ${post.maTin || `#${post.id}`}` : "Kiểm duyệt bài đăng");

  useEffect(() => {
    let active = true;
    if (!Number.isInteger(postId) || postId < 1) {
      setError("Không tìm thấy bài đăng.");
      setLoading(false);
      return () => { active = false; };
    }

    setLoading(true);
    setError(null);
    baiDangApi.chiTiet(postId).then((result) => {
      if (active) setPost(result);
    }).catch((failure: unknown) => {
      if (!active) return;
      const status = axios.isAxiosError(failure) ? failure.response?.status : undefined;
      setError(status === 404
        ? "Không tìm thấy bài đăng."
        : status === 403
          ? "Bạn không có quyền xem bài đăng này."
          : getErrorMessage(failure));
    }).finally(() => {
      if (active) setLoading(false);
    });

    return () => { active = false; };
  }, [postId]);

  const submitDecision = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!post || post.trangThai !== "ChoDuyet" || !choice || busy) return;
    if (choice === "reject" && !reason.trim()) {
      toast("Vui lòng nhập lý do từ chối.", "error");
      return;
    }

    setBusy(true);
    try {
      if (choice === "approve") await baiDangApi.duyet(post.id);
      else await baiDangApi.tuChoi(post.id, { lyDo: reason.trim() });
      toast(choice === "approve" ? "Đã phê duyệt bài đăng." : "Đã từ chối bài đăng.", "ok");
      navigate(returnPath, { replace: true });
    } catch (failure) {
      toast(getErrorMessage(failure), "error");
    } finally {
      setBusy(false);
    }
  };

  const backButton = (
    <Link
      to={returnPath}
      className="inline-flex items-center gap-space-xs rounded-lg border border-outline-variant bg-surface-container-lowest px-space-md py-space-sm font-button-text text-button-text text-on-surface hover:bg-surface-container-low"
    >
      <MaterialIcon name="arrow_back" size={18} />
      Quay lại danh sách
    </Link>
  );

  if (loading) return <div className="p-space-xl"><Spinner label="Đang tải bài đăng…" /></div>;
  if (!post) {
    return (
      <main className="mx-auto flex w-full max-w-7xl flex-col items-start gap-space-md p-space-xl">
        <ErrorBox message={error ?? "Không tìm thấy bài đăng."} />
        {backButton}
      </main>
    );
  }

  const badge = TRANG_THAI_BAI_DANG_BADGE[post.trangThai] ?? TRANG_THAI_BAI_DANG_BADGE.DaAn;
  const media = post.danhSachMedia?.length
    ? post.danhSachMedia
    : post.anhs.map((duongDan) => ({ duongDan, laVideo: false }));
  const address = [post.khuVuc, post.diaChiChiTiet].filter((value, index, values) => value && values.indexOf(value) === index);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-space-lg px-margin py-space-lg">
      <nav aria-label="Điều hướng" className="flex flex-wrap items-center gap-space-xs text-caption text-on-surface-variant">
        <Link to="/quan-tri" className="hover:text-primary">Quản trị</Link>
        <span aria-hidden="true">/</span>
        <Link to={returnPath} className="hover:text-primary">Quản lý bài đăng</Link>
        <span aria-hidden="true">/</span>
        <span className="font-caption-bold text-caption-bold text-on-surface">#{post.maTin || post.id}</span>
      </nav>

      <header className="flex flex-wrap items-center justify-between gap-space-md">
        <div className="flex flex-wrap items-center gap-space-md">
          <span className={`inline-flex items-center gap-space-xs rounded-full px-space-sm py-space-xs font-caption-bold text-caption-bold ${badge.badge}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
            {TRANG_THAI_BAI_DANG[post.trangThai] ?? post.trangThai}
          </span>
          <time dateTime={post.ngayDang} className="text-caption text-on-surface-variant">Gửi lúc {formatDateTime(post.ngayDang)}</time>
        </div>
        {backButton}
      </header>

      <div className="grid items-start gap-space-lg lg:grid-cols-[minmax(0,1.6fr)_minmax(20rem,1fr)]">
        <div className="flex min-w-0 flex-col gap-space-lg">
          <PostGallery media={media.length ? media : [{ duongDan: "", laVideo: false }]} title={post.tieuDe} />
          <section className="rounded-xl bg-surface-container-lowest p-space-lg shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
            <h1 className="mb-space-sm mt-0 font-headline-2 text-headline-2 text-on-surface">{post.tieuDe}</h1>
            <p className="m-0 font-price-lg text-price-lg text-error">{formatPrice(post.giaTien)}</p>
            {post.coThuongLuong && <span className="mt-space-xs inline-block rounded-full bg-tertiary-fixed px-space-sm py-space-2xs font-caption-bold text-caption-bold text-on-tertiary-fixed">Có thương lượng</span>}
          </section>
          <ReviewSpecs items={post.thuocTinhs} />
          <section className="rounded-xl bg-surface-container-lowest p-space-lg shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
            <h2 className="mb-space-sm mt-0 font-headline-3 text-headline-3 text-on-surface">Mô tả</h2>
            <p className="m-0 whitespace-pre-line font-body-2 text-body-2 leading-relaxed text-on-surface">{post.noiDung}</p>
          </section>
          <section className="rounded-xl bg-surface-container-lowest p-space-lg shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
            <h2 className="mb-space-sm mt-0 font-headline-3 text-headline-3 text-on-surface">Địa chỉ giao dịch</h2>
            <p className="m-0 font-body-2 text-body-2 text-on-surface">{address.length ? address.join(", ") : "Chưa cung cấp"}</p>
          </section>
        </div>
        <aside className="flex flex-col gap-space-lg">
          <ReviewSellerCard
            image={post.nguoiBan?.anhNguoiDung}
            name={post.nguoiBan?.hoTen || post.tenNguoiDang}
            phone={post.soDienThoaiLienHe}
            region={post.khuVuc}
          />
          <ReviewDecisionPanel
            status={post.trangThai}
            reason={post.lyDoTuChoi}
            choice={choice}
            rejectReason={reason}
            busy={busy}
            onChoiceChange={setChoice}
            onReasonChange={setReason}
            onSubmit={submitDecision}
          />
        </aside>
      </div>
    </main>
  );
}
