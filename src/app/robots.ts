import type { MetadataRoute } from "next";

const BASE_URL = "https://villavicuna.com.ar";

// Buscadores y asistentes de IA (ChatGPT, Claude, Perplexity, Gemini, Apple):
// se los nombra para dejar explícito que pueden leer el sitio.
const BOTS = [
  "*",
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-Web",
  "PerplexityBot",
  "Google-Extended",
  "Applebot-Extended",
  "Bingbot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: BOTS.map((userAgent) => ({ userAgent, allow: "/", disallow: ["/admin", "/api"] })),
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
