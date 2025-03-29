import { createServerClient as createSupabaseServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Helper to create server client using @supabase/ssr and next/headers
// Make the function async to use await for cookies()
export async function createServerClient(options?: { admin?: boolean }) {
  // Await the promise returned by cookies()
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
          // No need for await here as cookieStore is now resolved
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          // No need for await here as cookieStore is now resolved
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}

