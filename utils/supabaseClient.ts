/**
 * Este archivo sirve como un puente para mantener compatibilidad con código que importa desde '@v0/utils/supabaseClient'
 * Redirige todas las importaciones al cliente de Supabase oficial de la aplicación
 */

import {
  createBrowserClient,
  createServerClient,
  executeWithTimeout,
  executeWithRetry,
  clearSupabaseClient,
  supabase,
} from "@/lib/supabase-client"

// Exportar todas las funciones y variables del cliente oficial
export { createBrowserClient, createServerClient, executeWithTimeout, executeWithRetry, clearSupabaseClient, supabase }

// Alias para mantener compatibilidad con código existente
export const getSupabaseClient = createServerClient
export const getBrowserClient = createBrowserClient

// Exportación por defecto para importaciones como: import supabaseClient from '@v0/utils/supabaseClient'
export default supabase

