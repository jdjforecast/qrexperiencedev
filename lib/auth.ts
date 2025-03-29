/**
 * Sistema centralizado de autenticación y autorización
 *
 * Este archivo contiene todas las funciones relacionadas con la autenticación,
 * autorización y gestión de perfiles de usuario.
 */

import { createServerClient, createBrowserClient } from "@/lib/supabase-client"

/**
 * Obtiene el usuario actual desde el servidor
 * @returns El usuario actual o null si no hay sesión
 */
export async function getCurrentUser() {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.error("Error al obtener la sesión:", error.message)
      return null
    }

    if (!data.session) {
      // No hay sesión activa, pero no es un error
      return null
    }

    return data.session.user
  } catch (error) {
    console.error("Error al obtener el usuario actual:", error)
    return null
  }
}

/**
 * Obtiene el perfil de un usuario
 * @param userId ID del usuario
 * @returns Perfil del usuario o null si no existe
 */
export async function getUserProfile(userId) {
  try {
    if (!userId) {
      console.warn("getUserProfile: No se proporcionó userId")
      return null
    }

    // Usar el cliente del servidor con la opción de service_role para evitar restricciones RLS
    const supabase = createServerClient({ admin: true })

    // Verificar si el perfil existe
    const { data: profileExists, error: checkError } = await supabase.from("profiles").select("id").eq("id", userId)

    if (checkError) {
      console.error("Error al verificar si existe el perfil:", checkError.message)
      return null
    }

    // Si el perfil no existe, crearlo
    if (!profileExists || profileExists.length === 0) {
      console.log(`Perfil no encontrado para el usuario ${userId}, creando uno nuevo...`)

      const { error: insertError } = await supabase.from("profiles").insert({
        id: userId,
        role: "customer", // Rol predeterminado
      })

      if (insertError) {
        console.error("Error al crear el perfil del usuario:", insertError.message)
        // Devolver un perfil básico en lugar de null
        return {
          id: userId,
          role: "customer",
        }
      }
    }

    // Ahora obtenemos el perfil (que debería existir)
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle() // Usar maybeSingle en lugar de single para evitar errores

    if (error) {
      console.error("Error al obtener el perfil del usuario:", error.message)
      // Devolver un perfil básico en lugar de null
      return {
        id: userId,
        role: "customer",
      }
    }

    // Si no se encontró el perfil (aunque debería existir ahora), devolver un perfil básico
    if (!data) {
      console.warn(`No se pudo obtener el perfil para el usuario ${userId} después de intentar crearlo`)
      return {
        id: userId,
        role: "customer",
      }
    }

    return data
  } catch (error) {
    console.error("Error al obtener el perfil del usuario:", error)
    // Devolver un perfil básico en lugar de null
    return {
      id: userId,
      role: "customer",
    }
  }
}

/**
 * Verifica si un usuario es administrador
 * @param userId ID del usuario
 * @returns true si el usuario es administrador, false en caso contrario
 */
export async function isUserAdmin(userId) {
  try {
    if (!userId) return false

    const profile = await getUserProfile(userId)
    return profile?.role === "admin"
  } catch (error) {
    console.error("Error al verificar si el usuario es administrador:", error)
    return false
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
export async function registerUser(email, password, fullName, companyName = "") {
  try {
    const supabase = createServerClient()

    // Obtener la URL base de la aplicación desde variables de entorno
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_VERCEL_URL || "https://tu-dominio.com"

    // Asegurarse de que la URL no sea localhost en producción
    const redirectUrl =
      appUrl.includes("localhost") && process.env.NODE_ENV === "production"
        ? "https://tu-dominio.com/auth/callback"
        : `${appUrl}/auth/callback`

    console.log(`URL de redirección para activación: ${redirectUrl}`)

    // Registrar el usuario en Auth con la URL de redirección correcta
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    })

    if (authError) {
      throw new Error(`Error al registrar el usuario: ${authError.message}`)
    }

    if (!authData.user) {
      throw new Error("No se pudo crear el usuario")
    }

    // Verificar qué columnas existen en la tabla profiles
    const { data: tableInfo, error: tableError } = await supabase.from("profiles").select("*").limit(1)

    if (tableError) {
      console.error("Error al verificar la estructura de la tabla profiles:", tableError.message)
      // Continuar con la inserción básica
    }

    // Preparar los datos del perfil basados en las columnas existentes
    const profileData = {
      id: authData.user.id,
      role: "customer", // Por defecto, todos los usuarios nuevos son clientes
    }

    // Añadir full_name si la columna existe
    if (tableInfo && Object.keys(tableInfo[0] || {}).includes("full_name")) {
      profileData["full_name"] = fullName
    }

    // Crear el perfil del usuario
    const { error: profileError } = await supabase.from("profiles").insert(profileData)

    if (profileError) {
      console.error("Error al crear el perfil del usuario:", profileError.message)
      // No lanzamos error aquí para no bloquear el registro si falla la creación del perfil
    }

    return {
      success: true,
      user: authData.user,
      message: "Usuario registrado correctamente. Por favor, verifica tu correo electrónico para activar tu cuenta.",
    }
  } catch (error) {
    console.error("Error en registerUser:", error)
    return {
      success: false,
      message: error.message || "Error al registrar el usuario",
    }
  }
}

