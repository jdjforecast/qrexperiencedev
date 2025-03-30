import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

// Cliente para componentes del lado del cliente
let browserClient: ReturnType<typeof createClientComponentClient> | null = null

export function getBrowserClient() {
  if (!browserClient) {
    browserClient = createClientComponentClient()
  }
  return browserClient
}

// Cliente para componentes del lado del servidor
export function createServerClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      persistSession: false,
    },
  })
}

// Cliente para componentes del lado del servidor con cookies
export function createServerComponentClient() {
  const cookieStore = cookies()
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
    },
  })
}

// Cliente para operaciones administrativas
export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      persistSession: false,
    },
  })
}

// Función genérica para obtener el cliente adecuado
export function getSupabaseClient(options?: { admin?: boolean; server?: boolean }) {
  if (typeof window === "undefined") {
    // Servidor
    return options?.admin ? createAdminClient() : createServerClient()
  } else {
    // Cliente
    return getBrowserClient()
  }
}

