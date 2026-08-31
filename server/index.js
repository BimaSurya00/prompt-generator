import { createApp } from './app.js'
import { config } from './config.js'
import db from './db/index.js'
import { runMigrations, cleanupUsageLogs } from './db/migrate.js'

runMigrations()
cleanupUsageLogs()

const app = createApp()

const server = app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`)
})

function shutdown(signal) {
  console.log(`\n${signal} received, shutting down...`)
  server.close(() => {
    db.close()
    process.exit(0)
  })
  setTimeout(() => process.exit(1), 10000).unref()
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))