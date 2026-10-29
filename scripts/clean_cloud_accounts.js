const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function cleanAccounts() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    console.log('No .env.local found');
    return;
  }

  const env = fs.readFileSync(envPath, 'utf8');
  const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
  const keyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

  if (!urlMatch || !keyMatch) {
    console.log('Supabase credentials not found in .env.local');
    return;
  }

  const supabaseUrl = urlMatch[1].trim();
  const supabaseKey = keyMatch[1].trim();
  const sb = createClient(supabaseUrl, supabaseKey);

  console.log('Connecting to Supabase...');
  const { data, error } = await sb.from('daymark_sync_store').select('key');
  if (error) {
    console.error('Supabase query error:', error.message);
    return;
  }

  const keysToDelete = [];
  for (const item of (data || [])) {
    // Delete any key ending in _usr_* or containing user accounts/session
    if (
      item.key.includes('_usr_') ||
      item.key === 'daymark_user_accounts' ||
      item.key === 'daymark_active_user_id' ||
      item.key === 'daymark_auth_session' ||
      item.key === 'daymark_settings'
    ) {
      keysToDelete.push(item.key);
    }
  }

  console.log('Deleting user keys from Supabase:', keysToDelete);
  for (const k of keysToDelete) {
    await sb.from('daymark_sync_store').delete().eq('key', k);
  }

  // Also reset daymark_user_accounts to an empty array []
  await sb.from('daymark_sync_store').upsert({
    key: 'daymark_user_accounts',
    value: [],
    updated_at: new Date().toISOString(),
  }, { onConflict: 'key' });

  console.log('✅ Supabase cleaned! All existing accounts wiped to start 100% fresh.');
}

cleanAccounts().catch(console.error);
