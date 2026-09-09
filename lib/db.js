import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DB_PATH || './data/qr.db';

// Aseguramos que exista la carpeta del archivo de base de datos
const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

let db;

function getDb() {
  if (db) return db;

  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS lotes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      prefijo TEXT NOT NULL,
      cantidad INTEGER NOT NULL,
      numero_inicial INTEGER NOT NULL,
      fecha_creacion TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS qrs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo TEXT NOT NULL UNIQUE,
      destino TEXT,
      estado TEXT NOT NULL DEFAULT 'disponible' CHECK (estado IN ('disponible','activo','pausado')),
      lote_id INTEGER,
      fecha_creacion TEXT NOT NULL DEFAULT (datetime('now')),
      fecha_asignacion TEXT,
      FOREIGN KEY (lote_id) REFERENCES lotes(id)
    );

    CREATE INDEX IF NOT EXISTS idx_qrs_codigo ON qrs(codigo);
    CREATE INDEX IF NOT EXISTS idx_qrs_estado ON qrs(estado);

    -- Preparado para analítica futura (no se usa en la v1, tal como se pidió)
    CREATE TABLE IF NOT EXISTS scans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      qr_codigo TEXT NOT NULL,
      destino TEXT,
      fecha TEXT NOT NULL DEFAULT (datetime('now')),
      user_agent TEXT,
      ip TEXT,
      pais TEXT,
      ciudad TEXT
    );
  `);

  return db;
}

export default getDb;
