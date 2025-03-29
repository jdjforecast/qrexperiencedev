import { createClient } from '@supabase/supabase-js'
import { Database } from '../database.types'

export function createClientClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}

export const supabaseClient = createClientClient()

export default supabaseClient 