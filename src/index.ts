import type { Env, Presentation } from "./types.js";
import { renderIndexPage } from "./templates/index.html.js";
import { renderSlidePage } from "./templates/slide.html.js";
import { verifyPassword } from "./utils/hash.js";

// UUID v4 regex
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // ── CORS preflight ─────────────────────────────────────────────────────
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() });
    }

    try {
      // GET /
      if (pathname === "/" && request.method === "GET") {
        return handleIndex(env);
      }

      // GET /api/slides/:uuid  — returns raw Markdown
      const slidesApiMatch = pathname.match(/^\/api\/slides\/([^/]+)$/);
      if (slidesApiMatch && request.method === "GET") {
        return handleSlidesApi(slidesApiMatch[1], env);
      }

      // POST /api/verify/:uuid  — password check
      const verifyApiMatch = pathname.match(/^\/api\/verify\/([^/]+)$/);
      if (verifyApiMatch && request.method === "POST") {
        return handleVerifyApi(request, verifyApiMatch[1], env);
      }

      // GET /:uuid  — presentation viewer page
      const uuidMatch = pathname.match(/^\/([^/]+)$/);
      if (uuidMatch && request.method === "GET") {
        return handlePresentation(uuidMatch[1], env);
      }

      return notFound("Page not found");
    } catch (err) {
      console.error("Unhandled error:", err);
      return new Response("Internal server error", { status: 500 });
    }
  },
};

// ── Route Handlers ───────────────────────────────────────────────────────────

async function handleIndex(env: Env): Promise<Response> {
  const { results } = await env.DB.prepare(
    `SELECT uuid, file_path, title, created_date, hashed_password
     FROM presentations
     ORDER BY created_date DESC`
  ).all<Presentation>();

  const html = renderIndexPage(results ?? []);
  return htmlResponse(html);
}

async function handlePresentation(uuid: string, env: Env): Promise<Response> {
  if (!UUID_RE.test(uuid)) {
    return notFound("Presentation not found");
  }

  const presentation = await env.DB.prepare(
    `SELECT uuid, file_path, title, created_date, hashed_password
     FROM presentations WHERE uuid = ?`
  )
    .bind(uuid)
    .first<Presentation>();

  if (!presentation) {
    return notFound("Presentation not found");
  }

  const html = renderSlidePage({
    uuid: presentation.uuid,
    title: presentation.title,
    isProtected: presentation.hashed_password !== null,
  });

  return htmlResponse(html);
}

async function handleSlidesApi(uuid: string, env: Env): Promise<Response> {
  if (!UUID_RE.test(uuid)) {
    return jsonError("Invalid UUID", 400);
  }

  const presentation = await env.DB.prepare(
    `SELECT uuid, file_path, hashed_password FROM presentations WHERE uuid = ?`
  )
    .bind(uuid)
    .first<Pick<Presentation, "uuid" | "file_path" | "hashed_password">>();

  if (!presentation) {
    return jsonError("Presentation not found", 404);
  }

  // Fetch Markdown from GitHub raw content
  const markdownUrl = `${env.GITHUB_RAW_BASE}/${presentation.file_path}`;
  const mdRes = await fetch(markdownUrl, {
    headers: { "User-Agent": "slides-worker/1.0" },
  });

  if (!mdRes.ok) {
    console.error(
      `Failed to fetch markdown: ${markdownUrl} → ${mdRes.status}`
    );
    return jsonError("Presentation content not found", 404);
  }

  const markdown = await mdRes.text();

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300",
      ...corsHeaders(),
    },
  });
}

async function handleVerifyApi(
  request: Request,
  uuid: string,
  env: Env
): Promise<Response> {
  if (!UUID_RE.test(uuid)) {
    return jsonError("Invalid UUID", 400);
  }

  let body: { password?: unknown };
  try {
    body = (await request.json()) as { password?: unknown };
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  if (!body.password || typeof body.password !== "string") {
    return jsonError("Missing or invalid password field", 400);
  }

  const presentation = await env.DB.prepare(
    `SELECT hashed_password FROM presentations WHERE uuid = ?`
  )
    .bind(uuid)
    .first<{ hashed_password: string | null }>();

  if (!presentation) {
    return jsonError("Presentation not found", 404);
  }

  // Presentation is not protected — trivially passes
  if (presentation.hashed_password === null) {
    return jsonResponse({ ok: true });
  }

  const match = await verifyPassword(body.password, presentation.hashed_password);

  if (match) {
    return jsonResponse({ ok: true });
  }

  // Small artificial delay to slow brute-force attempts
  await new Promise((r) => setTimeout(r, 500));
  return jsonResponse({ ok: false }, 401);
}

// ── Utility ──────────────────────────────────────────────────────────────────

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function htmlResponse(html: string, status = 200): Response {
  return new Response(html, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "SAMEORIGIN",
    },
  });
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(),
    },
  });
}

function jsonError(message: string, status: number): Response {
  return jsonResponse({ error: message }, status);
}

function notFound(message: string): Response {
  const body = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><title>404 — Not Found</title></head>
<body style="font-family:sans-serif;text-align:center;padding:4rem;background:#0f1117;color:#e8eaf0">
  <h1 style="font-size:4rem;margin-bottom:0.5rem">404</h1>
  <p style="color:#7c7f8e">${message}</p>
  <a href="/" style="color:#7c6df5;text-decoration:none">← Back to all slides</a>
</body>
</html>`;

  return new Response(body, {
    status: 404,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
