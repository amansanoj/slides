export interface SlidePageOptions {
  uuid: string;
  title: string;
  isProtected: boolean;
}

export function renderSlidePage(opts: SlidePageOptions): string {
  const { uuid, title, isProtected } = opts;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>

  <!-- Reveal.js -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/dist/reset.css" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/dist/reveal.css" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/dist/theme/black.css" id="theme" />
  <!-- Code highlighting -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/plugin/highlight/monokai.css" />

  <!-- Print / PDF export CSS -->
  <style>
    @media print {
      .reveal .slide-background { display: block !important; }
    }
  </style>

  <style>
    /* ── Password modal ───────────────────────────── */
    #password-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.92);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    #password-overlay.hidden {
      display: none;
    }

    .modal {
      background: #1a1d27;
      border: 1px solid #2a2d3a;
      border-radius: 12px;
      padding: 2rem;
      width: 100%;
      max-width: 380px;
      margin: 1rem;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    }

    .modal h2 {
      margin: 0 0 0.25rem;
      font-size: 1.25rem;
      color: #e8eaf0;
    }

    .modal p {
      color: #7c7f8e;
      font-size: 0.9rem;
      margin: 0 0 1.5rem;
    }

    .modal label {
      display: block;
      font-size: 0.85rem;
      color: #a0a3b0;
      margin-bottom: 0.4rem;
    }

    .modal input[type="password"] {
      width: 100%;
      padding: 0.65rem 0.85rem;
      background: #0f1117;
      border: 1px solid #2a2d3a;
      border-radius: 8px;
      color: #e8eaf0;
      font-size: 1rem;
      outline: none;
      transition: border-color 0.2s;
    }

    .modal input[type="password"]:focus {
      border-color: #7c6df5;
    }

    .modal button {
      width: 100%;
      margin-top: 1rem;
      padding: 0.65rem;
      background: #7c6df5;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }

    .modal button:hover { background: #9b8ff7; }
    .modal button:disabled { background: #4a4560; cursor: not-allowed; }

    .error-msg {
      color: #f87171;
      font-size: 0.85rem;
      margin-top: 0.5rem;
      min-height: 1.1rem;
    }

    /* ── Toolbar ──────────────────────────────────── */
    #slide-toolbar {
      position: fixed;
      top: 10px;
      right: 12px;
      display: flex;
      gap: 6px;
      z-index: 100;
      opacity: 0.3;
      transition: opacity 0.2s;
    }

    #slide-toolbar:hover { opacity: 1; }

    .toolbar-btn {
      background: rgba(0,0,0,0.6);
      border: 1px solid rgba(255,255,255,0.15);
      color: #fff;
      padding: 5px 10px;
      border-radius: 6px;
      font-size: 0.75rem;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .toolbar-btn:hover {
      background: rgba(124, 109, 245, 0.5);
      border-color: #7c6df5;
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
      <!-- Slides are injected here by JavaScript -->
      <section id="loading-section">
        <p style="color:#7c7f8e;font-size:0.9rem">Loading presentation…</p>
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

    // ── Toolbar ────────────────────────────────────────────────────────────

    document.getElementById('fullscreen-btn').addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    });

    // PDF export: navigate to ?print-pdf preserving the current path
    document.getElementById('pdf-btn').addEventListener('click', () => {
      const url = new URL(window.location.href);
      url.searchParams.set('print-pdf', '');
      window.open(url.toString(), '_blank');
    });

    // In print-pdf mode, hide toolbar and load slides immediately (no modal check)
    if (window.location.search.includes('print-pdf')) {
      document.getElementById('slide-toolbar').style.display = 'none';
    }

    // ── Reveal initialisation ──────────────────────────────────────────────

    async function loadAndInitSlides() {
      try {
        const res = await fetch('/api/slides/' + UUID);
        if (!res.ok) throw new Error('Failed to load slides (' + res.status + ')');
        const markdown = await res.text();

        // Replace the loading section with a Markdown section
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
          // PDF export
          pdfMaxPagesPerSlide: 1,
          pdfSeparateFragments: false,
          plugins: [RevealMarkdown, RevealHighlight, RevealNotes, RevealZoom, RevealSearch],
        });
      } catch (err) {
        const slidesContainer = document.querySelector('.reveal .slides');
        slidesContainer.innerHTML = \`
          <section>
            <h2 style="color:#f87171">Error loading presentation</h2>
            <p style="color:#7c7f8e">\${err.message}</p>
          </section>
        \`;
        Reveal.initialize({ plugins: [RevealHighlight] });
      }
    }

    // ── Password modal logic ───────────────────────────────────────────────

    // In print-pdf mode, skip the password modal entirely and load slides directly.
    // The user is already at the URL, so they're considered authenticated for export.
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
