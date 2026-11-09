import axios from "axios";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { baiDangApi } from "../../api/baiDang";
import { danhMucApi } from "../../api/danhMuc";
import { MAX_ANH, MAX_MO_TA, MAX_TIEU_DE, MAX_VIDEO } from "../../constants/baiDang";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { useFetch } from "../../hooks/useFetch";
import type { BaiDang, DanhMuc, DanhMucThuocTinh, SuaBaiDangRequest } from "../../types";
import { getErrorMessage } from "../../utils/error";
import { getAutoTitleAttributes } from "../../utils/postTitle";
import type { PostDetailsValues, PostMediaItem } from "./usePostForm";

type EditStep = "category" | "media" | "details";

interface PostEditDraft {
  version: 1;
  details: PostDetailsValues;
  categoryId: number;
  media: Array<{ id: number; name: string; laVideo: boolean; duongDan: string }>;
  coverId: number | null;
}

const EMPTY_DETAILS: PostDetailsValues = {
  tieuDe: "",
  moTa: "",
  gia: "",
  coThuongLuong: false,
  giaChotNhanh: false,
  idThanhPho: "",
  idPhuongXa: "",
  diaChiChiTiet: "",
  soDienThoaiLienHe: "",
  choPhepChat: false,
  thuocTinhs: {},
};

const maxImageSize = 5 * 1024 * 1024;
const maxVideoSize = 50 * 1024 * 1024;

function findCategory(tree: DanhMuc[], id: number | null): DanhMuc | null {
  if (!id) return null;
  for (const category of tree) {
    if (category.id === id) return category;
    const child = category.danhMucCons.find((item) => item.id === id);
    if (child) return child;
  }
  return null;
}

function mediaName(path: string): string {
  return path.split(/[\\/]/).pop() || path;
}

function validDraft(value: unknown): value is PostEditDraft {
  if (!value || typeof value !== "object") return false;
  const draft = value as Partial<PostEditDraft>;
  return draft.version === 1
    && typeof draft.categoryId === "number"
    && !!draft.details
    && typeof draft.details.tieuDe === "string"
    && typeof draft.details.moTa === "string"
    && Array.isArray(draft.media);
}

function validationMessage(file: File, isVideo: boolean): string | undefined {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (isVideo) {
    if (extension !== "mp4" || (file.type && file.type !== "video/mp4")) return "Video phải có định dạng MP4.";
    if (file.size > maxVideoSize) return "Video không được vượt quá 50 MB.";
    return undefined;
  }
  if (!["jpg", "jpeg", "png", "webp"].includes(extension ?? "")
    || (file.type && !["image/jpeg", "image/png", "image/webp"].includes(file.type))) {
    return "Ảnh phải có định dạng JPG, PNG hoặc WebP.";
  }
  if (file.size > maxImageSize) return "Ảnh không được vượt quá 5 MB.";
  return undefined;
}

function fieldErrorsFrom(error: unknown, attributes: DanhMucThuocTinh[]): Record<string, string> {
  if (!axios.isAxiosError(error) || error.response?.status !== 400) return {};
  const errors = (error.response.data as { errors?: Record<string, string | string[]> } | undefined)?.errors;
  if (!errors) return {};
  const mapped: Record<string, string> = {};
  for (const [key, value] of Object.entries(errors)) {
    const text = Array.isArray(value) ? value.join(" ") : value;
    const normalized = key.toLowerCase();
    const index = normalized.includes("thuoctinh") ? Number(key.match(/\d+/)?.[0]) : -1;
    const attributeId = Number.isInteger(index) && index >= 0 ? attributes[index]?.id : undefined;
    const field = normalized.includes("tieuDe".toLowerCase()) ? "tieuDe"
      : normalized.includes("mota") ? "moTa"
        : normalized.includes("gia") ? "gia"
          : normalized.includes("idthanhpho") ? "idThanhPho"
            : normalized.includes("idphuongxa") ? "idPhuongXa"
              : normalized.includes("diachichitiet") ? "diaChiChiTiet"
                : normalized.includes("sodienthoai") ? "soDienThoaiLienHe"
                  : attributeId ? `thuocTinhs.${attributeId}` : "";
    if (field) mapped[field] = text;
  }
  return mapped;
}

