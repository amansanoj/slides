# slides.amansanoj.com

Personal presentation platform powered by [reveal.js](https://revealjs.com) and Cloudflare Workers.

## How it works

- Markdown files live in `presentations/{year}/{month}/{topic}/slides.md`
- Each presentation is assigned a UUID v4 and stored in Cloudflare D1
- The Worker serves presentations at `slides.amansanoj.com/{uuid}`
- Password-protected presentations show a modal before rendering
- PDF export via reveal.js print mode (`?print-pdf` query param)

## Local development

### Prerequisites

- [Bun](https://bun.sh) installed
- Cloudflare account with Workers and D1 access

### Setup

```bash
# Install dependencies
bun install

# Create the D1 database (first time only)
bun x wrangler d1 create slides-db
# Copy the database_id output into wrangler.toml

# Apply migrations locally
bun run db:migrate:local

# Start local dev server
bun run dev
```

### Adding presentations

1. Create a Markdown file at `presentations/{year}/{month}/{topic}/slides.md`
2. Run the scanner to register it in D1:
   ```bash
   bun run scan          # local D1
   bun run scan:remote   # remote D1
   ```
3. The scanner prints the UUID — use it to access the presentation

### Password protecting a presentation

Run the following Wrangler D1 command to set a bcrypt-hashed password:

```bash
# First, generate a bcrypt hash (rounds=10)
bun -e "import bcrypt from 'bcryptjs'; console.log(await bcrypt.hash('yourpassword', 10))"

# Then update the database
bun x wrangler d1 execute slides-db --local --command \
  "UPDATE presentations SET hashed_password = '\$2a\$10\$...' WHERE uuid = 'your-uuid'"
```

## Deployment

Push to `main` — GitHub Actions handles the rest:

1. Runs D1 migrations on the remote database
2. Runs the presentation scanner to register any new slides
3. Deploys the Worker

### Required GitHub secrets

| Secret | Description |
|--------|-------------|
| `CLOUDFLARE_API_TOKEN` | API token with Workers and D1 permissions |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID |

### Custom domain

In the Cloudflare dashboard, add a custom domain route for `slides.amansanoj.com` pointing to the `slides` Worker.

## Presentation format

Slides are separated by `---` (horizontal) or `--` (vertical). Speaker notes follow `Notes:`.

```markdown
# Title Slide

---

## Second Slide

Content here

--

### Vertical sub-slide

Notes:
Speaker notes go here (press S to open)

---

## Final Slide
```

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `→` / `Space` | Next slide |
| `←` | Previous slide |
| `F` | Fullscreen |
| `S` | Speaker notes |
| `O` / `Esc` | Slide overview |
| `?` | All shortcuts |

## PDF export

Append `?print-pdf` to the URL and use the browser's **Print → Save as PDF** option. Or click the **📄 PDF** button in the top-right toolbar.
