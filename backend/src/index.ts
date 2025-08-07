
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import postRoutes from './routes/posts';
import friendRoutes from './routes/friends';
import deviceRoutes from './routes/devices';

dotenv.config();
const app = express();

app.use(cors({ origin: true }));
app.use(bodyParser.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/auth', authRoutes);
app.use('/posts', postRoutes);
app.use('/friends', friendRoutes);
app.use('/auth', deviceRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
