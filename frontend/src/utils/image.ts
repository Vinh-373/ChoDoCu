/** Ảnh trống → dùng ảnh nền SVG tạo sẵn, không cần file ngoài. */
export const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='400' height='300' fill='#e8ecf3'/><g fill='none' stroke='#9aa5bb' stroke-width='6' stroke-linecap='round' stroke-linejoin='round'><rect x='140' y='100' width='120' height='100' rx='10'/><circle cx='176' cy='136' r='10'/><path d='m146 192 38-34 28 24 20-16 22 26'/></g></svg>`,
  );

export function imgSrc(url?: string | null): string {
  return url && url.trim() ? url : PLACEHOLDER;
}

export function onImgError(e: { currentTarget: HTMLImageElement }) {
  const el = e.currentTarget;
  if (el.src !== PLACEHOLDER) el.src = PLACEHOLDER;
}
