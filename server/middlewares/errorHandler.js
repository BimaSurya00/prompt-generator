export function errorHandler(err, req, res, _next) {
  const status = err.type === 'entity.too.large' ? 413 : (err.status || 500)
  const message = status === 413 ? 'Request body too large' : (err.expose ? err.message : 'Internal server error')
  if (status >= 500) console.error(`[${req.method} ${req.path}]`, err)
  res.status(status).json({ error: message })
}