/**
 * Sistema centralizado de autenticación y autorización
 *
 * Este archivo sirve como punto de entrada para las funciones de autenticación.
 * Para evitar problemas con `next/headers`, todas las funciones reales se han movido
 * a archivos específicos para cliente (/lib/auth/client.ts) o servidor (/lib/auth/server.ts).
 * 
 * ¡IMPORTANTE! Este archivo re-exporta funciones de servidor. 
 * NO DEBE ser importado en componentes de cliente.
 * Para componentes de cliente, importa de @/lib/auth/client directamente.
 */

// Re-exportar funciones del servidor para mantener compatibilidad
export {
  getCurrentUser,
  getUserProfile,
  isUserAdmin,
  createServerClient,
  registerUser
} from './auth/server';

