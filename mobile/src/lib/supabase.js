const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

let cachedClient = null;

export async function getSupabaseClient() {
  if (!isSupabaseConfigured) return null;
  if (cachedClient) return cachedClient;
  const { createClient } = await import("@supabase/supabase-js");
  cachedClient = createClient(supabaseUrl, supabaseAnonKey);
  return cachedClient;
}

