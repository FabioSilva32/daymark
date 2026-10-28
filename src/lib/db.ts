import path from 'path';
import fs from 'fs';

const DB_DIR = process.env.VERCEL
  ? path.resolve('/tmp', 'data')
  : path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'daymark_collections.json');

function readStore(): Record<string, any> {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {
    // Return empty on parse or permission error
  }
  return {};
}

function writeStore(store: Record<string, any>) {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (e) {
    // Graceful no-op in restricted read-only environments
  }
}

export async function dbGet<T = any>(key: string): Promise<T | undefined> {
  const store = readStore();
  return store[key] as T;
}

export async function getAllCollections(): Promise<Record<string, any>> {
  return readStore();
}

export async function setCollection(key: string, value: any): Promise<void> {
  const store = readStore();
  store[key] = value;
  writeStore(store);
}

export async function setManyCollections(items: Record<string, any>): Promise<void> {
  const store = readStore();
  Object.assign(store, items);
  writeStore(store);
}
