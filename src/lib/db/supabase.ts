import { createClient } from '@supabase/supabase-js';

const supabaseUrl = typeof window !== 'undefined'
  ? process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  : process.env.NEXT_PUBLIC_SUPABASE_URL || '';

const supabaseAnonKey = typeof window !== 'undefined'
  ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if credentials exist
export const hasSupabaseCredentials = (): boolean => {
  return !!supabaseUrl && !!supabaseAnonKey;
};

// Create client conditionally to avoid crashing on empty strings during build time or initialization
export const supabase = hasSupabaseCredentials()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
