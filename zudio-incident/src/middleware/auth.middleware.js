const jwt = require('jsonwebtoken')
const pool = require('../db')

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-123'

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

// check if user has admin role — looks up from db each time
// TODO: maybe cache this, hitting db every request isn't great
const verifyAdmin = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT role FROM users WHERE id = $1',
      [req.user.userId]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' })
    }

    if (result.rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' })
    }

    next()
  } catch (err) {
    console.error('verifyAdmin error:', err.message)
    res.status(500).json({ error: 'Authorization check failed' })
  }
}

module.exports = { verifyToken, verifyAdmin }
