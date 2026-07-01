import { Router } from 'express';
import { pool } from '../db.js';
import { getStageTemplate, paymentToStatus } from '../stageTemplates.js';

const router = Router();

// mysql2 usually returns JSON columns already parsed, but guard against a string.
function parseStages(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}

// Map a DB row to the shape the frontend expects (camelCase, like the old Firebase docs).
function toClient(row) {
  return {
    id: row.id,
    picName: row.pic_name,
    picPhone: row.pic_phone,
    companyName: row.company_name,
    businessField: row.business_field,
    service: row.service,
    source: row.source,
    paymentStatus: row.payment_status,
    paymentAmount: Number(row.payment_amount),
    projectValue: Number(row.project_value),
    deadline: row.deadline,
    notes: row.notes,
    stages: parseStages(row.stages),
    status: row.status,
    createdAt: row.created_at,
  };
}

// GET /api/projects — all projects, newest first.
router.get('/', async (_req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM projects ORDER BY created_at DESC');
    res.json(rows.map(toClient));
  } catch (err) {
    next(err);
  }
});

// POST /api/projects — create. Server assigns stages template + initial status.
router.post('/', async (req, res, next) => {
  try {
    const b = req.body;
    if (!b.picName) {
      return res.status(400).json({ error: 'picName is required' });
    }

    const stages = getStageTemplate(b.service);
    const status = paymentToStatus(b.paymentStatus);

    const [result] = await pool.query(
      `INSERT INTO projects
        (pic_name, pic_phone, company_name, business_field, service, source,
         payment_status, payment_amount, project_value, deadline, notes, stages, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        b.picName,
        b.picPhone || null,
        b.companyName || null,
        b.businessField || null,
        b.service || null,
        b.source || null,
        b.paymentStatus || 'unpaid',
        Number(b.paymentAmount) || 0,
        Number(b.projectValue) || 0,
        b.deadline || null,
        b.notes || null,
        JSON.stringify(stages),
        status,
      ]
    );

    const [rows] = await pool.query('SELECT * FROM projects WHERE id = ?', [result.insertId]);
    res.status(201).json(toClient(rows[0]));
  } catch (err) {
    next(err);
  }
});

// PATCH /api/projects/:id/status — kanban drag-drop.
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'status is required' });
    await pool.query('UPDATE projects SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/projects/:id/stages — slider change / add progress step.
router.patch('/:id/stages', async (req, res, next) => {
  try {
    const { stages } = req.body;
    if (!Array.isArray(stages)) return res.status(400).json({ error: 'stages must be an array' });
    await pool.query('UPDATE projects SET stages = ? WHERE id = ?', [
      JSON.stringify(stages),
      req.params.id,
    ]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/projects/:id
router.delete('/:id', async (req, res, next) => {
  try {
    await pool.query('DELETE FROM projects WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
