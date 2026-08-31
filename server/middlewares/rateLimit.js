import rateLimit from 'express-rate-limit'

export function createLlmRateLimit() {
  return rateLimit({
    windowMs: 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later' },
  })
}