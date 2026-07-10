/**
 * bcrypt-compatible password hashing using the Web Crypto API.
 *
 * We use a PBKDF2-based approach in the Worker (no native bcrypt in edge
 * runtime), but the scanner script uses bcryptjs on Node/Bun to store hashes.
 *
 * To keep the Worker lightweight we verify passwords by re-hashing with the
 * same salt extracted from the stored bcrypt hash via a pure-JS bcrypt impl
 * bundled at build time. Wrangler bundles bcryptjs via nodejs_compat.
 */

// bcryptjs is bundled by Wrangler when nodejs_compat is enabled.
// Using a dynamic import so TypeScript doesn't complain about the module
// resolution in the workers-types context.
export async function verifyPassword(
  plaintext: string,
  storedHash: string
): Promise<boolean> {
  // Dynamically import bcryptjs — bundled by Wrangler via nodejs_compat
  const bcrypt = await import("bcryptjs");
  return bcrypt.compare(plaintext, storedHash);
}

export async function hashPassword(plaintext: string): Promise<string> {
  const bcrypt = await import("bcryptjs");
  return bcrypt.hash(plaintext, 10);
}
