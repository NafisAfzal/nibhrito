import { readFile, readdir } from 'node:fs/promises';
export async function applyMigrations(db: D1Database) {
  const dir = new URL('../../migrations/', import.meta.url);
  for (const name of (await readdir(dir))
    .filter((n) => n.endsWith('.sql'))
    .sort()) {
    const sql = await readFile(new URL(name, dir), 'utf8');
    // Explicit comment delimiters preserve compound trigger statements intact.
    const statements = sql.includes('-- statement-breakpoint')
      ? sql.split('-- statement-breakpoint')
      : sql.replace(/^--.*$/gm, '').split(';');
    await db.batch(
      statements
        .map((s) => s.replace(/^--.*$/gm, '').trim())
        .filter(Boolean)
        .map((s) => db.prepare(s)),
    );
  }
}
