import axios from "axios";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { baiDangApi } from "../../api/baiDang";
import { tinNhanApi } from "../../api/tinNhan";
import ConfirmDialog from "../../components/account/ConfirmDialog";
import MaterialIcon from "../../components/common/MaterialIcon";
import { ErrorBox } from "../../components/common/State";
import PostDetailBreadcrumbs from "../../components/post/PostDetailBreadcrumbs";
import PostGallery from "../../components/post/PostGallery";
import PostOwnerActions from "../../components/post/PostOwnerActions";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import usePostActions, { type PostAction } from "../../hooks/usePostActions";
import type { BaiDang } from "../../types";
import { getErrorMessage } from "../../utils/error";
import { formatDate, formatPrice, TRANG_THAI_BAI_DANG, TRANG_THAI_BAI_DANG_BADGE } from "../../utils/format";
import { imgSrc, onImgError } from "../../utils/image";

const CONFIRMATIONS: Partial<Record<PostAction, { title: string; message: string; confirmLabel: string }>> = {
  an: { title: "Tạm ẩn tin?", message: "Tin sẽ tạm thời không hiển thị với người mua.", confirmLabel: "Tạm ẩn" },
  hien: { title: "Hiện lại tin?", message: "Tin sẽ được hiển thị trở lại với người mua.", confirmLabel: "Hiện tin" },
  daBan: { title: "Đánh dấu đã bán?", message: "Tin sẽ chuyển sang trạng thái đã bán.", confirmLabel: "Đánh dấu đã bán" },
  dayTin: { title: "Đẩy tin lên đầu?", message: "Lượt đẩy tin sẽ được sử dụng để làm mới tin đăng.", confirmLabel: "Đẩy tin" },
  giaHan: { title: "Gia hạn tin đăng?", message: "Tin đăng sẽ được gia hạn thêm 30 ngày.", confirmLabel: "Gia hạn" },
};

function PostDetailSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-space-lg px-margin py-space-lg" role="status" aria-label="Đang tải tin đăng">
      <div className="h-5 w-56 animate-pulse rounded bg-surface-container-high" />
      <div className="grid gap-space-lg lg:grid-cols-[minmax(0,1.6fr)_minmax(20rem,1fr)]">
        <div className="aspect-[4/3] animate-pulse rounded-xl bg-surface-container-high" />
        <div className="flex flex-col gap-space-md">
          <div className="h-48 animate-pulse rounded-xl bg-surface-container-high" />
          <div className="h-40 animate-pulse rounded-xl bg-surface-container-high" />
        </div>
      </div>
      <span className="sr-only">Đang tải…</span>
    </div>
  );
}

