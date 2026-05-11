import mysql from 'mysql2/promise';
import 'dotenv/config';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const conn = await mysql.createConnection({
  host:     process.env.DB_HOST,
  port:     Number(process.env.DB_PORT) || 3306,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  multipleStatements: true,
});

const sql = readFileSync(join(__dirname, '002_create_pedidos_y_link_tickets.sql'), 'utf8');

// Filtrar comentarios y ejecutar sentencia por sentencia
const statements = sql
  .split(';')
  .map(s => s.replace(/--.*$/gm, '').trim())
  .filter(s => s.length > 0);

let ok = 0;
let err = 0;

for (const stmt of statements) {
  try {
    await conn.query(stmt);
    console.log(`✅ OK: ${stmt.split('\n')[0].substring(0, 60)}...`);
    ok++;
  } catch (e) {
    // Ignorar "Duplicate column" — ya existe
    if (e.code === 'ER_DUP_FIELDNAME' || e.message.includes('Duplicate column')) {
      console.log(`⚠️  Ya existe (se omite): ${stmt.split('\n')[0].substring(0, 60)}`);
    } else {
      console.error(`❌ ERROR: ${e.message}`);
      err++;
    }
  }
}

await conn.end();
console.log(`\nMigración terminada — ${ok} OK, ${err} errores`);
process.exit(err > 0 ? 1 : 0);
