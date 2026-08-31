export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse({ body: req.body })
    if (!result.success) {
      const first = result.error.issues[0]
      return res.status(400).json({ error: first.message })
    }
    req.body = result.data.body
    next()
  }
}