import { createBrowserClient, createServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

// Cliente para componentes del lado del cliente
export function getBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Cliente para componentes del lado del servidor
export function getServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.SUPABASE_SERVICE_ROLE_KEY!, 
    {
      auth: {
        persistSession: false,
      },
    }
  )
}

// Cliente para componentes del lado del servidor con cookies
export function getServerClientWithCookies() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies }
  )
}

// Cliente para operaciones administrativas
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.SUPABASE_SERVICE_ROLE_KEY!, 
    {
      auth: {
        persistSession: false,
      },
    }
  )
}

// Función genérica para obtener el cliente adecuado
export function getSupabaseClient(options?: { admin?: boolean; server?: boolean }) {
  if (typeof window === "undefined") {
    // Servidor
    return options?.admin ? createAdminClient() : getServerClient()
  } else {
    // Cliente
    return getBrowserClient()
  }
}

