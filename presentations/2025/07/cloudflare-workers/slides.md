# Building at the Edge

### Cloudflare Workers + D1 in Practice

*July 2025*

---

## Why Edge Computing?

- **Global latency**: Code runs close to your users
- **No cold starts**: V8 isolates start in microseconds
- **Serverless economics**: Pay only for what you use
- **Built-in scaling**: Handles traffic spikes automatically

---

## Cloudflare Workers Stack

```
Request → Worker (TypeScript) → D1 (SQLite) → Response
```

- **Workers**: JavaScript/TypeScript at the edge
- **D1**: SQLite database, globally replicated
- **R2**: Object storage (S3-compatible)
- **KV**: Key-value store, globally replicated

---

## D1 — SQLite for the Edge

```typescript
const result = await env.DB.prepare(
  "SELECT * FROM presentations WHERE uuid = ?"
).bind(uuid).first();
```

- Familiar SQL syntax
- Zero-config migrations with Wrangler
- Local dev with `wrangler dev`
- Automatic replication

---

## Wrangler Config

```toml
name = "my-worker"
main = "src/index.ts"
compatibility_date = "2024-12-01"

[[d1_databases]]
binding = "DB"
database_name = "my-db"
database_id = "your-db-id"
```

---

## Deploy Pipeline

```yaml
# GitHub Actions
- name: Deploy
  run: wrangler deploy
  env:
    CLOUDFLARE_API_TOKEN: ${{ secrets.CF_TOKEN }}
```

Push to `main` → GitHub Actions → Wrangler deploys → Live in seconds

---

## This Slide Deck

Built with exactly this stack:

- **Cloudflare Workers** for routing
- **D1** for presentation metadata
- **reveal.js** for rendering
- **Bun** for the build toolchain
- **GitHub Actions** for CI/CD

---

## Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [D1 Documentation](https://developers.cloudflare.com/d1/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
- [reveal.js](https://revealjs.com)

---

## Questions?

**slides.amansanoj.com**