/**
 * Inicia sesión con email y contraseña
 * @param email Email del usuario
 * @param password Contraseña del usuario
 * @returns Resultado del inicio de sesión
 */
export async function signIn(email, password) {
  try {
    // Usar el cliente del navegador para iniciar sesión
    const supabase = createBrowserClient()

    console.log("Iniciando sesión con Supabase...")
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Error de Supabase al iniciar sesión:", error)
      throw new Error(`Error al iniciar sesión: ${error.message}`)
    }

    console.log("Sesión establecida correctamente:", data.session?.user?.email)

    // Verificar que la sesión se haya establecido
    const { data: sessionCheck } = await supabase.auth.getSession()
    console.log("Verificación de sesión:", sessionCheck.session ? "Activa" : "No activa")

    // Verificar si el usuario tiene un perfil, y si no, crearlo
    // Nota: Esta parte se ejecuta en el cliente, por lo que no podemos usar createServerClient con admin: true
    // En su lugar, confiamos en que las políticas RLS permitan esta operación o manejamos el error
    if (data.user) {
      try {
        // Verificar si el perfil existe
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", data.user.id)

        if (profileError) {
          console.error("Error al verificar el perfil:", profileError)
        } else if (!profileData || profileData.length === 0) {
          console.log("Creando perfil para el usuario recién autenticado...")
          const { error: insertError } = await supabase.from("profiles").insert({
            id: data.user.id,
            role: "customer", // Rol predeterminado
          })

          if (insertError) {
            console.error("Error al crear el perfil:", insertError)
            console.log("Nota: El perfil se creará automáticamente en el servidor cuando sea necesario")
          } else {
            console.log("Perfil creado exitosamente")
          }
        } else {
          console.log("El perfil ya existe para este usuario")
        }
      } catch (profileCheckError) {
        console.error("Error al verificar/crear el perfil:", profileCheckError)
      }
    }

    return {
      success: true,
      user: data.user,
      session: data.session,
      message: "Sesión iniciada correctamente",
    }
  } catch (error) {
    console.error("Error en signIn:", error)
    return {
      success: false,
      message: error.message || "Error al iniciar sesión",
    }
  }
}

/**
 * Alias para signIn para mantener compatibilidad con código existente
 * @deprecated Use signIn instead
 */
export const loginUser = signIn

/**
 * Cierra la sesión del usuario actual
 * @returns Resultado del cierre de sesión
 */
export async function signOut() {
  try {
    const supabase = createBrowserClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw new Error(`Error al cerrar sesión: ${error.message}`)
    }

    return {
      success: true,
      message: "Sesión cerrada correctamente",
    }
  } catch (error) {
    console.error("Error en signOut:", error)
    return {
      success: false,
      message: error.message || "Error al cerrar sesión",
    }
  }
}

/**
 * Alias para signOut para mantener compatibilidad con código existente
 * @deprecated Use signOut instead
 */
export const logoutUser = signOut

/**
 * Envía un enlace de restablecimiento de contraseña
 * @param email Email del usuario
 * @returns Resultado del envío
 */
export async function resetPassword(email) {
  try {
    const supabase = createServerClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
    })

    if (error) {
      throw new Error(`Error al enviar el enlace: ${error.message}`)
    }

    return {
      success: true,
      message: "Enlace de restablecimiento enviado correctamente",
    }
  } catch (error) {
    console.error("Error en resetPassword:", error)
    return {
      success: false,
      message: error.message || "Error al enviar el enlace de restablecimiento",
    }
  }
}

/**
 * Actualiza la contraseña del usuario
 * @param newPassword Nueva contraseña
 * @returns Resultado de la actualización
 */
export async function updatePassword(newPassword) {
  try {
    const supabase = createBrowserClient()
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      throw new Error(`Error al actualizar la contraseña: ${error.message}`)
    }

    return {
      success: true,
      message: "Contraseña actualizada correctamente",
    }
  } catch (error) {
    console.error("Error en updatePassword:", error)
    return {
      success: false,
      message: error.message || "Error al actualizar la contraseña",
    }
  }
}

