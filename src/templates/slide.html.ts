export interface SlidePageOptions {
  uuid: string;
  title: string;
  isProtected: boolean;
}

export function renderSlidePage(opts: SlidePageOptions): string {
  const { uuid, title, isProtected } = opts;

  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>

  <!-- Brand: design tokens + Instrument Sans, Geist, Geist Mono -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@amansanoj/brand/globals.css" />

  <!-- Reveal.js -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/dist/reset.css" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/dist/reveal.css" />
  <!-- Code highlighting -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/plugin/highlight/monokai.css" />

  <style>
    /* ── Brand-aware reveal.js theme override ───────────────
       Replaces the black theme entirely with brand tokens.    */
    .reveal-viewport {
      background: var(--background);
    }

    .reveal {
      font-family: var(--font-body);
      font-size: 38px;
      color: var(--foreground);
    }

    .reveal h1,
    .reveal h2,
    .reveal h3,
    .reveal h4,
    .reveal h5,
    .reveal h6 {
      font-family: var(--font-display);
      color: var(--foreground);
      font-weight: 700;
      letter-spacing: -0.02em;
      text-transform: none;
      text-shadow: none;
    }

    .reveal h1 { font-size: 2.5em; }
    .reveal h2 { font-size: 1.6em; }
    .reveal h3 { font-size: 1.3em; }

    .reveal a {
      color: var(--primary);
      text-decoration: none;
    }

    .reveal a:hover {
      color: var(--primary-light);
      text-shadow: none;
      border: none;
    }

    .reveal strong { color: var(--foreground); }

    .reveal blockquote {
      background: var(--card);
      border-left: 4px solid var(--primary);
      border-radius: var(--radius);
      padding: 0.5em 1em;
      font-style: italic;
      box-shadow: none;
    }

    .reveal code {
      font-family: var(--font-mono);
      background: var(--card);
      color: var(--primary);
      padding: 0.1em 0.35em;
      border-radius: calc(var(--radius) / 2);
      font-size: 0.85em;
    }

    .reveal pre {
      font-family: var(--font-mono);
      box-shadow: none;
      border: 1px solid var(--border);
      border-radius: var(--radius);
    }

    .reveal pre code {
      background: transparent;
      color: inherit;
      padding: 0;
    }

    .reveal table th {
      color: var(--primary);
    }

    .reveal table tr:nth-child(even) {
      background: var(--card);
    }

    /* Progress bar */
    .reveal .progress {
      background: var(--border);
      color: var(--primary);
    }

    /* Slide number */
    .reveal .slide-number {
      background: transparent;
      color: var(--muted-foreground);
      font-family: var(--font-mono);
      font-size: 0.7rem;
    }

    /* Controls arrows */
    .reveal .controls {
      color: var(--primary);
    }

    /* Selection */
    .reveal ::selection {
      background: color-mix(in oklch, var(--primary) 30%, transparent);
      color: var(--foreground);
    }

    /* ── Password modal ─────────────────────────────────────── */
    #password-overlay {
      position: fixed;
      inset: 0;
      background: color-mix(in oklch, var(--background) 92%, transparent);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      font-family: var(--font-body);
    }

    #password-overlay.hidden {
      display: none;
    }

    .modal {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: calc(var(--radius) * 2);
      padding: 2rem;
      width: 100%;
      max-width: 380px;
      margin: 1rem;
      box-shadow: 0 20px 60px color-mix(in oklch, var(--background) 50%, black);
    }

    .modal h2 {
      font-family: var(--font-display);
      margin: 0 0 0.25rem;
      font-size: 1.25rem;
      color: var(--card-foreground);
      font-weight: 700;
    }

    .modal p {
      color: var(--muted-foreground);
      font-size: 0.9rem;
      margin: 0 0 1.5rem;
    }

    .modal label {
      display: block;
      font-size: 0.85rem;
      color: var(--muted-foreground);
      margin-bottom: 0.4rem;
    }

    .modal input[type="password"] {
      width: 100%;
      padding: 0.65rem 0.85rem;
      background: var(--background);
      border: 1px solid var(--input);
      border-radius: var(--radius);
      color: var(--foreground);
      font-family: var(--font-body);
      font-size: 1rem;
      outline: none;
      transition: border-color 0.2s;
    }

    .modal input[type="password"]:focus {
      border-color: var(--ring);
    }

    .modal button {
      width: 100%;
      margin-top: 1rem;
      padding: 0.65rem;
      background: var(--primary);
      color: var(--primary-foreground);
      border: none;
      border-radius: var(--radius);
      font-family: var(--font-body);
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.2s;
    }

    .modal button:hover { opacity: 0.85; }
    .modal button:disabled { opacity: 0.4; cursor: not-allowed; }

    .error-msg {
      color: var(--destructive);
      font-size: 0.85rem;
      margin-top: 0.5rem;
      min-height: 1.1rem;
    }

    /* ── Toolbar ────────────────────────────────────────────── */
    #slide-toolbar {
      position: fixed;
      top: 10px;
      right: 12px;
      display: flex;
      gap: 6px;
      z-index: 100;
      opacity: 0.25;
      transition: opacity 0.2s;
    }

    #slide-toolbar:hover { opacity: 1; }

    .toolbar-btn {
      background: color-mix(in oklch, var(--card) 80%, transparent);
      border: 1px solid var(--border);
      color: var(--foreground);
      padding: 5px 10px;
      border-radius: var(--radius);
      font-family: var(--font-body);
      font-size: 0.75rem;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      backdrop-filter: blur(8px);
      transition: border-color 0.2s, background 0.2s;
    }

    .toolbar-btn:hover {
      background: color-mix(in oklch, var(--primary) 15%, var(--card));
      border-color: var(--primary);
      color: var(--foreground);
    }

    /* Print / PDF mode */
    @media print {
      #slide-toolbar { display: none !important; }
      #password-overlay { display: none !important; }
      .reveal .slide-background { display: block !important; }
    }
  </style>
