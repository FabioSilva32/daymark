// Script to upload all existing local SQLite data into Supabase Cloud
const { createClient } = require('@supabase/supabase-js');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const supabaseUrl = 'https://kntyzhoqnsshtbeqtzfo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtudHl6aG9xbnNzaHRiZXF0emZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxMzc3MzcsImV4cCI6MjEwODcxMzczN30.HrVqPm0ZXC56iciksnm8HIctgc_AgsAaOSKf0LaT7zA';

const supabase = createClient(supabaseUrl, supabaseKey);
const dbPath = path.resolve(__dirname, '../data/daymark.db');
const db = new sqlite3.Database(dbPath);

async function syncAll() {
  console.log('Reading local SQLite collections...');
  db.all('SELECT key, value FROM daymark_collections', async (err, rows) => {
    if (err) {
      console.error('Error reading SQLite:', err);
      process.exit(1);
    }

    if (!rows || rows.length === 0) {
      console.log('No rows in SQLite yet.');
      process.exit(0);
    }

    console.log(`Found ${rows.length} collections. Uploading to Supabase...`);
    const payload = rows.map((r) => ({
      key: r.key,
      value: JSON.parse(r.value),
      updated_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from('daymark_sync_store')
      .upsert(payload, { onConflict: 'key' });

    db.close();

    if (error) {
      console.error('Supabase upload error:', error);
      return;
    }

    console.log(`Successfully uploaded ${rows.length} collections to Supabase Cloud!`);
  });
}

syncAll();

