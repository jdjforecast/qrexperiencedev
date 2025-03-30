import { createClient } from "@supabase/supabase-js"
import type { Database } from "../database.types"

export function createServerClientForApi() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}

export const supabaseServerApi = createServerClientForApi()

export default supabaseServerApi

