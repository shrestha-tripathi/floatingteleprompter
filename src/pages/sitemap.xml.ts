import type { APIRoute } from "astro";
import { absoluteUrl } from "../site.config";

/**
 * Dynamic sitemap.
 *
 * Static-list version (no content collection / blog). Hand-maintained — small
 * site, low churn, and we want explicit control over what's indexed. The /app
 * teleprompter IS indexed (it's the product / money page).
 *
 * Priority guide:
 *   1.0  — homepage (single most important entry point)
 *   0.9  — /app (the teleprompter — the product)
 *   0.7  — primary content (how-it-works, about)
 *   0.6  — faq
 *   0.5  — contact
 *   0.3  — legal documents (privacy, terms) — trust signals, not SEO targets
 */
export const GET: APIRoute = async () => {
  const today = new Date().toISOString().slice(0, 10);

  const staticPages = [
    { path: "/", priority: "1.0", changefreq: "weekly" },
    { path: "/app", priority: "0.9", changefreq: "weekly" },
    { path: "/how-it-works", priority: "0.7", changefreq: "monthly" },
    { path: "/faq", priority: "0.6", changefreq: "monthly" },
    { path: "/about", priority: "0.7", changefreq: "monthly" },
    { path: "/contact", priority: "0.5", changefreq: "yearly" },
    { path: "/privacy", priority: "0.3", changefreq: "yearly" },
    { path: "/terms", priority: "0.3", changefreq: "yearly" },
  ];

  const allPages = staticPages.map((p) => ({ ...p, lastmod: today }));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (p) => `  <url>
    <loc>${absoluteUrl(p.path)}</loc>
    <lastmod>${p.lastmod}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

  return new Response(xml, {
    status: 200,
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
