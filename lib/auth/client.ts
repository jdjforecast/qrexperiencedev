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

/**
 * Cierra la sesión del usuario actual (Client-Side)
 * @returns Resultado del cierre de sesión
 */
interface SignOutResult {
    success: boolean;
    message: string;
}
export async function signOut(): Promise<SignOutResult> { 
  try {
    const supabase = createBrowserClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error de Supabase al cerrar sesión:", error);
      throw new Error(`Error al cerrar sesión: ${error.message}`);
    }

    console.log("Sesión cerrada correctamente.");
    return { success: true, message: "Sesión cerrada correctamente." };

  } catch (error) {
     let message = "Error desconocido al cerrar sesión.";
     if (error instanceof Error) {
         message = error.message;
     }
     console.error("Error en signOut:", error);
     return { success: false, message: message };
  }
}

/**
 * Inicia el proceso de restablecimiento de contraseña (Client-Side)
 * @param email Email del usuario
 * @returns Resultado del envío
 */
interface ResetPasswordResult {
    success: boolean;
    message: string;
}
export async function resetPassword(email: string): Promise<ResetPasswordResult> { 
  try {
    const supabase = createBrowserClient(); 
    const redirectUrl = `${window.location.origin}/auth/update-password`; 
    console.log("Enviando correo de restablecimiento de contraseña a:", email);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    if (error) {
      console.error("Error de Supabase al restablecer contraseña:", error);
      return { success: false, message: "Error al intentar enviar el correo de restablecimiento." };
    }
    console.log("Correo de restablecimiento de contraseña enviado.");
    return { success: true, message: "Si existe una cuenta con ese correo, se ha enviado un enlace para restablecer la contraseña." };
  } catch (error) {
    let message = "Error desconocido al intentar restablecer la contraseña.";
    if (error instanceof Error) {
        message = error.message;
    }
    console.error("Error en resetPassword:", error);
    return { success: false, message: message };
  }
}

/**
 * Actualiza la contraseña del usuario autenticado (Client-Side)
 * @param newPassword Nueva contraseña
 * @returns Resultado de la actualización
 */
interface UpdatePasswordResult {
    success: boolean;
    message: string;
}
export async function updatePassword(newPassword: string): Promise<UpdatePasswordResult> { 
  try {
    const supabase = createBrowserClient();
    console.log("Actualizando contraseña del usuario...");
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) {
      console.error("Error de Supabase al actualizar contraseña:", error);
      throw new Error(`Error al actualizar la contraseña: ${error.message}`);
    }
    if (!data.user) {
        throw new Error("No se pudo actualizar la contraseña (data.user es nulo).");
    }
    console.log("Contraseña actualizada correctamente para:", data.user.email);
    return { success: true, message: "Contraseña actualizada correctamente." };
  } catch (error) {
    let message = "Error desconocido al actualizar la contraseña.";
    if (error instanceof Error) {
        message = error.message;
    }
    console.error("Error en updatePassword:", error);
    return { success: false, message: message };
  }
}

// Add other client-side auth functions here if needed (e.g., maybe a client-side signOut?) 