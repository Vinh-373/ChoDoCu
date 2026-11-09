import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { baiDangApi } from "../../api/baiDang";
import { danhMucApi } from "../../api/danhMuc";
import { nguoiDungApi } from "../../api/nguoiDung";
import { MAX_ANH, MAX_MO_TA, MAX_VIDEO } from "../../constants/baiDang";
import { useToast } from "../../contexts/ToastContext";
import { useFetch } from "../../hooks/useFetch";
import type { DanhMuc, DanhMucThuocTinh, TaoBaiDangRequest } from "../../types";
import { getErrorMessage } from "../../utils/error";
import { getAutoTitleAttributes } from "../../utils/postTitle";

export interface PostDetailsValues {
  tieuDe: string;
  moTa: string;
  gia: string;
  coThuongLuong: boolean;
  giaChotNhanh: boolean;
  idThanhPho: string;
  idPhuongXa: string;
  diaChiChiTiet: string;
  soDienThoaiLienHe: string;
  choPhepChat: boolean;
  thuocTinhs: Record<number, string>;
}

export interface PostMediaItem {
  id: number;
  file?: File;
  name?: string;
  laVideo: boolean;
  duongDan?: string;
  progress: number;
  error?: string;
}

const initialDetails: PostDetailsValues = {
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

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

function validateMedia(file: File, laVideo: boolean): string | undefined {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (laVideo) {
    if (extension !== "mp4" || (file.type && file.type !== "video/mp4")) return "Video phải có định dạng MP4.";
    if (file.size > MAX_VIDEO_SIZE) return "Video không được vượt quá 50 MB.";
    return undefined;
  }
  if (!["jpg", "jpeg", "png", "webp"].includes(extension ?? "") ||
    (file.type && !["image/jpeg", "image/png", "image/webp"].includes(file.type))) {
    return "Ảnh phải có định dạng JPG, PNG hoặc WebP.";
  }
  if (file.size > MAX_IMAGE_SIZE) return "Ảnh không được vượt quá 5 MB.";
  return undefined;
}

function isQuotaError(message: string): boolean {
  return /hết lượt|không còn lượt|lượt đăng|hết số lượt/i.test(message);
}

export default function usePostForm() {
  const categories = useFetch(() => danhMucApi.layCay(), []);
  const profile = useFetch(() => nguoiDungApi.layHoSo(), []);
  const [step, setStep] = useState(0);
  const [parentId, setParentId] = useState<number | null>(null);
  const [childId, setChildId] = useState<number | null>(null);
  const category = categories.data?.find((item) => item.id === parentId) ?? null;
  const selectedCategory = category?.danhMucCons.find((item) => item.id === childId) ?? category;
  const categoryId = selectedCategory?.id;
  const attributes = useFetch(
    () => categoryId ? danhMucApi.layThuocTinh(categoryId) : Promise.resolve([] as DanhMucThuocTinh[]),
    [categoryId],
  );
  const [details, setDetails] = useState<PostDetailsValues>(initialDetails);
  const [media, setMedia] = useState<PostMediaItem[]>([]);
  const [coverId, setCoverId] = useState<number | null>(null);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [quotaMessage, setQuotaMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [categoryError, setCategoryError] = useState("");
  const nextMediaId = useRef(1);
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const previousUrl = useRef(`${location.pathname}${location.search}${location.hash}`);

  useEffect(() => {
    if (profile.data?.soDienThoai && !details.soDienThoaiLienHe) {
      setDetails((current) => ({ ...current, soDienThoaiLienHe: profile.data?.soDienThoai ?? "" }));
    }
  }, [details.soDienThoaiLienHe, profile.data]);

  useEffect(() => {
    previousUrl.current = `${location.pathname}${location.search}${location.hash}`;
  }, [location.pathname, location.search, location.hash]);

  useEffect(() => {
    if (!dirty || busy) return;
    const message = "Bạn có nội dung chưa lưu. Bạn có chắc muốn rời khỏi trang?";
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    const onClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const anchor = event.target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement) || anchor.target === "_blank") return;
      const target = new URL(anchor.href, window.location.href);
      if (target.href === window.location.href) return;
      if (!window.confirm(message)) event.preventDefault();
    };
    const onPopState = () => {
      if (window.confirm(message)) {
        previousUrl.current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
        return;
      }
      window.history.pushState(null, "", previousUrl.current);
      window.dispatchEvent(new PopStateEvent("popstate"));
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPopState);
    };
  }, [busy, dirty]);

  const chooseParent = useCallback((id: number) => {
    setParentId(id);
    setChildId(null);
    setCategoryError("");
    setDetails((current) => ({ ...current, thuocTinhs: {} }));
    setDirty(true);
  }, []);

  const chooseChild = useCallback((id: number) => {
    setChildId(id);
    setCategoryError("");
    setDetails((current) => ({ ...current, thuocTinhs: {} }));
    setDirty(true);
  }, []);

  const continueCategory = useCallback(() => {
    if (!category) return setCategoryError("Hãy chọn danh mục đăng tin.");
    if (category.danhMucCons.length > 0 && !childId) return setCategoryError("Hãy chọn danh mục con.");
    setCategoryError("");
    setStep(1);
  }, [category, childId]);

  const changeDetails = useCallback((patch: Partial<PostDetailsValues>) => {
    setDetails((current) => ({ ...current, ...patch }));
    setFieldErrors({});
    setDirty(true);
  }, []);

  const uploadOne = useCallback(async (item: PostMediaItem) => {
    if (!item.file) return;
    setMedia((current) => current.map((entry) => entry.id === item.id ? { ...entry, error: undefined, progress: 0 } : entry));
    try {
      const result = await baiDangApi.taiTep(item.file, (progress) => {
        setMedia((current) => current.map((entry) => entry.id === item.id ? { ...entry, progress } : entry));
      });
      setMedia((current) => current.map((entry) => entry.id === item.id ? { ...entry, duongDan: result.duongDan, progress: 100 } : entry));
    } catch (error) {
      setMedia((current) => current.map((entry) => entry.id === item.id ? { ...entry, error: getErrorMessage(error), progress: 0 } : entry));
    }
  }, []);

  const addFiles = useCallback(async (files: FileList | File[]) => {
    let imageCount = media.filter((item) => !item.laVideo).length;
    let videoCount = media.filter((item) => item.laVideo).length;
    const added = Array.from(files).map((file) => {
      const laVideo = file.type.startsWith("video/") || file.name.toLowerCase().endsWith(".mp4");
      let error = validateMedia(file, laVideo);
      if (!error && laVideo && videoCount >= MAX_VIDEO) error = `Mỗi tin chỉ được tải tối đa ${MAX_VIDEO} video.`;
      if (!error && !laVideo && imageCount >= MAX_ANH) error = `Mỗi tin chỉ được tải tối đa ${MAX_ANH} ảnh.`;
      if (!error && laVideo) videoCount += 1;
      if (!error && !laVideo) imageCount += 1;
      return { id: nextMediaId.current++, file, laVideo, progress: 0, error };
    });
    if (added.length) {
      setMedia((current) => [...current, ...added]);
      setDirty(true);
      for (const item of added) {
        if (!item.error) await uploadOne(item);
      }
    }
  }, [media, uploadOne]);

  const removeMedia = useCallback((id: number) => {
    setMedia((current) => current.filter((item) => item.id !== id));
    if (coverId === id) setCoverId(null);
    setDirty(true);
  }, [coverId]);

  const setCover = useCallback((id: number) => {
    setCoverId(id);
    setDirty(true);
  }, []);

  const continueMedia = useCallback(() => {
    const photos = media.filter((item) => !item.laVideo && item.duongDan);
    if (media.some((item) => !item.duongDan)) return setFormError("Hãy tải xong hoặc xóa các tệp bị lỗi trước khi tiếp tục.");
    if (photos.length === 0) return setFormError("Tin đăng cần có ít nhất 1 ảnh.");
    if (!details.moTa.trim()) return setFormError("Hãy nhập mô tả tin đăng.");
    if (details.moTa.length > MAX_MO_TA) return setFormError(`Mô tả không được vượt quá ${MAX_MO_TA} ký tự.`);
    setFormError("");
    setStep(2);
  }, [details.moTa, media]);

  const submit = useCallback(async () => {
    setFormError("");
    setFieldErrors({});
    setQuotaMessage("");
    if (!categoryId) return setFormError("Hãy chọn danh mục đăng tin.");
    if (!getAutoTitleAttributes(attributes.data ?? []) && !details.tieuDe.trim()) {
      setFieldErrors({ tieuDe: "Vui lòng nhập tiêu đề tin đăng." });
      document.getElementById("post-title")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const missingAttributes = (attributes.data ?? [])
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
    if (!details.idThanhPho) return setFormError("Hãy chọn tỉnh / thành phố.");
    if (media.some((item) => !item.duongDan)) return setFormError("Hãy tải xong hoặc xóa các tệp bị lỗi trước khi đăng.");
    if (!media.some((item) => !item.laVideo && item.duongDan)) return setFormError("Tin đăng cần có ít nhất 1 ảnh.");

    const cover = media.find((item) => item.id === coverId && !item.laVideo) ??
      media.find((item) => !item.laVideo && item.duongDan);
    const payload: TaoBaiDangRequest = {
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
        laAnhBia: item.id === cover?.id,
      })),
    };

    setBusy(true);
    try {
      await baiDangApi.tao(payload);
      setDirty(false);
      toast("Đã gửi tin. Tin sẽ hiện sau khi quản trị viên duyệt.", "ok");
      navigate("/tai-khoan/quan-ly-tin");
    } catch (error) {
      const response = axios.isAxiosError(error) ? error.response : undefined;
      const data = response?.data as { message?: string; errors?: Record<string, string | string[]> } | undefined;
      const message = data?.message || getErrorMessage(error, "Chưa đăng được tin.");
      if (response?.status === 400 && isQuotaError(message)) {
        setQuotaMessage(message);
      } else {
        setFormError(message);
      }
      if (response?.status === 400 && data?.errors) {
        const mapped: Record<string, string> = {};
        for (const [key, value] of Object.entries(data.errors)) {
          const text = Array.isArray(value) ? value.join(" ") : value;
          const normalized = key.toLowerCase();
          const attributeIndex = normalized.includes("thuoctinh") ? Number(key.match(/\d+/)?.[0]) : -1;
          const attributeId = attributeIndex >= 0 ? attributes.data?.[attributeIndex]?.id ?? attributeIndex : -1;
          const field = normalized.includes("tieude") ? "tieuDe"
            : normalized.includes("mota") ? "moTa"
            : normalized === "gia" || normalized.endsWith(".gia") ? "gia"
              : normalized.includes("idthanhpho") ? "idThanhPho"
                : normalized.includes("idphuongxa") ? "idPhuongXa"
                  : normalized.includes("diachichitiet") ? "diaChiChiTiet"
                    : normalized.includes("sodienthoai") ? "soDienThoaiLienHe"
                      : attributeId >= 0 ? `thuocTinhs.${attributeId}`
                        : "";
          if (field) mapped[field] = text;
        }
        setFieldErrors(mapped);
        if (mapped.moTa) setStep(1);
      }
    } finally {
      setBusy(false);
    }
  }, [attributes.data, categoryId, details, media, coverId, toast, navigate]);

  const selectedParent: DanhMuc | null = category;
  const profileError = profile.error;
  const attributeList = attributes.data ?? [];
  const uploadBusy = media.some((item) => !item.error && !item.duongDan);
  const coverPhoto = media.find((item) => item.id === coverId && !item.laVideo) ??
    media.find((item) => !item.laVideo);

  return {
    step, setStep, categories, selectedParent, selectedCategory, parentId, childId, categoryError,
    chooseParent, chooseChild, continueCategory, attributes, attributeList, details, changeDetails,
    media, coverPhoto, uploadBusy, profileError,
    addFiles, removeMedia, setCover, uploadOne, formError, setFormError, fieldErrors,
    quotaMessage, busy, dirty, continueMedia, submit,
  };
}
