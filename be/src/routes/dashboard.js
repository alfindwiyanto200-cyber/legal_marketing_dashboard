import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

const ID_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];

// GET /api/dashboard — computed finance summary for the overview page.
router.get('/', async (_req, res, next) => {
  try {
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Current-month income / expense.
    const [[monthAgg]] = await pool.query(
      `SELECT
         COALESCE(SUM(CASE WHEN type = 'in'  THEN amount ELSE 0 END), 0) AS pemasukan,
         COALESCE(SUM(CASE WHEN type = 'out' THEN amount ELSE 0 END), 0) AS pengeluaran
       FROM transactions
       WHERE DATE_FORMAT(date, '%Y-%m') = ?`,
      [currentMonthKey]
    );
    const pemasukan = Number(monthAgg.pemasukan);
    const pengeluaran = Number(monthAgg.pengeluaran);

    // Outstanding receivables across all projects.
    const [[piutangAgg]] = await pool.query(
      `SELECT COALESCE(SUM(project_value - payment_amount), 0) AS piutang FROM projects`
    );
    const totalPiutang = Math.max(0, Number(piutangAgg.piutang));

    const monthlyTarget = Number(process.env.MONTHLY_TARGET) || 0;
    const targetPct = monthlyTarget > 0 ? Math.round((pemasukan / monthlyTarget) * 100) : 0;

    // Per-month income/expense for the last 5 months, normalized to bar heights (%).
    const [monthRows] = await pool.query(
      `SELECT
         DATE_FORMAT(date, '%Y-%m') AS ym,
         SUM(CASE WHEN type = 'in'  THEN amount ELSE 0 END) AS income,
         SUM(CASE WHEN type = 'out' THEN amount ELSE 0 END) AS spend
       FROM transactions
       GROUP BY ym`
    );
    const byMonth = new Map(monthRows.map((r) => [r.ym, r]));

    const buckets = [];
    for (let i = 4; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const row = byMonth.get(ym);
      buckets.push({
        label: ID_MONTHS[d.getMonth()],
        income: row ? Number(row.income) : 0,
        spend: row ? Number(row.spend) : 0,
      });
    }
    const maxVal = Math.max(1, ...buckets.map((b) => Math.max(b.income, b.spend)));
    const monthlyBars = buckets.map((b) => ({
      label: b.label,
      incomePct: Math.round((b.income / maxVal) * 100),
      spendPct: Math.round((b.spend / maxVal) * 100),
    }));

    res.json({
      omset: pemasukan,
      pemasukan,
      pengeluaran,
      totalPiutang,
      targetPct,
      monthlyBars,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
