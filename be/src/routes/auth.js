import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const USERNAME_RE = /^[a-zA-Z0-9_.-]{3,50}$/;

function signToken(user) {
  return jwt.sign({ sub: user.id, username: user.username }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function validateCredentials(username, password) {
  if (typeof username !== 'string' || !USERNAME_RE.test(username)) {
    return 'Username must be 3-50 chars (letters, numbers, . _ -)';
  }
  if (typeof password !== 'string' || password.length < 6) {
    return 'Password must be at least 6 characters';
  }
  return null;
}

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    const error = validateCredentials(username, password);
    if (error) return res.status(400).json({ error });

    const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    const rounds = Number(process.env.BCRYPT_ROUNDS) || 12;
    const hash = await bcrypt.hash(password, rounds);

    const [result] = await pool.query(
      'INSERT INTO users (username, password_hash) VALUES (?, ?)',
      [username, hash]
    );

    const user = { id: result.insertId, username };
    res.status(201).json({ token: signToken(user), user });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    const record = rows[0];

    // Always compare against a hash to reduce user-enumeration timing differences,
    // then return a single generic error whether the user or password is wrong.
    const hash = record ? record.password_hash : '$2a$12$0000000000000000000000000000000000000000000000000000';
    const ok = await bcrypt.compare(password, hash);

    if (!record || !ok) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = { id: record.id, username: record.username };
    res.json({ token: signToken(user), user });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me — current user (requires a valid token).
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
