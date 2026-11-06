import { ImageResponse } from "next/og";
export const alt = "makebetterprompt — Your idea. Clearly expressed.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(ellipse at 50% 130%, #4e7734 0%, #152112 45%, #080b09 80%)",
        color: "#f1f5ef",
        fontFamily: "sans-serif",
      }}
    >
      <svg width="64" height="64" viewBox="0 0 40 40">
        <path d="M4 8h11l12 12-12 12H4l12-12L4 8Z" fill="#a4f986" />
        <path d="M20 8h9l11 12-11 12h-9l11-12L20 8Z" fill="#6b9f58" />
      </svg>
      <div
        style={{
          display: "flex",
          fontSize: 85,
          letterSpacing: -5,
          marginTop: 22,
        }}
      >
        Your idea.
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 85,
          letterSpacing: -5,
          color: "#cee7c5",
        }}
      >
        Clearly expressed.
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 21,
          color: "#a1aca3",
          marginTop: 42,
        }}
      >
        makebetterprompt.com
      </div>
    </div>,
    size,
  );
}