export default function usePostEditForm(id: number) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const categories = useFetch(() => danhMucApi.layCay(), []);
  const [post, setPost] = useState<BaiDang | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [step, setStep] = useState<EditStep>("media");
  const [details, setDetails] = useState<PostDetailsValues>(EMPTY_DETAILS);
  const [media, setMedia] = useState<PostMediaItem[]>([]);
  const [coverId, setCoverId] = useState<number | null>(null);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [categoryError, setCategoryError] = useState("");
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const restoredId = useRef<number | null>(null);
  const storageErrorShown = useRef(false);
  const nextMediaId = useRef(1);
  const draftKey = `bai-dang-edit-${id}`;

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError("");
    setPost(null);
    if (!Number.isInteger(id) || id < 1) {
      setLoadError("Không tìm thấy tin đăng.");
      setLoading(false);
      return () => { active = false; };
    }

    baiDangApi.chiTiet(id).then((result) => {
      if (!active) return;
      if (result.idNguoiDung !== user?.idNguoiDung) {
        toast("Bạn không có quyền chỉnh sửa tin đăng này.", "error");
        navigate("/tai-khoan/quan-ly-tin", { replace: true });
        return;
      }
      setPost(result);
      const currentCategoryId = result.idDanhMuc ?? null;
      setCategoryId(currentCategoryId);
      const postMedia = result.danhSachMedia?.length
        ? result.danhSachMedia
        : (result.anhs ?? []).map((duongDan) => ({ duongDan, laVideo: false }));
      const loadedMedia = postMedia.map((item, index) => ({
        id: index + 1,
        name: mediaName(item.duongDan),
        laVideo: item.laVideo,
        duongDan: item.duongDan,
        progress: 100,
      }));
      nextMediaId.current = loadedMedia.length + 1;
      setMedia(loadedMedia);
      const coverPath = result.anhBia ?? result.danhSachMedia?.find((item) => !item.laVideo)?.duongDan ?? result.anhs?.[0];
      setCoverId(loadedMedia.find((item) => item.duongDan === coverPath && !item.laVideo)?.id ?? null);
      setDetails({
        ...EMPTY_DETAILS,
        tieuDe: result.tieuDe ?? "",
        moTa: result.noiDung ?? "",
        gia: String(result.giaTien ?? ""),
        coThuongLuong: result.coThuongLuong ?? false,
        giaChotNhanh: result.giaChotNhanh ?? false,
        idThanhPho: result.idThanhPho ? String(result.idThanhPho) : "",
        idPhuongXa: result.idPhuongXa ? String(result.idPhuongXa) : "",
        diaChiChiTiet: result.diaChiChiTiet ?? "",
        soDienThoaiLienHe: result.soDienThoaiLienHe ?? "",
        choPhepChat: result.choPhepChat ?? false,
        thuocTinhs: Object.fromEntries((result.thuocTinhsDeSua ?? []).map((item) => [item.idThuocTinh, item.giaTri])),
      });
      setLoading(false);
    }).catch((error: unknown) => {
      if (!active) return;
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      if (status === 403 || status === 404) {
        toast("Bạn không có quyền chỉnh sửa hoặc tin đăng không còn tồn tại.", "error");
        navigate("/tai-khoan/quan-ly-tin", { replace: true });
        return;
      }
      setLoadError(getErrorMessage(error, "Không tải được tin đăng."));
      setLoading(false);
    });
    return () => { active = false; };
  }, [id, navigate, toast, user?.idNguoiDung]);

  const selectedCategory = findCategory(categories.data ?? [], categoryId);
  const selectedParent = selectedCategory?.idDanhMucCha
    ? findCategory(categories.data ?? [], selectedCategory.idDanhMucCha)
    : selectedCategory;
  const parentId = selectedParent?.id ?? null;
  const childId = selectedCategory?.idDanhMucCha ? selectedCategory.id : null;
  const attributes = useFetch(
    () => categoryId ? danhMucApi.layThuocTinh(categoryId) : Promise.resolve([] as DanhMucThuocTinh[]),
    [categoryId],
  );
  const attributeList = attributes.data ?? [];
  const categoryLabel = [selectedParent?.tenDanhMuc, selectedCategory?.id !== selectedParent?.id ? selectedCategory?.tenDanhMuc : ""]
    .filter(Boolean).join(" > ");
  const uploadBusy = media.some((item) => !item.duongDan && !item.error);

  useEffect(() => {
    if (!post || post.id !== id || post.trangThai === "DaBan" || restoredId.current === id) return;
    restoredId.current = id;
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return;
      const parsed: unknown = JSON.parse(raw);
      if (!validDraft(parsed)) throw new Error("Bản nháp không hợp lệ.");
      if (window.confirm("Tìm thấy bản nháp chỉnh sửa tin. Bạn có muốn khôi phục không?")) {
        setDetails(parsed.details);
        setCategoryId(parsed.categoryId);
        const restoredMedia = parsed.media.map((item) => ({
          ...item,
          progress: 100,
        }));
        setMedia(restoredMedia);
        setCoverId(parsed.coverId);
        nextMediaId.current = Math.max(0, ...restoredMedia.map((item) => item.id)) + 1;
        setDirty(true);
      } else {
        localStorage.removeItem(draftKey);
      }
    } catch {
      toast("Không thể đọc bản nháp trên thiết bị.", "error");
      try {
        localStorage.removeItem(draftKey);
      } catch {
        toast("Không thể xóa bản nháp bị lỗi trên thiết bị.", "error");
      }
    }
  }, [draftKey, id, post, toast]);

  useEffect(() => {
    if (!dirty || !post || post.trangThai === "DaBan") return;
    const timer = window.setInterval(() => {
      const draft: PostEditDraft = {
        version: 1,
        details,
        categoryId: categoryId ?? post.idDanhMuc ?? 0,
        media: media.filter((item) => item.duongDan).map((item) => ({
          id: item.id,
          name: item.file?.name ?? item.name ?? mediaName(item.duongDan ?? ""),
          laVideo: item.laVideo,
          duongDan: item.duongDan!,
        })),
        coverId,
      };
      try {
        localStorage.setItem(draftKey, JSON.stringify(draft));
        setLastSavedAt(new Date());
      } catch {
        if (!storageErrorShown.current) {
          storageErrorShown.current = true;
          toast("Không thể lưu nháp trên thiết bị.", "error");
        }
      }
    }, 5000);
    return () => window.clearInterval(timer);
  }, [categoryId, coverId, details, dirty, draftKey, media, post, toast]);

  const changeDetails = useCallback((patch: Partial<PostDetailsValues>) => {
    setDetails((current) => ({ ...current, ...patch }));
    setFieldErrors({});
    setDirty(true);
  }, []);

  const chooseParent = useCallback((nextId: number) => {
    setCategoryId(nextId);
    if (categoryId !== nextId) changeDetails({ thuocTinhs: {} });
    setCategoryError("");
    setDirty(true);
  }, [categoryId, changeDetails]);

  const chooseChild = useCallback((nextId: number) => {
    setCategoryId(nextId);
    if (categoryId !== nextId) changeDetails({ thuocTinhs: {} });
    setCategoryError("");
    setDirty(true);
  }, [categoryId, changeDetails]);

  const continueCategory = useCallback(() => {
    if (!selectedParent) return setCategoryError("Hãy chọn danh mục đăng tin.");
    if (selectedParent.danhMucCons.length > 0 && !childId) return setCategoryError("Hãy chọn danh mục con.");
    setCategoryError("");
    setStep("media");
  }, [childId, selectedParent]);

  const uploadOne = useCallback(async (item: PostMediaItem) => {
    if (!item.file) return;
    setMedia((current) => current.map((entry) => entry.id === item.id ? { ...entry, error: undefined, progress: 0 } : entry));
    try {
      const result = await baiDangApi.taiTep(item.file, (progress) => {
        setMedia((current) => current.map((entry) => entry.id === item.id ? { ...entry, progress } : entry));
      });
      setMedia((current) => current.map((entry) => entry.id === item.id
        ? { ...entry, duongDan: result.duongDan, progress: 100 }
        : entry));
    } catch (error) {
      setMedia((current) => current.map((entry) => entry.id === item.id
        ? { ...entry, error: getErrorMessage(error), progress: 0 }
        : entry));
    }
  }, []);

  const addFiles = useCallback((files: FileList | File[]) => {
    let imageCount = media.filter((item) => !item.laVideo).length;
    let videoCount = media.filter((item) => item.laVideo).length;
    const added = Array.from(files).map((file) => {
      const isVideo = file.type.startsWith("video/") || file.name.toLowerCase().endsWith(".mp4");
      let error = validationMessage(file, isVideo);
      if (!error && isVideo && videoCount >= MAX_VIDEO) error = `Mỗi tin chỉ được tải tối đa ${MAX_VIDEO} video.`;
      if (!error && !isVideo && imageCount >= MAX_ANH) error = `Mỗi tin chỉ được tải tối đa ${MAX_ANH} ảnh.`;
      if (!error && isVideo) videoCount += 1;
      if (!error && !isVideo) imageCount += 1;
      return { id: nextMediaId.current++, file, name: file.name, laVideo: isVideo, progress: 0, error };
    });
    if (!added.length) return;
    setMedia((current) => [...current, ...added]);
    setDirty(true);
    for (const item of added) {
      if (!item.error) void uploadOne(item);
    }
  }, [media, uploadOne]);

  const removeMedia = useCallback((removeId: number) => {
    setMedia((current) => current.filter((item) => item.id !== removeId));
    setCoverId((current) => current === removeId ? null : current);
    setDirty(true);
  }, []);

  const moveMedia = useCallback((moveId: number, direction: -1 | 1) => {
    setMedia((current) => {
      const from = current.findIndex((item) => item.id === moveId);
      const to = from + direction;
      if (from < 0 || to < 0 || to >= current.length) return current;
      const next = [...current];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
    setDirty(true);
  }, []);

  const setCover = useCallback((nextId: number) => {
    setCoverId(nextId);
    setDirty(true);
  }, []);

  const continueMedia = useCallback(() => {
    setFormError("");
    if (media.some((item) => !item.duongDan)) return setFormError("Hãy tải xong hoặc xóa các tệp bị lỗi trước khi tiếp tục.");
    if (!media.some((item) => !item.laVideo && item.duongDan)) return setFormError("Tin đăng cần có ít nhất 1 ảnh.");
    if (!details.moTa.trim()) return setFormError("Hãy nhập mô tả tin đăng.");
    if (details.moTa.length > MAX_MO_TA) return setFormError(`Mô tả không được vượt quá ${MAX_MO_TA} ký tự.`);
    setStep("details");
  }, [details.moTa, media]);

  const submit = useCallback(async () => {
    setFormError("");
    setFieldErrors({});
    if (!categoryId) return setFormError("Hãy chọn danh mục đăng tin.");
    if (!getAutoTitleAttributes(attributeList) && !details.tieuDe.trim()) {
      setFieldErrors({ tieuDe: "Vui lòng nhập tiêu đề tin đăng." });
      document.getElementById("post-title")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (details.tieuDe.length > MAX_TIEU_DE) return setFieldErrors({ tieuDe: `Tiêu đề không được vượt quá ${MAX_TIEU_DE} ký tự.` });
    const missingAttributes = attributeList
      .filter((item) => item.batBuoc && !details.thuocTinhs[item.id]?.trim());
    if (missingAttributes.length > 0) {
      setFieldErrors(Object.fromEntries(missingAttributes.map((item) => [
        `thuocTinhs.${item.id}`,
        `Hãy nhập ${item.tenThuocTinh}.`,
      ])));
      setFormError(`Hãy nhập: ${missingAttributes.map((item) => item.tenThuocTinh).join(", ")}.`);
      document.getElementById(`attribute-${missingAttributes[0].id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (details.gia === "" || !Number.isFinite(Number(details.gia)) || Number(details.gia) < 0) {
      setFieldErrors({ gia: "Giá phải lớn hơn 0 hoặc nhập 0 để miễn phí." });
      document.getElementById("post-price")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (!details.idThanhPho) return setFieldErrors({ idThanhPho: "Hãy chọn tỉnh / thành phố." });
    if (media.some((item) => !item.duongDan)) return setFormError("Hãy tải xong hoặc xóa các tệp bị lỗi trước khi lưu.");
    if (!media.some((item) => !item.laVideo && item.duongDan)) return setFormError("Tin đăng cần có ít nhất 1 ảnh.");

    const selectedCover = media.find((item) => item.id === coverId && !item.laVideo && item.duongDan)
      ?? media.find((item) => !item.laVideo && item.duongDan);
    const payload: SuaBaiDangRequest = {
      idDanhMuc: categoryId,
      tieuDe: details.tieuDe.trim() || null,
      moTa: details.moTa.trim(),
      gia: Number(details.gia),
      coThuongLuong: details.coThuongLuong,
      giaChotNhanh: details.giaChotNhanh,
      idThanhPho: Number(details.idThanhPho),
      idPhuongXa: details.idPhuongXa ? Number(details.idPhuongXa) : null,
      diaChiChiTiet: details.diaChiChiTiet.trim() || null,
      soDienThoaiLienHe: details.soDienThoaiLienHe.trim() || null,
      choPhepChat: details.choPhepChat,
      thuocTinhs: Object.entries(details.thuocTinhs)
        .filter(([, value]) => value.trim())
        .map(([idThuocTinh, giaTri]) => ({ idThuocTinh: Number(idThuocTinh), giaTri })),
      danhSachHinhAnh: media.filter((item) => item.duongDan).map((item) => ({
        duongDan: item.duongDan!,
        laVideo: item.laVideo,
        laAnhBia: item.id === selectedCover?.id,
      })),
    };

    setBusy(true);
    try {
      await baiDangApi.sua(id, payload);
      try {
        localStorage.removeItem(draftKey);
      } catch {
        toast("Đã lưu thay đổi nhưng không thể xóa bản nháp trên thiết bị.", "info");
      }
      setDirty(false);
      toast("Đã lưu thay đổi tin đăng.", "ok");
      navigate(`/bai-dang/${id}`);
    } catch (error) {
      setFormError(getErrorMessage(error, "Chưa lưu được thay đổi."));
      const mapped = fieldErrorsFrom(error, attributeList);
      if (Object.keys(mapped).length) {
        setFieldErrors(mapped);
        if (mapped.moTa) setStep("media");
      }
    } finally {
      setBusy(false);
    }
  }, [attributeList, categoryId, coverId, details, draftKey, id, media, navigate, toast]);

  const cancel = useCallback(() => {
    if (dirty && !window.confirm("Bạn có thay đổi chưa lưu. Bạn có chắc muốn hủy bỏ?")) return;
    navigate(`/bai-dang/${id}`);
  }, [dirty, id, navigate]);

  const latestSavedLabel = useMemo(() => lastSavedAt
    ? `Đã lưu tự động lúc ${lastSavedAt.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`
    : "", [lastSavedAt]);

  return {
    post, loading, loadError, categories, step, setStep, parentId, childId, categoryError,
    chooseParent, chooseChild, continueCategory, selectedParent, selectedCategory, categoryLabel,
    attributes, attributeList, details, changeDetails, media, coverId, uploadBusy, uploadOne,
    addFiles, removeMedia, moveMedia, setCover, continueMedia, formError, fieldErrors,
    busy, submit, cancel, dirty, latestSavedLabel,
  };
}
