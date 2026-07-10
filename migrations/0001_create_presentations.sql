-- Migration: Create presentations table
CREATE TABLE IF NOT EXISTS presentations (
  uuid TEXT PRIMARY KEY,
  file_path TEXT NOT NULL,
  title TEXT NOT NULL,
  created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  hashed_password TEXT
);

-- Index for fast lookups by file_path (used by scanner to check existing entries)
CREATE UNIQUE INDEX IF NOT EXISTS idx_presentations_file_path ON presentations(file_path);

-- Seed: sample public presentation
INSERT OR IGNORE INTO presentations (uuid, file_path, title, created_date, hashed_password)
VALUES (
  '11111111-1111-4111-a111-111111111111',
  'presentations/2025/01/getting-started/slides.md',
  'Getting Started with Kiro',
  '2025-01-15T00:00:00Z',
  NULL
);

-- Seed: sample password-protected presentation
-- Password is "demo123" hashed with bcrypt (rounds=10)
INSERT OR IGNORE INTO presentations (uuid, file_path, title, created_date, hashed_password)
VALUES (
  '22222222-2222-4222-a222-222222222222',
  'presentations/2025/01/secret-roadmap/slides.md',
  'Secret Roadmap 2025',
  '2025-01-20T00:00:00Z',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
);
