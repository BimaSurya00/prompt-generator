import express from 'express'
import cors from 'cors'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { config } from './config.js'
import apiRoutes from './routes/index.js'
import db from './db/index.js'
import { errorHandler } from './middlewares/errorHandler.js'
import { notFound } from './middlewares/notFound.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export function createApp() {
  const app = express()
  app.set('trust proxy', 'loopback')

  const corsOptions = config.corsOrigin.length
    ? { origin: config.corsOrigin }
    : { origin: false }
  app.use(cors(corsOptions))
  app.use(express.json({ limit: '1mb' }))

  app.get('/api/health', (req, res) => {
    let dbOk = true
    try {
      db.prepare('SELECT 1').get()
    } catch {
      dbOk = false
    }
    res.json({
      status: dbOk ? 'ok' : 'degraded',
      uptime: process.uptime(),
      db: dbOk ? 'ok' : 'error',
    })
  })

  app.use('/api', apiRoutes)

  const distDir = path.join(__dirname, '../dist')
  app.use(express.static(distDir))
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next()
    res.sendFile(path.join(distDir, 'index.html'), err => err && next())
  })

  app.use(notFound)
  app.use(errorHandler)

  return app
}