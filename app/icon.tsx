import { ImageResponse } from "next/og";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";
export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#080b09",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 7,
      }}
    >
      <svg width="25" height="25" viewBox="0 0 40 40">
        <path d="M4 8h11l12 12-12 12H4l12-12L4 8Z" fill="#a4f986" />
        <path d="M20 8h9l11 12-11 12h-9l11-12L20 8Z" fill="#6b9f58" />
      </svg>
    </div>,
    size,
  );
}
