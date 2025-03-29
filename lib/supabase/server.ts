import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

/**
 * Esta función crea un cliente Supabase para uso en el servidor, 
 * pero SIN depender de next/headers lo que permite funcionar en 
 * cualquier entorno, incluyendo API routes en pages/ y app/
 */
export async function createServerClient(options?: { admin?: boolean }) {
  // Usar createClient directamente sin depender de next/headers
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = options?.admin 
    ? process.env.SUPABASE_SERVICE_ROLE_KEY! 
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// La función original se mantiene comentada como referencia
// pero no se usa para evitar dependencia de next/headers
/*
import { cookies } from 'next/headers';

export async function createServerClientWithCookies(options?: { admin?: boolean }) {
  const cookieStore = await cookies(); 
  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    options?.admin ? process.env.SUPABASE_SERVICE_ROLE_KEY! : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}
*/

