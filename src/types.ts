export interface Env {
  DB: D1Database;
  GITHUB_RAW_BASE: string;
}

export interface Presentation {
  uuid: string;
  file_path: string;
  title: string;
  created_date: string;
  hashed_password: string | null;
}
