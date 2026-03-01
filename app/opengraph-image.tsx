import { ImageResponse } from "next/og";

export const alt = "prompt it — Build better prompts";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div style={{ background: "linear-gradient(135deg, #0a1a14, #0d3d2e)", width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "system-ui" }}>
        <div style={{ fontSize: 64, fontWeight: 700, color: "#34d399", marginBottom: 16, display: "flex" }}>
          prompt it
        </div>
        <div style={{ fontSize: 32, color: "rgba(255,255,255,0.8)", marginBottom: 8, display: "flex" }}>
          Build better prompts. Get better AI results.
        </div>
        <div style={{ fontSize: 20, color: "rgba(255,255,255,0.4)", display: "flex" }}>
          Works with ChatGPT, Claude, Gemini and more
        </div>
      </div>
    ),
    { ...size }
  );
}
