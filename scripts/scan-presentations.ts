#!/usr/bin/env bun
/**
 * scan-presentations.ts
 *
 * Scans the presentations/ directory for slides.md files, auto-generates
 * UUID v4 for new files, extracts the title from the first H1 heading,
 * and inserts new entries into the D1 database.
 *
 * Usage:
 *   bun run scripts/scan-presentations.ts           # local D1
 *   bun run scripts/scan-presentations.ts --remote  # remote D1
 *
 * Run via npm scripts:
 *   bun run scan          # local
 *   bun run scan:remote   # remote
 */

import { readdirSync, readFileSync, statSync } from "fs";
import { join, relative } from "path";
import { execSync } from "child_process";
import { randomUUID } from "crypto";

const WORKSPACE_ROOT = join(import.meta.dir, "..");
const PRESENTATIONS_DIR = join(WORKSPACE_ROOT, "presentations");
const WRANGLER = join(WORKSPACE_ROOT, "node_modules", ".bin", "wrangler");

const isRemote = process.argv.includes("--remote");

console.log(
  `\n🔍 Scanning presentations/ directory (${isRemote ? "remote" : "local"} D1)...\n`
);

// ── Discover all slides.md files ─────────────────────────────────────────────

function findSlideFiles(dir: string): string[] {
  const results: string[] = [];
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        results.push(...findSlideFiles(fullPath));
      } else if (entry === "slides.md") {
        results.push(fullPath);
      }
    }
  } catch (err) {
    console.error(`Error reading directory ${dir}:`, err);
  }
  return results;
}

function extractTitle(filePath: string): string {
  try {
    const content = readFileSync(filePath, "utf-8");
    const h1Match = content.match(/^#\s+(.+)$/m);
    if (h1Match) {
      return h1Match[1].trim();
    }
    // Fallback: derive from directory name
    const parts = filePath.split("/");
    const topicDir = parts[parts.length - 2];
    return topicDir
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  } catch {
    return "Untitled Presentation";
  }
}

function getCreatedDate(filePath: string): string {
  // Extract date from path pattern: presentations/{year}/{month}/...
  const rel = relative(PRESENTATIONS_DIR, filePath);
  const parts = rel.split("/");
  if (parts.length >= 2) {
    const year = parts[0];
    const month = parts[1].padStart(2, "0");
    return `${year}-${month}-01T00:00:00Z`;
  }
  return new Date().toISOString();
}

// ── Query D1 for existing file paths ─────────────────────────────────────────

function queryD1(sql: string): string {
  const remoteFlag = isRemote ? "--remote" : "--local";
  const cmd = `${WRANGLER} d1 execute slides-db ${remoteFlag} --json --command "${sql.replace(/"/g, '\\"')}"`;
  try {
    return execSync(cmd, { cwd: WORKSPACE_ROOT, encoding: "utf-8" });
  } catch (err) {
    if (err instanceof Error && "stdout" in err) {
      return (err as { stdout: string }).stdout;
    }
    throw err;
  }
}

function getExistingFilePaths(): Set<string> {
  const result = queryD1("SELECT file_path FROM presentations");
  try {
    const parsed = JSON.parse(result);
    const rows: Array<{ file_path: string }> =
      parsed?.[0]?.results ?? parsed?.results ?? [];
    return new Set(rows.map((r) => r.file_path));
  } catch {
    return new Set();
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

const slideFiles = findSlideFiles(PRESENTATIONS_DIR);
console.log(`Found ${slideFiles.length} slide file(s)\n`);

if (slideFiles.length === 0) {
  console.log("No slide files found. Add slides.md files to presentations/");
  process.exit(0);
}

const existingPaths = getExistingFilePaths();
console.log(`Existing entries in D1: ${existingPaths.size}\n`);

let insertedCount = 0;
let skippedCount = 0;

for (const absolutePath of slideFiles) {
  const filePath = relative(WORKSPACE_ROOT, absolutePath).replace(/\\/g, "/");

  if (existingPaths.has(filePath)) {
    console.log(`  ⏭  Skipped (already in DB): ${filePath}`);
    skippedCount++;
    continue;
  }

  const uuid = randomUUID();
  const title = extractTitle(absolutePath);
  const createdDate = getCreatedDate(absolutePath);

  const sql = `INSERT INTO presentations (uuid, file_path, title, created_date, hashed_password) VALUES ('${uuid}', '${filePath}', '${title.replace(/'/g, "''")}', '${createdDate}', NULL)`;

  try {
    queryD1(sql);
    console.log(`  ✅ Inserted: ${filePath}`);
    console.log(`     UUID:  ${uuid}`);
    console.log(`     Title: ${title}\n`);
    insertedCount++;
  } catch (err) {
    console.error(`  ❌ Failed to insert ${filePath}:`, err);
  }
}

console.log(
  `\n✨ Done — inserted: ${insertedCount}, skipped: ${skippedCount}, total: ${slideFiles.length}`
);
