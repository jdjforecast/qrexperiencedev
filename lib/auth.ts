/**
 * Sistema centralizado de autenticación y autorización
 *
 * Este archivo sirve como punto de entrada para las funciones de autenticación de servidor.
 * Para evitar problemas con `next/headers`, todas las funciones de cliente se han movido
 * a archivos específicos para cliente (/lib/auth/client.ts).
 * 
 * ¡IMPORTANTE! Este archivo re-exporta funciones de servidor. 
 * NO DEBE ser importado en componentes de cliente.
 * Para componentes de cliente, importa de @/lib/auth/client directamente.
 */

// Re-exportar funciones del servidor para mantener compatibilidad
export {
  getUserProfile,
  isUserAdmin,
  createServerClient,
  getCurrentUserFromRequest as getCurrentUser
} from './auth/server-api';

/**
 * Función para validar si un usuario puede acceder a un recurso
 * basado en su rol (para usar en server components)
 */
export function canAccess(userRole: string | undefined, requiredRole: string = 'user'): boolean {
  if (!userRole) return false;
  if (requiredRole === 'admin') return userRole === 'admin';
  return true; // Si el rol requerido es user, cualquier usuario autenticado puede acceder
}

