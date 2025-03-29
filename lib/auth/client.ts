'use client';

/**
 * Cliente de autenticación - funciones específicas para componentes cliente
 * 
 * Este archivo contiene funciones y hooks relacionados con la autenticación
 * que solo pueden usarse en componentes cliente.
 */

import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { dataAPI } from '../supabase';

// Re-export nextAuth functions directly for compatibility
export const signIn = nextAuthSignIn;
export const signOut = nextAuthSignOut;

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
    const result = await nextAuthSignIn('credentials', {
      email,
      password,
      redirect: false,
    });
    
    return result;
  };

  const logout = async () => {
    await nextAuthSignOut({ redirect: false });
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
 * basado en su rol (para usar en client components)
 */
export function canAccess(userRole: string | undefined, requiredRole: string = 'user'): boolean {
  if (!userRole) return false;
  if (requiredRole === 'admin') return userRole === 'admin';
  return true; // Si el rol requerido es user, cualquier usuario autenticado puede acceder
}

/**
 * Registra un nuevo usuario usando NextAuth
 * Adaptado para mantener compatibilidad con el código existente
 */
interface RegisterResult {
  success: boolean;
  error?: string;
  user?: any;
  message?: string;
}

export async function registerUser(
  email: string, 
  password: string, 
  fullName: string,
  companyName: string = ""
): Promise<RegisterResult> {
  try {
    // Usar NextAuth para registrar usuario
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        name: fullName,
        company: companyName
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Error al registrar usuario',
        message: data.error || 'Error al registrar usuario'
      };
    }
    
    // Si el registro fue exitoso, iniciar sesión automáticamente
    await nextAuthSignIn('credentials', {
      email,
      password,
      redirect: false,
    });
    
    return {
      success: true,
      user: data.user,
      message: 'Usuario registrado correctamente'
    };
  } catch (error) {
    console.error('Error en registro:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return {
      success: false,
      error: errorMessage,
      message: errorMessage
    };
  }
} 