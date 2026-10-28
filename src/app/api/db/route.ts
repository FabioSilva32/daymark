import { NextRequest, NextResponse } from 'next/server';
import { getAllCollections, setCollection, setManyCollections, dbGet } from '@/lib/db';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');

    // 1. If Supabase is configured, attempt reading from Cloud first
    if (isSupabaseConfigured && supabase) {
      try {
        if (key) {
          const { data, error } = await supabase
            .from('daymark_sync_store')
            .select('key, value')
            .eq('key', key)
            .single();

          if (!error && data) {
            return NextResponse.json({
              found: true,
              source: 'Supabase Cloud',
              data: data.value,
            });
          }
        } else {
          const { data, error } = await supabase
            .from('daymark_sync_store')
            .select('key, value');

          if (!error && data && data.length > 0) {
            const cloudCollections: Record<string, any> = {};
            for (const item of data) {
              cloudCollections[item.key] = item.value;
            }
            return NextResponse.json({
              success: true,
              database: 'Supabase Cloud (PostgreSQL)',
              collectionsCount: Object.keys(cloudCollections).length,
              data: cloudCollections,
            });
          }
        }
      } catch (cloudErr) {
        console.warn('Supabase read fallback to SQLite:', cloudErr);
      }
    }

    // 2. Fallback to Local SQLite
    if (key) {
      const row = await dbGet<{ key: string; value: string }>(
        'SELECT key, value FROM daymark_collections WHERE key = ?',
        [key]
      );
      if (!row) {
        return NextResponse.json({ found: false, data: null });
      }
      return NextResponse.json({
        found: true,
        source: 'SQLite Local',
        data: JSON.parse(row.value),
      });
    }

    const allData = await getAllCollections();
    return NextResponse.json({
      success: true,
      database: isSupabaseConfigured ? 'Supabase (Awaiting Table Creation) / SQLite' : 'SQLite Local',
      collectionsCount: Object.keys(allData).length,
      data: allData,
    });
  } catch (error: any) {
    console.error('Database GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Database error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Always update local SQLite for instant resilience
    if (body.items && typeof body.items === 'object') {
      await setManyCollections(body.items);
    } else if (body.key && body.value !== undefined) {
      await setCollection(body.key, body.value);
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid payload: provide { key, value } or { items }' },
        { status: 400 }
      );
    }

    // 2. If Supabase is configured, sync directly to Cloud table
    let cloudSynced = false;
    let cloudError = null;
    if (isSupabaseConfigured && supabase) {
      try {
        if (body.items && typeof body.items === 'object') {
          const rows = Object.entries(body.items).map(([k, v]) => ({
            key: k,
            value: v,
            updated_at: new Date().toISOString(),
          }));
          const { error } = await supabase
            .from('daymark_sync_store')
            .upsert(rows, { onConflict: 'key' });
          if (!error) cloudSynced = true;
          else cloudError = error.message;
        } else if (body.key && body.value !== undefined) {
          const { error } = await supabase
            .from('daymark_sync_store')
            .upsert(
              {
                key: body.key,
                value: body.value,
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'key' }
            );
          if (!error) cloudSynced = true;
          else cloudError = error.message;
        }
      } catch (err: any) {
        cloudError = err.message;
      }
    }

    return NextResponse.json({
      success: true,
      database: cloudSynced ? 'Supabase Cloud (PostgreSQL)' : 'SQLite Local Cache',
      cloudSynced,
      cloudError,
    });
  } catch (error: any) {
    console.error('Database POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Database error' },
      { status: 500 }
    );
  }
}

