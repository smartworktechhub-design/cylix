import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

function qb(): any {
  return new Proxy(() => {}, {
    get: () => qb(),
    apply: () => Promise.resolve({ data: [], error: null, count: 0 }),
  });
}

function createDummyClient(): SupabaseClient {
  const dummy: any = new Proxy({}, {
    get: () => qb(),
  });
  return dummy;
}

export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase env vars missing, using dummy client');
      supabaseInstance = createDummyClient();
    } else {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    }
  }
  return supabaseInstance;
}
