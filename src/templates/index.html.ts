import type { Presentation } from "../types.js";

export function renderIndexPage(presentations: Presentation[]): string {
  const rows = presentations
    .map((p) => {
      const isProtected = p.hashed_password !== null;
      const badge = isProtected
        ? `<span class="badge protected" aria-label="Password protected">🔒 Protected</span>`
        : `<span class="badge public" aria-label="Public">🌐 Public</span>`;
      const date = new Date(p.created_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      return `
        <li class="presentation-item">
          <a href="/${p.uuid}" class="presentation-link">
            <span class="presentation-title">${escapeHtml(p.title)}</span>
          </a>
          <div class="presentation-meta">
            ${badge}
            <span class="presentation-date">${date}</span>
          </div>
        </li>`;
    })
    .join("\n");

  const emptyState =
    presentations.length === 0
      ? `<p class="empty-state">No presentations yet. Add Markdown files to <code>presentations/</code> and run the scanner.</p>`
      : "";

  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Slides — amansanoj</title>

  <!-- Brand: design tokens + Instrument Sans, Geist, Geist Mono -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@amansanoj/brand/globals.css" />

  <style>
    *, *::before, *::after { box-sizing: border-box; }

    body {
      font-family: var(--font-body);
      background: var(--background);
      color: var(--foreground);
      margin: 0;
      padding: 2rem 1rem;
      min-height: 100vh;
    }

    .container {
      max-width: 720px;
      margin: 0 auto;
    }

    /* ── Header ── */
    header {
      margin-bottom: 2.5rem;
    }

    header h1 {
      font-family: var(--font-display);
      font-size: 2rem;
      font-weight: 700;
      margin: 0 0 0.25rem;
      color: var(--primary);
    }

    header p {
      color: var(--muted-foreground);
      margin: 0;
      font-size: 0.95rem;
    }

    header p a {
      color: var(--primary);
      text-decoration: none;
    }

    header p a:hover {
      color: var(--primary-light);
    }

    /* ── List ── */
    .presentation-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .presentation-item {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 1rem 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      transition: border-color 0.2s;
    }

    .presentation-item:hover {
      border-color: var(--primary);
    }

    .presentation-link {
      text-decoration: none;
      color: var(--card-foreground);
      font-weight: 500;
      font-size: 1rem;
      flex: 1;
      min-width: 0;
    }

    .presentation-title {
      display: block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .presentation-link:hover .presentation-title {
      color: var(--primary);
    }

    .presentation-meta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-shrink: 0;
    }

    /* ── Badges ── */
    .badge {
      font-size: 0.75rem;
      padding: 0.2rem 0.6rem;
      border-radius: 999px;
      font-weight: 500;
      white-space: nowrap;
    }

    .badge.protected {
      background: color-mix(in oklch, var(--secondary) 15%, transparent);
      color: var(--secondary);
      border: 1px solid color-mix(in oklch, var(--secondary) 30%, transparent);
    }

    .badge.public {
      background: color-mix(in oklch, var(--primary) 15%, transparent);
      color: var(--primary);
      border: 1px solid color-mix(in oklch, var(--primary) 30%, transparent);
    }

    .presentation-date {
      font-size: 0.8rem;
      color: var(--muted-foreground);
    }

    /* ── Empty state ── */
    .empty-state {
      color: var(--muted-foreground);
      text-align: center;
      padding: 3rem 1rem;
      font-size: 0.95rem;
    }

    .empty-state code {
      background: var(--muted);
      color: var(--foreground);
      padding: 0.1rem 0.4rem;
      border-radius: calc(var(--radius) / 2);
      font-family: var(--font-mono);
      font-size: 0.9em;
    }

    /* ── Footer ── */
    footer {
      margin-top: 3rem;
      text-align: center;
      font-size: 0.8rem;
      color: var(--muted-foreground);
    }

    footer a {
      color: var(--primary);
      text-decoration: none;
    }

    footer a:hover {
      color: var(--primary-light);
    }

    @media (max-width: 500px) {
      .presentation-item {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Slides</h1>
      <p>Presentations by <a href="https://amansanoj.com">amansanoj</a></p>
    </header>
    <main>
      ${emptyState}
      <ul class="presentation-list" role="list">
        ${rows}
      </ul>
    </main>
    <footer>
      <p>Built with <a href="https://revealjs.com" target="_blank" rel="noopener">reveal.js</a> &amp; Cloudflare Workers</p>
    </footer>
  </div>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}
