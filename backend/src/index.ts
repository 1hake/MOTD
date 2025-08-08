import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import postRoutes from './routes/posts';
import friendRoutes from './routes/friends';
import deviceRoutes from './routes/devices';
import coverRoutes from './routes/cover';

dotenv.config();
const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/auth', authRoutes);
app.use('/posts', postRoutes);
app.use('/friends', friendRoutes);
app.use('/devices', deviceRoutes);
app.use('/api', coverRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
