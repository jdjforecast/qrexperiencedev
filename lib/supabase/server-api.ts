import { createClient } from '@supabase/supabase-js';

/**
 * Crea un cliente Supabase para uso exclusivo en API Routes y Edge Functions
 * Esta función NO debe utilizarse en Client Components
 * 
 * A diferencia de la versión basada en cookies, esta versión usa las claves de API directamente.
 * Ideal para:
 * - API Routes (/api/*)
 * - Edge Functions
 * - Cualquier contexto donde no tengamos acceso a next/headers
 */
export function createServerClientForApi(options?: { admin?: boolean }) {
  // Asegúrate de que estas variables estén definidas en tu archivo .env.local
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = options?.admin 
    ? process.env.SUPABASE_SERVICE_ROLE_KEY 
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Faltan las variables de entorno SUPABASE_URL o SUPABASE_KEY');
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
} 