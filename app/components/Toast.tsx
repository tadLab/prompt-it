"use client";

export default function Toast({
  message,
  type,
}: {
  message: string;
  type: "success" | "error";
}) {
  return (
    <div
      className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg text-sm font-medium shadow-lg fade-in ${
        type === "success"
          ? "bg-emerald-400 text-black"
          : "bg-white/10 text-white border border-white/20"
      }`}
    >
      {message}
    </div>
  );
}
