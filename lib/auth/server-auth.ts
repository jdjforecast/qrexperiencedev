import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const ADMIN_CREDENTIALS = {
  email: "jdjfc@hotmail.com",
  password: "_Pjanno 12"
};

// Crear una instancia única del cliente de Supabase
let supabaseClient: ReturnType<typeof createServerClient> | null = null;

export function getServerClient() {
  if (!supabaseClient) {
    const cookieStore = cookies();
    supabaseClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
          set(name, value, options) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name, options) {
            cookieStore.delete({ name, ...options });
          },
        },
      }
    );
  }
  return supabaseClient;
}

export async function isAdminUser(email: string, password: string) {
  return email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password;
}

export async function requireAdmin() {
  const cookieStore = cookies();
  const adminSession = cookieStore.get('admin-session');
  
  if (!adminSession?.value || !adminSession.value.includes(ADMIN_CREDENTIALS.email)) {
    throw new Error('Unauthorized');
  }
} 