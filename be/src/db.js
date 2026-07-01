import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Shared connection pool. `database` is intentionally set so all queries target
// the app schema; initDb.js connects without it first to create the DB.
export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'legal_marketing_dashboard',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Return DATE/DATETIME as plain strings (e.g. "2026-07-01") so deadlines don't
  // get shifted by timezone conversion when serialized to JSON.
  dateStrings: true,
});
