import path from 'path';
import fs from 'fs';
import sqlite3 from 'sqlite3';

const DB_DIR = process.env.VERCEL
  ? path.resolve('/tmp', 'data')
  : path.resolve(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'daymark.db');

try {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
} catch (e) {
  console.warn('Could not create DB_DIR:', e);
}

let dbInstance: sqlite3.Database | null = null;
let initPromise: Promise<sqlite3.Database> | null = null;

export function getDatabase(): Promise<sqlite3.Database> {
  if (initPromise) return initPromise;

  initPromise = new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Failed to open SQLite database at', DB_PATH, err);
        reject(err);
      } else {
        console.log('Connected to SQLite Database at', DB_PATH);
      }
    });

    db.serialize(() => {
      db.run('PRAGMA journal_mode = WAL;');
      db.run('PRAGMA synchronous = NORMAL;');
      db.run(
        `CREATE TABLE IF NOT EXISTS daymark_collections (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );`,
        (err) => {
          if (err) {
            console.error('Failed to create daymark_collections table:', err);
            reject(err);
          } else {
            dbInstance = db;
            resolve(db);
          }
        }
      );
    });
  });

  return initPromise;
}

// Async query wrappers
export async function dbGet<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row as T);
    });
  });
}

export async function dbAll<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve((rows || []) as T[]);
    });
  });
}

export async function dbRun(sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> {
  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

// Get all collections as key-value map
export async function getAllCollections(): Promise<Record<string, any>> {
  const rows = await dbAll<{ key: string; value: string }>('SELECT key, value FROM daymark_collections');
  const result: Record<string, any> = {};
  for (const row of rows) {
    try {
      result[row.key] = JSON.parse(row.value);
    } catch {
      result[row.key] = row.value;
    }
  }
  return result;
}

// Set a collection
export async function setCollection(key: string, value: any): Promise<void> {
  const json = typeof value === 'string' ? value : JSON.stringify(value);
  await dbRun(
    `INSERT INTO daymark_collections (key, value, updated_at) 
     VALUES (?, ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    [key, json]
  );
}

// Batch set collections
export async function setManyCollections(items: Record<string, any>): Promise<void> {
  const db = await getDatabase();
  return new Promise<void>((resolve, reject) => {
    db.serialize(() => {
      db.run('BEGIN TRANSACTION;');
      const stmt = db.prepare(`
        INSERT INTO daymark_collections (key, value, updated_at) 
        VALUES (?, ?, datetime('now'))
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
      `);
      for (const [key, value] of Object.entries(items)) {
        if (value !== undefined && value !== null) {
          const json = typeof value === 'string' ? value : JSON.stringify(value);
          stmt.run([key, json]);
        }
      }
      stmt.finalize();
      db.run('COMMIT;', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
}
