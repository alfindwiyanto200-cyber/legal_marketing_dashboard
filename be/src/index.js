import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

import authRouter from './routes/auth.js';
import projectsRouter from './routes/projects.js';
import transactionsRouter from './routes/transactions.js';
import dashboardRouter from './routes/dashboard.js';
import { requireAuth } from './middleware/auth.js';

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET is not set. Copy .env.example to .env and set it.');
  process.exit(1);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

// Serve uploaded transaction proofs.
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Throttle auth endpoints to slow down brute-force / credential stuffing.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts, please try again later' },
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Public auth routes.
app.use('/api/auth', authLimiter, authRouter);

// Everything below requires a valid token.
app.use('/api/projects', requireAuth, projectsRouter);
app.use('/api/transactions', requireAuth, transactionsRouter);
app.use('/api/dashboard', requireAuth, dashboardRouter);

// Central error handler.
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`🚀 API listening on http://localhost:${PORT}`);
});
