import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from './database.types'

// Variable to hold the singleton instance
let supabaseInstance: SupabaseClient<Database> | null = null;

function createBrowserClientInternal(): SupabaseClient<Database> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  // Throw an error if environment variables are missing, which is better for debugging
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase URL or Anon Key in environment variables.");
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  })
}

/**
 * Gets the singleton instance of the Supabase browser client.
 * Creates the instance if it doesn't exist yet.
 * @returns {SupabaseClient<Database>} The Supabase client instance.
 */
export function getBrowserClient(): SupabaseClient<Database> {
  if (!supabaseInstance) {
    supabaseInstance = createBrowserClientInternal();
  }
  return supabaseInstance;
} 