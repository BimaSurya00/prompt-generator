import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import db from './index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export function runMigrations() {
  const drizzleDb = drizzle(db)
  migrate(drizzleDb, { migrationsFolder: path.join(__dirname, 'migrations') })
}

export function cleanupUsageLogs(retentionDays = 30) {
  db.prepare("DELETE FROM usage_logs WHERE created_at < datetime('now', ?)").run(`-${retentionDays} days`)
}