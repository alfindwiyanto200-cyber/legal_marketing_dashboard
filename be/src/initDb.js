// Creates the database (if missing) and applies schema.sql.
// Run once with: npm run db:init
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbName = process.env.DB_NAME || 'legal_marketing_dashboard';

async function main() {
  // Connect WITHOUT a database so we can create it. multipleStatements lets us
  // run the whole schema.sql file in one call.
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await connection.query(`USE \`${dbName}\``);

  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await connection.query(sql);

  await connection.end();
  console.log(`✅ Database "${dbName}" is ready (tables created).`);
}

main().catch((err) => {
  console.error('❌ DB init failed:', err.message);
  process.exit(1);
});
