import type { ReactNode } from "react";

const paths = {
  search: (<><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>),
  heart: (<path d="M12 20.5C5 16 2.5 12.5 2.5 9A4.8 4.8 0 0 1 7.3 4.2c1.9 0 3.5 1 4.7 2.8 1.2-1.8 2.8-2.8 4.7-2.8A4.8 4.8 0 0 1 21.5 9c0 3.5-2.5 7-9.5 11.5Z" />),
  bell: (<><path d="M6 9a6 6 0 1 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9Z" /><path d="M10 20a2 2 0 0 0 4 0" /></>),
  chat: (<path d="M4 5h16v11H9l-5 4V5Z" />),
  plus: (<path d="M12 5v14M5 12h14" />),
  user: (<><circle cx="12" cy="8" r="4" /><path d="M4 21c1-4 4-6 8-6s7 2 8 6" /></>),
  logout: (<><path d="M9 4H5v16h4" /><path d="M16 8l4 4-4 4M20 12H9" /></>),
  trash: (<><path d="M4 7h16M10 11v6M14 11v6" /><path d="M6 7l1 13h10l1-13M9 7V4h6v3" /></>),
  check: (<path d="m5 12.5 4.5 4.5L19 7.5" />),
  x: (<path d="M6 6l12 12M18 6 6 18" />),
  pin: (<><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></>),
  tag: (<><path d="M3 12 12 3h9v9l-9 9-9-9Z" /><circle cx="16.5" cy="7.5" r="1.2" /></>),
  shield: (<path d="M12 3 4.5 6v6c0 4.5 3.2 7.5 7.5 9 4.3-1.5 7.5-4.5 7.5-9V6L12 3Z" />),
  edit: (<><path d="M4 20h4L19 9l-4-4L4 16v4Z" /><path d="m13.5 6.5 4 4" /></>),
  image: (<><rect x="3.5" y="4.5" width="17" height="15" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="m4 18 5-5 4 3.5 3-2.5 4 4" /></>),
  left: (<path d="m14 6-6 6 6 6" />),
  right: (<path d="m10 6 6 6-6 6" />),
  grid: (<><rect x="4" y="4" width="7" height="7" rx="1" /><rect x="13" y="4" width="7" height="7" rx="1" /><rect x="4" y="13" width="7" height="7" rx="1" /><rect x="13" y="13" width="7" height="7" rx="1" /></>),
  flag: (<path d="M5 21V4h11l-1.5 4 1.5 4H5" />),
  send: (<path d="M4 12 20 4l-4 16-4-6-8-2Z" />),
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof paths;

interface Props {
  name: IconName;
  size?: number;
  filled?: boolean;
}

export default function Icon({ name, size = 20, filled = false }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths[name]}
    </svg>
  );
}