</head>
<body>

  <!-- Password protection overlay -->
  ${isProtected ? `
  <div id="password-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <div class="modal">
      <h2 id="modal-title">🔒 Protected Presentation</h2>
      <p>This presentation is password protected. Enter the password to continue.</p>
      <label for="password-input">Password</label>
      <input
        type="password"
        id="password-input"
        autocomplete="current-password"
        placeholder="Enter password"
        autofocus
      />
      <div class="error-msg" id="error-msg" role="alert" aria-live="polite"></div>
      <button id="unlock-btn" type="button">Unlock</button>
    </div>
  </div>` : ""}

  <!-- Toolbar -->
  <div id="slide-toolbar">
    <button class="toolbar-btn" id="pdf-btn" title="Export to PDF — opens print view, then use Print → Save as PDF" type="button">
      📄 PDF
    </button>
    <button class="toolbar-btn" id="fullscreen-btn" title="Toggle fullscreen" type="button">⛶ Fullscreen</button>
    <a href="/" class="toolbar-btn" title="Back to all presentations">↩ All Slides</a>
  </div>

  <!-- Reveal.js presentation container -->
  <div class="reveal">
    <div class="slides">
      <section id="loading-section">
        <p style="color:var(--muted-foreground);font-size:0.5em">Loading…</p>
      </section>
    </div>
  </div>

  <!-- Reveal.js core -->
  <script src="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/dist/reveal.js"></script>
  <!-- Plugins -->
  <script src="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/plugin/markdown/markdown.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/plugin/highlight/highlight.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/plugin/notes/notes.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/plugin/zoom/zoom.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/plugin/search/search.js"></script>

  <script>
    const UUID = ${JSON.stringify(uuid)};
    const IS_PROTECTED = ${JSON.stringify(isProtected)};

    // ── Toolbar ──────────────────────────────────────────────

    document.getElementById('fullscreen-btn').addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    });

    // PDF export: navigate to ?print-pdf preserving the current UUID path
    document.getElementById('pdf-btn').addEventListener('click', () => {
      const url = new URL(window.location.href);
      url.searchParams.set('print-pdf', '');
      window.open(url.toString(), '_blank');
    });

    // In print-pdf mode, hide toolbar
    if (window.location.search.includes('print-pdf')) {
      document.getElementById('slide-toolbar').style.display = 'none';
    }

    // ── Reveal initialisation ────────────────────────────────

    async function loadAndInitSlides() {
      try {
        const res = await fetch('/api/slides/' + UUID);
        if (!res.ok) throw new Error('Failed to load slides (' + res.status + ')');
        const markdown = await res.text();

        const slidesContainer = document.querySelector('.reveal .slides');
        slidesContainer.innerHTML = \`
          <section
            data-markdown
            data-separator="^\\r?\\n---\\r?\\n$"
            data-separator-vertical="^\\r?\\n--\\r?\\n$"
            data-separator-notes="^Notes:"
          >
            <textarea data-template>\${markdown.replace(/<\\/textarea>/g, '<\\\\/textarea>')}</textarea>
          </section>
        \`;

        Reveal.initialize({
          hash: true,
          history: true,
          slideNumber: 'c/t',
          transition: 'slide',
          transitionSpeed: 'default',
          backgroundTransition: 'fade',
          center: true,
          touch: true,
          controls: true,
          controlsTutorial: true,
          progress: true,
          keyboard: true,
          overview: true,
          pdfMaxPagesPerSlide: 1,
          pdfSeparateFragments: false,
          plugins: [RevealMarkdown, RevealHighlight, RevealNotes, RevealZoom, RevealSearch],
        });
      } catch (err) {
        const slidesContainer = document.querySelector('.reveal .slides');
        slidesContainer.innerHTML = \`
          <section>
            <h2 style="color:var(--destructive)">Error loading presentation</h2>
            <p style="color:var(--muted-foreground)">\${err.message}</p>
          </section>
        \`;
        Reveal.initialize({ plugins: [RevealHighlight] });
      }
    }

    // ── Password modal logic ─────────────────────────────────

    // Print-pdf mode skips the password modal entirely
    const isPrintMode = window.location.search.includes('print-pdf');

    if (IS_PROTECTED && !isPrintMode) {
      const overlay = document.getElementById('password-overlay');
      const input   = document.getElementById('password-input');
      const btn     = document.getElementById('unlock-btn');
      const errMsg  = document.getElementById('error-msg');

      async function tryUnlock() {
        const password = input.value;
        if (!password) return;

        btn.disabled = true;
        btn.textContent = 'Verifying…';
        errMsg.textContent = '';

        try {
          const res = await fetch('/api/verify/' + UUID, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password }),
          });

          const data = await res.json();

          if (data.ok) {
            overlay.classList.add('hidden');
            await loadAndInitSlides();
          } else {
            errMsg.textContent = 'Incorrect password. Please try again.';
            input.value = '';
            input.focus();
          }
        } catch (err) {
          errMsg.textContent = 'Error verifying password. Please try again.';
        } finally {
          btn.disabled = false;
          btn.textContent = 'Unlock';
        }
      }

      btn.addEventListener('click', tryUnlock);
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') tryUnlock(); });
    } else {
      // Not protected (or print-pdf mode) — load immediately
      loadAndInitSlides();
    }
  </script>
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
