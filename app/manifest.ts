import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "makebetterprompt",
    short_name: "makebetterprompt",
    description: "Your idea. Clearly expressed.",
    start_url: "/",
    display: "standalone",
    background_color: "#080b09",
    theme_color: "#a4f986",
    icons: [
      {
        src: "/brand/mark.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
