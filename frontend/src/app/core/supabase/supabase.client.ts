import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

let _supabase: SupabaseClient | any = null;

/**
 * Returns a lazily-created Supabase client.
 * The client is only created when running in a browser environment (window defined).
 * On the server we return a lightweight proxy so importing this module doesn't throw.
 */
export function getSupabase(): SupabaseClient | any {
  if (_supabase) return _supabase;

  if (typeof window === 'undefined') {
    // Running on server: return a forgiving stub that is safe to import during SSR.
    // The stub provides the common methods used by the app (auth, from, realtime)
    // and returns resolved promises with empty data so server-side imports won't crash.
    const noopResult = { data: null, error: null };

    const makeQueryStub = () => {
      const handler: any = {
        get(_target: any, prop: string) {
          // chainable methods: select, eq, single, maybeSingle, order, limit, not
          if (prop === 'then') {
            // allow awaiting the stub
            return (resolve: any) => resolve(noopResult);
          }
          return () => makeQueryStub();
        }
      };
      return new Proxy({}, handler);
    };

    const authStub = {
      getSession: async () => ({ data: { session: null } }),
      getUser: async () => ({ data: { user: null }, error: null }),
      onAuthStateChange: (_cb: any) => ({ subscription: null }),
      signUp: async () => ({ data: null, error: null }),
      signInWithPassword: async () => ({ data: null, error: null }),
      signOut: async () => ({ error: null })
    };

    const handler: any = {
      get(_target: any, prop: string) {
        if (prop === 'auth') return authStub;
        if (prop === 'from') return (_table: string) => makeQueryStub();
        // realtime / channels etc -> return no-op objects
        return () => makeQueryStub();
      }
    };

    _supabase = new Proxy({}, handler);
    return _supabase;
  }

  _supabase = createClient(
    environment.supabaseUrl,
    environment.supabaseAnonKey,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        storageKey: `sb-${environment.supabaseUrl.split('//')[1].split('.')[0]}-auth-token`
      },
      realtime: { params: { eventsPerSecond: 2 } }
    }
  );

  return _supabase;
}

// Backwards-compatible export for modules that still import `supabase` directly.
// This will call getSupabase() at import time; on the server this returns a proxy
// so importing won't throw, and in the browser it returns the real client.
export const supabase = getSupabase();