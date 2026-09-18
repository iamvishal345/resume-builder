import type { APIRoute } from "astro";
import { SITE, routes } from "@data/site";

export const GET: APIRoute = () => {
  const origin = SITE.url.replace(/\/$/, "");
  const urls = routes
    .map(
      (route) => `  <url>
    <loc>${origin}${route.path === "/" ? "/" : route.path}</loc>
    <priority>${route.priority}</priority>
  </url>`,
    )
    .join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
};
