import { createClient } from "@supabase/supabase-js"

/**
 * Crea un cliente de Supabase para uso en el navegador
 * @returns Cliente de Supabase
 */
export function createBrowserClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "")
}

// Exportar una instancia del cliente para uso en el navegador
export const supabase = createBrowserClient()

const DEFAULT_TIMEOUT = 5000

export async function executeWithTimeout<T>(
  operation: Promise<T>,
  timeoutMs: number = DEFAULT_TIMEOUT,
  operationName = "Operación de Supabase"
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Timeout al ${operationName} (${timeoutMs}ms)`))
    }, timeoutMs)
  })

  return Promise.race([operation, timeoutPromise])
}

