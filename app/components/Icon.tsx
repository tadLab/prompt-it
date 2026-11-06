import type { CSSProperties } from "react";
export type IconName =
  | "arrow"
  | "up-right"
  | "spark"
  | "check"
  | "copy"
  | "edit"
  | "clock"
  | "close"
  | "menu"
  | "plus"
  | "chevron"
  | "globe"
  | "send"
  | "code"
  | "mail"
  | "pen"
  | "layers"
  | "undo"
  | "download"
  | "trash";
const paths: Record<IconName, React.ReactNode> = {
  arrow: <path d="M4 12h15M13 5l7 7-7 7" />,
  "up-right": <path d="M6 18 18 6M6 6h12v12" />,
  spark: (
    <>
      <path d="m12 3 2.6 6.4L21 12l-6.4 2.6L12 21l-2.6-6.4L3 12l6.4-2.6L12 3Z" />
      <path d="m20 2 .6 1.4L22 4l-1.4.6L20 6l-.6-1.4L18 4l1.4-.6L20 2Z" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  copy: (
    <>
      <rect x="8" y="8" width="12" height="13" rx="2" />
      <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h3" />
    </>
  ),
  edit: <path d="m16 3 5 5-12 12H4v-5L16 3ZM13 6l5 5" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  close: <path d="m6 6 12 12M6 18 18 6" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  plus: <path d="M12 5v14M5 12h14" />,
  chevron: <path d="m6 9 6 6 6-6" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <ellipse cx="12" cy="12" rx="4" ry="9" />
      <path d="M3 12h18" />
    </>
  ),
  send: <path d="m3 3 19 9-19 9 4-9-4-9ZM7 12h15" />,
  code: <path d="m7 7-5 5 5 5M17 7l5 5-5 5M14 4l-4 16" />,
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 6 9 7 9-7" />
    </>
  ),
  pen: (
    <>
      <path d="m12 3 9 9-9 9-9-9 9-9ZM12 3v9" />
      <circle cx="12" cy="12" r="2" />
    </>
  ),
  layers: <path d="m12 3 10 5-10 5L2 8l10-5ZM2 12l10 5 10-5M2 16l10 5 10-5" />,
  undo: <path d="M3 10h11a6 6 0 0 1 0 12M3 10l5-5M3 10l5 5" />,
  download: <path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" />,
  trash: <path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7" />,
};
export default function Icon({
  name,
  size = 18,
  className,
  style,
}: {
  name: IconName;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      style={style}
    >
      {paths[name]}
    </svg>
  );
}