export default function PostDetailPage() {
  const { id } = useParams();
  const postId = Number(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [post, setPost] = useState<BaiDang | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [confirmingAction, setConfirmingAction] = useState<PostAction | null>(null);
  const [showChatForm, setShowChatForm] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let active = true;
    if (!Number.isInteger(postId) || postId < 1) {
      setPost(null);
      setError("Không tìm thấy tin đăng");
      setLoading(false);
      return () => { active = false; };
    }

    setLoading(true);
    setError(null);
    baiDangApi.chiTiet(postId).then((result) => {
      if (active) setPost(result);
    }).catch((reason: unknown) => {
      if (!active) return;
      const status = axios.isAxiosError(reason) ? reason.response?.status : undefined;
      setError(status === 403 || status === 404 ? "Không tìm thấy tin đăng" : getErrorMessage(reason));
      setPost(null);
    }).finally(() => {
      if (active) setLoading(false);
    });

    return () => { active = false; };
  }, [postId, reloadKey]);

  useDocumentTitle(post?.tieuDe);

  const reload = useCallback(() => setReloadKey((current) => current + 1), []);
  const { busyIds, perform } = usePostActions({ onSuccess: reload });

  if (loading) return <PostDetailSkeleton />;
  if (!post) {
    return (
      <main className="mx-auto w-full max-w-7xl px-margin py-space-xl">
        <ErrorBox message={error ?? "Không tìm thấy tin đăng"} />
      </main>
    );
  }

  const isOwner = user?.idNguoiDung === post.idNguoiDung;
  const statusBadge = TRANG_THAI_BAI_DANG_BADGE[post.trangThai] ?? TRANG_THAI_BAI_DANG_BADGE.DaAn;
  const media = post.danhSachMedia?.length
    ? post.danhSachMedia
    : post.anhs.map((duongDan) => ({ duongDan, laVideo: false }));
  const galleryMedia = media.length ? media : [{ duongDan: "", laVideo: false }];
  const sellerName = post.nguoiBan?.hoTen || post.tenNguoiDang;
  const sellerAddress = post.diaChiChiTiet || post.diaChi || post.khuVuc || post.tenThanhPho;
  const actionBusy = busyIds.has(post.id);
  const confirmation = confirmingAction ? CONFIRMATIONS[confirmingAction] : undefined;

  const handleAction = (action: PostAction) => setConfirmingAction(action);
  const confirmAction = async () => {
    if (!confirmingAction) return;
    const succeeded = await perform(confirmingAction, post.id);
    if (succeeded !== undefined) setConfirmingAction(null);
  };

  const openChat = () => {
    if (!user) {
      toast("Đăng nhập để trò chuyện với người bán.", "info");
      navigate("/dang-nhap", { state: { from: `/bai-dang/${post.id}` } });
      return;
    }
    setShowChatForm((visible) => !visible);
  };

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    try {
      const sent = await tinNhanApi.gui(post.idNguoiDung, message.trim());
      toast("Đã gửi tin nhắn cho người bán.", "ok");
      navigate(`/tin-nhan/${sent.idHoiThoai}`);
    } catch (reason) {
      toast(getErrorMessage(reason), "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-space-lg px-margin py-space-lg">
      <PostDetailBreadcrumbs isOwner={isOwner} maTin={post.maTin || `TIN-${post.id}`} />

      {post.trangThai === "BiTuChoi" ? (
        <div className="flex items-start gap-space-sm rounded-xl border border-error/30 bg-error-container px-space-md py-space-sm text-on-error-container" role="alert">
          <MaterialIcon name="report" size={20} className="mt-0.5 shrink-0" />
          <div>
            <strong className="block font-button-text text-button-text">Tin đăng bị từ chối</strong>
            <span className="font-body-2 text-body-2">{post.lyDoTuChoi || "Tin đăng chưa được duyệt."}</span>
          </div>
        </div>
      ) : null}

      <div className="grid items-start gap-space-lg lg:grid-cols-[minmax(0,1.6fr)_minmax(20rem,1fr)]">
        <div className="flex min-w-0 flex-col gap-space-lg">
          <PostGallery media={galleryMedia} title={post.tieuDe} />

          <section className="rounded-xl bg-surface-container-lowest p-space-lg shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
            <h2 className="mb-space-sm mt-0 font-headline-3 text-headline-3 text-on-surface">Mô tả chi tiết</h2>
            <p className="m-0 whitespace-pre-line font-body-2 text-body-2 leading-relaxed text-on-surface">{post.noiDung}</p>
          </section>

          {isOwner && (
            <section className="rounded-xl bg-surface-container-lowest p-space-lg shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
              <h2 className="mb-space-md mt-0 font-headline-3 text-headline-3 text-on-surface">Hiệu quả tương tác</h2>
              <div className="grid grid-cols-3 gap-space-sm">
                {[
                  { label: "Lượt xem", value: post.luotXem ?? 0, icon: "visibility" },
                  { label: "Lượt lưu", value: post.luotLuu ?? 0, icon: "favorite" },
                  { label: "Cuộc chat", value: post.soCuocChat ?? 0, icon: "chat" },
                ].map((stat) => (
                  <div key={stat.label} className="flex flex-col items-center gap-space-xs rounded-lg bg-surface-container-low p-space-sm text-center">
                    <MaterialIcon name={stat.icon} size={22} className="text-primary" />
                    <strong className="font-headline-3 text-headline-3 text-on-surface">{stat.value}</strong>
                    <span className="font-caption text-caption text-on-surface-variant">{stat.label}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="flex min-w-0 flex-col gap-space-md">
          <section className="flex flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-lg shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
            <div className="flex flex-wrap items-center gap-space-xs">
              <span className={`inline-flex items-center gap-space-xs rounded-full px-space-sm py-space-2xs font-caption-bold text-caption-bold ${statusBadge.badge}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${statusBadge.dot}`} />
                {TRANG_THAI_BAI_DANG[post.trangThai] ?? post.trangThai}
              </span>
              <span className="font-caption-bold text-caption-bold text-on-surface-variant">#{post.maTin || `TIN-${post.id}`}</span>
            </div>
            <div className="flex flex-wrap gap-x-space-md gap-y-space-xs font-caption text-caption text-on-surface-variant">
              <span className="inline-flex items-center gap-space-2xs"><MaterialIcon name="calendar_today" size={15} /> {formatDate(post.ngayDang)}</span>
              <span className="inline-flex items-center gap-space-2xs"><MaterialIcon name="location_on" size={15} /> {post.khuVuc || post.tenThanhPho}</span>
            </div>
            <h1 className="m-0 font-headline-2 text-headline-2 text-on-surface">{post.tieuDe}</h1>
            <div>
              <p className="m-0 font-price-lg text-price-lg text-error">{formatPrice(post.giaTien)}</p>
              {post.coThuongLuong && <span className="mt-space-xs inline-block rounded-full bg-tertiary-fixed px-space-sm py-space-2xs font-caption-bold text-caption-bold text-on-tertiary-fixed">Có thương lượng</span>}
            </div>
          </section>

          {isOwner && (
            <PostOwnerActions
              id={post.id}
              status={post.trangThai}
              expired={post.daHetHan ?? false}
              busy={actionBusy}
              onAction={handleAction}
            />
          )}

          <section className="rounded-xl bg-surface-container-lowest p-space-lg shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
            <h2 className="mb-space-sm mt-0 font-headline-3 text-headline-3 text-on-surface">Thông tin kỹ thuật</h2>
            <dl className="m-0 divide-y divide-outline-variant">
              <div className="flex justify-between gap-space-md py-space-sm">
                <dt className="font-caption text-caption text-on-surface-variant">Danh mục</dt>
                <dd className="m-0 text-right font-caption-bold text-caption-bold text-on-surface">{post.tenDanhMucDayDu || post.tenDanhMuc}</dd>
              </div>
              <div className="flex justify-between gap-space-md py-space-sm">
                <dt className="font-caption text-caption text-on-surface-variant">Sản phẩm</dt>
                <dd className="m-0 text-right font-caption-bold text-caption-bold text-on-surface">{post.tenSanPham}</dd>
              </div>
              {(post.thuocTinhs ?? []).map((attribute) => (
                <div key={attribute.tenThuocTinh} className="flex justify-between gap-space-md py-space-sm">
                  <dt className="font-caption text-caption text-on-surface-variant">{attribute.tenThuocTinh}</dt>
                  <dd className="m-0 text-right font-caption-bold text-caption-bold text-on-surface">{attribute.tenGiaTri}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="flex flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-lg shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
            <h2 className="m-0 font-headline-3 text-headline-3 text-on-surface">Thông tin người bán</h2>
            <div className="flex items-center gap-space-sm">
              <img src={imgSrc(post.nguoiBan?.anhNguoiDung)} alt="" onError={onImgError} className="h-12 w-12 rounded-full object-cover" />
              <div className="min-w-0">
                <strong className="block truncate font-button-text text-button-text text-on-surface">{sellerName}</strong>
                {isOwner && <span className="font-caption text-caption text-on-surface-variant">Đây là tin đăng của bạn</span>}
              </div>
            </div>
            {post.soDienThoaiLienHe && (
              <a href={`tel:${post.soDienThoaiLienHe}`} className="inline-flex items-center gap-space-xs font-body-2 text-body-2 text-primary no-underline hover:underline">
                <MaterialIcon name="call" size={18} /> {post.soDienThoaiLienHe}
              </a>
            )}
            <p className="m-0 flex items-start gap-space-xs font-body-2 text-body-2 text-on-surface-variant">
              <MaterialIcon name="location_on" size={18} className="shrink-0" /> {sellerAddress}
            </p>
            {!isOwner && post.choPhepChat && (
              <button type="button" onClick={openChat} className="inline-flex min-h-11 items-center justify-center gap-space-xs rounded-lg bg-primary px-space-md font-button-text text-button-text text-on-primary">
                <MaterialIcon name="chat" size={18} /> Chat với người bán
              </button>
            )}
            {showChatForm && !isOwner && post.choPhepChat && (
              <form className="flex flex-col gap-space-sm" onSubmit={(event) => void sendMessage(event)}>
                <label htmlFor="seller-message" className="font-caption-bold text-caption-bold text-on-surface">Tin nhắn cho {sellerName}</label>
                <textarea id="seller-message" required maxLength={2000} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Nhập tin nhắn của bạn…" className="min-h-24 rounded-lg border border-outline-variant bg-surface-container-lowest p-space-sm font-body-2 text-body-2 text-on-surface" />
                <button type="submit" disabled={sending} className="inline-flex min-h-10 items-center justify-center gap-space-xs rounded-lg bg-secondary px-space-md font-button-text text-button-text text-on-secondary disabled:opacity-60">
                  <MaterialIcon name="send" size={17} /> {sending ? "Đang gửi…" : "Gửi tin nhắn"}
                </button>
              </form>
            )}
          </section>
        </aside>
      </div>

      <div className="flex flex-wrap gap-space-sm">
        <Link to="/tim-kiem" className="inline-flex min-h-10 items-center gap-space-xs rounded-lg bg-surface-container-high px-space-md font-button-text text-button-text text-on-surface no-underline">
          <MaterialIcon name="arrow_back" size={18} /> Quay lại danh sách
        </Link>
      </div>

      {confirmingAction && confirmation && (
        <ConfirmDialog
          {...confirmation}
          busy={actionBusy}
          onCancel={() => setConfirmingAction(null)}
          onConfirm={() => void confirmAction()}
        />
      )}
    </main>
  );
}
