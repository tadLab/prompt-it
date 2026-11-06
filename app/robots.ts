import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://makebetterprompt.com";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/result", "/history"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
