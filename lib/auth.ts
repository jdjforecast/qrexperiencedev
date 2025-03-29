/**
 * Sistema centralizado de autenticación y autorización
 *
 * Este archivo sirve como punto de entrada para las funciones de autenticación.
 * Para evitar problemas con `next/headers`, todas las funciones reales se han movido
 * a archivos específicos para cliente (/lib/auth/client.ts) o servidor (/lib/auth/server-api.ts).
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

import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { dataAPI } from './supabase';

/**
 * Hook para obtener la sesión actual del usuario y funciones de autenticación
 */
export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isAuthenticated = status === 'authenticated' && !!session;
  const isLoading = status === 'loading';
  const userId = session?.user?.id;
  const userRole = session?.user?.role || 'user';
  const isAdmin = userRole === 'admin';

  const login = async (email: string, password: string) => {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    
    return result;
  };

  const logout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  // Verificar si el usuario ya tiene un producto específico
  // Usando la función de dataAPI que ya usa Supabase para la BD
  const hasProduct = async (productId: string) => {
    if (!userId) return false;
    return await dataAPI.hasUserProduct(userId, productId);
  };

  return {
    session,
    status,
    isAuthenticated,
    isLoading,
    userId,
    userRole,
    isAdmin,
    login,
    logout,
    hasProduct,
  };
}

/**
 * Función para validar si un usuario puede acceder a un recurso
 * basado en su rol (para usar en server components)
 */
export function canAccess(userRole: string | undefined, requiredRole: string = 'user'): boolean {
  if (!userRole) return false;
  if (requiredRole === 'admin') return userRole === 'admin';
  return true; // Si el rol requerido es user, cualquier usuario autenticado puede acceder
}

