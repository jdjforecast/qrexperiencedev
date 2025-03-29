/**
 * Sistema centralizado de autenticación y autorización
 *
 * Este archivo contiene todas las funciones relacionadas con la autenticación,
 * autorización y gestión de perfiles de usuario.
 */
import { createBrowserClient } from "@/lib/supabase-client"
import type { User } from '@supabase/supabase-js'; // Import User type
import { createServerClient as createServerClientFromLib } from '@/lib/supabase/server'; 

// Define a type for the profile data
interface ProfileData {
    id: string;
    role: 'customer' | 'admin' | string; // Allow other roles potentially
    full_name?: string;
    company_name?: string;
    // Add other potential profile fields here
    [key: string]: any; // Allow for other dynamic properties if needed, cautiously
}

/**
 * Obtiene el usuario actual desde el servidor
 * @returns El usuario actual o null si no hay sesión
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = await createServerClientFromLib();
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error("Error al obtener la sesión:", error.message);
      return null;
    }

    if (!data.session) {
      return null;
    }

    return data.session.user;
  } catch (error) {
    // Handle unknown error type
    if (error instanceof Error) {
      console.error("Error al obtener el usuario actual:", error.message);
    } else {
      console.error("Error desconocido al obtener el usuario actual:", error);
    }
    return null;
  }
}

/**
 * Obtiene el perfil de un usuario
 * @param userId ID del usuario
 * @returns Perfil del usuario o null si no existe
 */
export async function getUserProfile(userId: string): Promise<ProfileData | null> {
  let profileToReturn: ProfileData | null = null; // Initialize return value
  try {
    if (!userId) {
      console.warn("getUserProfile: No se proporcionó userId");
      return null;
    }

    // Use the server client with admin privileges
    const supabase = await createServerClientFromLib({ admin: true });

    // Check if the profile exists first
    const { data: existingProfile, error: checkError } = await supabase
      .from("profiles")
      .select("id, role, full_name, company_name") // Select specific known columns
      .eq("id", userId)
      .maybeSingle(); // Use maybeSingle to avoid error if not found

    if (checkError) {
        console.error("Error al verificar/obtener el perfil existente:", checkError.message);
        // Consider if returning a default profile is appropriate or if null/error is better
        // Returning null for now to indicate failure
        return null;
    }

    if (existingProfile) {
        console.log(`Perfil encontrado para el usuario ${userId}`);
        profileToReturn = existingProfile as ProfileData; // Cast to known type
    } else {
      // Profile doesn't exist, create a new one
      console.log(`Perfil no encontrado para el usuario ${userId}, creando uno nuevo...`);
      const defaultRole = 'customer';
      const { data: newProfile, error: insertError } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          role: defaultRole,
          // Initialize other fields if necessary/possible
        })
        .select("id, role, full_name, company_name") // Select known columns after insert
        .single(); // Should exist now

      if (insertError) {
        console.error("Error al crear el perfil del usuario:", insertError.message);
        // Decide handling: return null, default, or throw? Returning null.
        return null;
      }

      if (newProfile) {
          profileToReturn = newProfile as ProfileData;
      } else {
          // Should not happen if insert succeeded without error, but handle defensively
          console.error(`Error inesperado: no se pudo obtener el perfil ${userId} después de la inserción.`);
          return null;
      }
    }

    return profileToReturn;

  } catch (error) {
    // Handle unknown error type
    if (error instanceof Error) {
      console.error(`Error en getUserProfile para ${userId}:`, error.message);
    } else {
      console.error(`Error desconocido en getUserProfile para ${userId}:`, error);
    }
    // Decide handling: return null, default, or throw? Returning null.
    return null;
  }
}

/**
 * Verifica si un usuario es administrador
 * @param userId ID del usuario
 * @returns true si el usuario es administrador, false en caso contrario
 */
export async function isUserAdmin(userId: string | undefined | null): Promise<boolean> { // Added return type
  try {
    if (!userId) return false;

    // Note: This still relies on getUserProfile which might hit the DB.
    // Consider using context data if available client-side.
    const profile = await getUserProfile(userId);
    return profile?.role === "admin";
  } catch (error) {
    // Handle unknown error type
    if (error instanceof Error) {
      console.error("Error al verificar si el usuario es administrador:", error.message);
    } else {
      console.error("Error desconocido al verificar si el usuario es administrador:", error);
    }
    return false;
  }
}

/**
 * Registra un nuevo usuario
 * @param email Email del usuario
 * @param password Contraseña del usuario
 * @param fullName Nombre completo del usuario
 * @param companyName Nombre de la empresa (opcional)
 * @returns Resultado del registro
 */
interface RegisterResult {
  success: boolean;
  user?: User | null;
  message: string;
}
export async function registerUser(
  email: string,
  password: string,
  fullName: string,
  companyName: string = ""
): Promise<RegisterResult> { // Added return type
  try {
    const supabase = await createServerClientFromLib();

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_VERCEL_URL || "http://localhost:3000"; // Default to localhost for dev

    const redirectUrl = `${appUrl}/auth/callback`;
    console.log(`URL de redirección para activación: ${redirectUrl}`);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        // Add user metadata if needed (careful with sensitive data)
        // data: { full_name: fullName, company_name: companyName }
      },
    });

    if (authError) {
      // Provide more specific error messages if possible
      if (authError.message.includes('User already registered')) {
          return { success: false, message: "Este correo electrónico ya está registrado." };
      }
      // Add more specific checks if needed
      console.error("Error de Supabase al registrar:", authError);
      throw new Error(`Error al registrar el usuario: ${authError.message}`);
    }

    if (!authData.user) {
        // This case might indicate email confirmation is pending or another issue
        if (authData.session === null && !authData.user) {
             console.log("Registro iniciado, esperando confirmación por correo electrónico.");
             return {
                 success: true, // Technically succeeded in initiating signup
                 user: null, // No user object yet until confirmed
                 message: "Usuario registrado. Por favor, verifica tu correo electrónico para activar tu cuenta."
             };
        }
      throw new Error("No se pudo crear el usuario (authData.user es nulo)");
    }

    // Profile creation is often better handled by a DB trigger on auth.users insert
    // or by getUserProfile ensuring creation.
    // Attempting profile creation here can be complex due to potential timing issues
    // with email confirmation. Let's rely on getUserProfile to create it on first access.

    console.log(`Usuario ${authData.user.email} registrado. ID: ${authData.user.id}`);

     // Consider sending the full user object if available and needed client-side,
     // but often just success message is enough post-signup initiation.
    return {
      success: true,
      user: authData.user, // Return the user object if available (might be null if confirmation needed)
      message: "Usuario registrado correctamente. Por favor, verifica tu correo electrónico para activar tu cuenta.",
    };
  } catch (error) {
    let message = "Error desconocido al registrar el usuario";
    if (error instanceof Error) {
        message = error.message; // Use the specific error message
    }
    console.error("Error en registerUser:", error);
    return {
      success: false,
      message: message,
    };
  }
}

