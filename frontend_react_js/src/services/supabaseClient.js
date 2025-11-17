/// PUBLIC_INTERFACE
/**
 * Supabase client factory and safe access utilities.
 * Creates a Supabase client if required env vars are present, else returns null.
 * No secrets are hardcoded; uses REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY.
 */

let cachedClient = null;

/**
 * getSupabaseClient
 * Returns a cached Supabase client if environment variables are present; otherwise null.
 * The Supabase library is dynamically imported to avoid bundling if not needed.
 * @returns {Promise<any|null>} Supabase client instance or null
 */
export async function getSupabaseClient() {
  const url = process.env.REACT_APP_SUPABASE_URL;
  const key = process.env.REACT_APP_SUPABASE_KEY;
  if (!url || !key) return null;

  if (cachedClient) return cachedClient;

  // Dynamic import to keep dependency optional
  const { createClient } = await import('@supabase/supabase-js');
  cachedClient = createClient(url, key);
  return cachedClient;
}
