import { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { pool } from '../db.js';

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Optional proof-of-transaction file upload -> be/uploads/, served at /uploads.
const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', '..', 'uploads'),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });

function toClient(row) {
  return {
    id: row.id,
    date: row.date,
    type: row.type,
    amount: Number(row.amount),
    category: row.category,
    description: row.description,
    proofPath: row.proof_path,
    createdAt: row.created_at,
  };
}

// GET /api/transactions?month=YYYY-MM — optionally filter to a single month.
router.get('/', async (req, res, next) => {
  try {
    const { month } = req.query;
    let sql = 'SELECT * FROM transactions';
    const params = [];
    if (month && /^\d{4}-\d{2}$/.test(month)) {
      sql += " WHERE DATE_FORMAT(date, '%Y-%m') = ?";
      params.push(month);
    }
    sql += ' ORDER BY date ASC, id ASC';
    const [rows] = await pool.query(sql, params);
    res.json(rows.map(toClient));
  } catch (err) {
    next(err);
  }
});

// POST /api/transactions — accepts JSON or multipart (with optional `proof` file).
router.post('/', upload.single('proof'), async (req, res, next) => {
  try {
    const b = req.body;
    if (!b.date || !b.type || b.amount == null) {
      return res.status(400).json({ error: 'date, type and amount are required' });
    }
    const proofPath = req.file ? `/uploads/${req.file.filename}` : null;

    const [result] = await pool.query(
      `INSERT INTO transactions (date, type, amount, category, description, proof_path)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [b.date, b.type, Number(b.amount) || 0, b.category || null, b.description || null, proofPath]
    );

    const [rows] = await pool.query('SELECT * FROM transactions WHERE id = ?', [result.insertId]);
    res.status(201).json(toClient(rows[0]));
  } catch (err) {
    next(err);
  }
});

// DELETE /api/transactions/:id
router.delete('/:id', async (req, res, next) => {
  try {
    await pool.query('DELETE FROM transactions WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
