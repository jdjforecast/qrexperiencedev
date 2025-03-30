import { createClient } from '@supabase/supabase-js'
import { Database } from '../database.types'

export function createClientClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  // Ensure keys are present before creating client
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase URL or Anon Key is missing. Check environment variables.");
    // You might want to throw an error or return null depending on desired behavior
    throw new Error("Supabase URL or Anon Key is missing."); 
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  })
}

// Remove the pre-created instance and default export
// export const supabase = createClientClient()
// export default supabase 