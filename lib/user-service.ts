import { createBrowserClient } from "./supabase-client"

/**
 * Obtiene el perfil de usuario por ID
 */
export async function getUserProfile(userId: string) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error) {
    console.error("Error al obtener perfil:", error)
    throw new Error("No se pudo obtener el perfil de usuario")
  }

  return data
}

/**
 * Actualiza el perfil de usuario
 */
export async function updateUserProfile(userId: string, profileData: any) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase.from("profiles").update(profileData).eq("id", userId).select()

  if (error) {
    console.error("Error al actualizar perfil:", error)
    throw new Error("No se pudo actualizar el perfil de usuario")
  }

  return data
}

/**
 * Registra un nuevo usuario
 */
export async function registerUser(email: string, password: string, userData: any) {
  const supabase = createBrowserClient()

  // Registrar usuario en Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: userData.full_name,
      },
    },
  })

  if (authError) {
    console.error("Error al registrar usuario:", authError)
    throw new Error(authError.message)
  }

  // Si el registro fue exitoso y tenemos un ID de usuario
  if (authData.user) {
    // Crear perfil en la tabla profiles
    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user.id,
      email: email,
      full_name: userData.full_name,
      phone: userData.phone || null,
    })

    if (profileError) {
      console.error("Error al crear perfil:", profileError)
      // Intentar eliminar el usuario auth ya que el perfil falló
      // Esto es para mantener consistencia
      await supabase.auth.admin.deleteUser(authData.user.id)
      throw new Error("Error al crear perfil de usuario")
    }
  }

  return authData
}

/**
 * Alias para la función signIn para mantener consistencia en la nomenclatura
 */
export async function loginUser(email: string, password: string) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error("Error al iniciar sesión:", error)
    throw new Error(error.message)
  }

  return data
}

/**
 * Cierra la sesión del usuario actual
 */
export async function logoutUser() {
  const supabase = createBrowserClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error("Error al cerrar sesión:", error)
    throw new Error("No se pudo cerrar la sesión")
  }

  return true
}

/**
 * Obtiene el carrito de compras del usuario
 */
export async function getUserCart(userId: string) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from("cart_items")
    .select(`
      id,
      quantity,
      product_id,
      products:product_id (
        id,
        name,
        description,
        price,
        image_url
      )
    `)
    .eq("user_id", userId)

  if (error) {
    console.error("Error al obtener carrito:", error)
    throw new Error("No se pudo obtener el carrito de compras")
  }

  return data
}

