"use client";

import { createBrowserClient } from "@supabase/ssr";

// Cliente para componentes del lado del cliente
export function getBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Cliente para operaciones administrativas en el cliente
export function getAdminClientBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
      },
    }
  );
}

// Función genérica para obtener el cliente adecuado en el navegador
export function getSupabaseBrowserClient(options?: { admin?: boolean }) {
  return options?.admin ? getAdminClientBrowser() : getBrowserClient();
} 