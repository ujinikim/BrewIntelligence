import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  const { data, error } = await supabase
    .from('insights_cache')
    .select('data')
    .eq('key', 'dashboard_stats')
    .single();

  if (error || !data) {
    return NextResponse.json({ lastUpdated: null });
  }

  const stats = typeof data.data === 'string' ? JSON.parse(data.data) : data.data;
  return NextResponse.json({ lastUpdated: stats.last_updated || null });
}
