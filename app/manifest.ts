import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "prompt it",
    short_name: "prompt it",
    description: "Build better prompts. Get better AI results.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a1a14",
    theme_color: "#34d399",
  };
}
