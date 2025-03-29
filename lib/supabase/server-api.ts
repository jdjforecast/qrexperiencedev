/**
 * Este archivo proporciona herramientas para crear clientes de Supabase
 * para uso en API Routes y otros contextos que no pueden utilizar next/headers.
 */

import { createClient } from '@supabase/supabase-js';

// Tipos para las opciones del cliente
interface ServerClientOptions {
  admin?: boolean;
}

/**
 * Crea un cliente Supabase para uso en API routes o contextos sin next/headers
 * 
 * Esta función NO depende de cookies de solicitud ni de next/headers
 * por lo que funciona en cualquier entorno, incluidas API routes
 * 
 * @param options Opciones para crear el cliente
 * @returns Cliente Supabase configurado
 */
export function createServerClientForApi(options: ServerClientOptions = {}) {
  // Obtener las variables de entorno requeridas
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  // Usar la clave de rol de servicio o la clave anónima según sea necesario
  const supabaseKey = options.admin 
    ? process.env.SUPABASE_SERVICE_ROLE_KEY 
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Variables de entorno de Supabase faltantes');
    throw new Error('Variables de entorno de Supabase faltantes');
  }
  
  // Crear y devolver el cliente Supabase
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
} 