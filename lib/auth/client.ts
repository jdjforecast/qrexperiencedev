// This file contains ONLY authentication functions intended for CLIENT-SIDE usage.

import { createBrowserClient } from "@/lib/supabase-client"
import type { User } from '@supabase/supabase-js'; // Import User type

/**
 * Inicia sesión de un usuario (Client-Side)
 * @param email Email del usuario
 * @param password Contraseña del usuario
 * @returns Resultado del inicio de sesión
 */
interface SignInResult {
    success: boolean;
    user?: User | null;
    session?: any | null; // Consider using Session type from supabase-js
    message: string;
}
export async function signIn(email: string, password: string): Promise<SignInResult> { 
  try {
    // Use the BROWSER client for signIn as it's typically called from the client
    const supabase = createBrowserClient(); 

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Error al iniciar sesión:", error.message);
      // Provide user-friendly messages
      if (error.message.includes("Invalid login credentials")) {
          return { success: false, message: "Credenciales de inicio de sesión inválidas." };
      }
      return { success: false, message: error.message };
    }

    if (!data.session || !data.user) {
        return { success: false, message: "No se pudo obtener la sesión o el usuario después del inicio de sesión." };
    }

    return {
      success: true,
      user: data.user,
      session: data.session,
      message: "Inicio de sesión exitoso",
    };
  } catch (error) {
    let message = "Error desconocido al iniciar sesión";
    if (error instanceof Error) {
      console.error("Error crítico al iniciar sesión:", error.message);
      message = error.message;
    }
    return { success: false, message };
  }
}

// Add other client-side auth functions here if needed (e.g., maybe a client-side signOut?) 