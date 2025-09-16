import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth'
import postRoutes from './routes/posts'
import friendRoutes from './routes/friends'
import deviceRoutes from './routes/devices'
import coverRoutes from './routes/cover'
import userRoutes from './routes/users'

dotenv.config()
const app = express()

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  })
)
app.use(express.json())

// Disable ETag generation for API routes to prevent 304 responses
app.use((req, res, next) => {
  if (
    req.path.startsWith('/posts') ||
    req.path.startsWith('/friends') ||
    req.path.startsWith('/users') ||
    req.path.startsWith('/auth')
  ) {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    res.set('Pragma', 'no-cache')
    res.set('Expires', '0')
  }
  next()
})

// Alternative: Disable ETags globally (uncomment if you want to disable for all routes)
// app.disable('etag');

app.get('/health', (_req, res) => res.json({ ok: true }))

app.use('/auth', authRoutes)
app.use('/posts', postRoutes)
app.use('/friends', friendRoutes)
app.use('/devices', deviceRoutes)
app.use('/users', userRoutes)
app.use('/api', coverRoutes)

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`))
