import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import type { User } from "@supabase/supabase-js"

// Constantes para las variables de entorno
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
export const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

// Verificar que las variables de entorno estén disponibles
const getSupabaseUrl = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) throw new Error("Falta la variable de entorno NEXT_PUBLIC_SUPABASE_URL")
  return url
}

const getSupabaseAnonKey = () => {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!key) throw new Error("Falta la variable de entorno NEXT_PUBLIC_SUPABASE_ANON_KEY")
  return key
}

const getSupabaseServiceKey = () => {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) throw new Error("Falta la variable de entorno SUPABASE_SERVICE_ROLE_KEY")
  return key
}

// Singleton para el cliente del navegador
let browserClient: ReturnType<typeof createBrowserClient> | null = null

/**
 * Crea un cliente de Supabase para el navegador con soporte para autenticación
 */
export function createBrowserClient() {
  console.log("Creating browser client with URL:", getSupabaseUrl())
  return createClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  })
}

/**
 * Obtiene una instancia singleton del cliente de Supabase para el navegador
 */
export function getBrowserClient() {
  if (typeof window === "undefined") {
    throw new Error("getBrowserClient debe ser llamado solo en el cliente")
  }

  if (!browserClient) {
    console.log("Initializing browser client singleton")
    browserClient = createBrowserClient()
  }

  return browserClient
}

/**
 * Crea un cliente de Supabase para el servidor
 */
export function createServerClient(cookieStore?: { get: (name: string) => { value?: string } }) {
  const supabaseUrl = getSupabaseUrl()
  const supabaseKey = getSupabaseAnonKey()

  console.log("Creating server client with URL:", supabaseUrl)

  // Si tenemos cookieStore, configurar con la cookie de sesión
  if (cookieStore) {
    const supabaseSessionCookie = cookieStore.get("supabase-auth-token")?.value

    return createClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
        ...(supabaseSessionCookie && {
          global: {
            headers: {
              Cookie: `supabase-auth-token=${supabaseSessionCookie}`,
            },
          },
        }),
      },
    })
  }

  // Versión básica sin cookie
  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  })
}

/**
 * Crea un cliente de Supabase con permisos de administrador (solo para servidor)
 */
export function createAdminClient() {
  return createClient<Database>(getSupabaseUrl(), getSupabaseServiceKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  })
}

/**
 * Crea un cliente de Supabase basado en el contexto
 */
export function createSupabaseClient(options?: { admin?: boolean }) {
  if (options?.admin) {
    return createAdminClient()
  }

  if (typeof window !== "undefined") {
    return getBrowserClient()
  }

  return createServerClient()
}

// Rutas públicas que no requieren autenticación
export const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/products",
  "/auth/callback",
  "/auth/forgot-password",
  "/auth/update-password",
]

// Rutas que requieren permisos de administrador
export const ADMIN_ROUTES = ["/admin"]

/**
 * Verifica si una ruta es pública
 */
export function isPublicRoute(path: string): boolean {
  if (path.startsWith("/products/")) return true
  return PUBLIC_ROUTES.some((route) => path === route || path.startsWith(`${route}/`))
}

/**
 * Verifica si una ruta requiere acceso de administrador
 */
export function isAdminRoute(path: string): boolean {
  return ADMIN_ROUTES.some((route) => path === route || path.startsWith(`${route}/`))
}

/**
 * Verifica si un usuario es administrador
 */
export async function isUserAdmin(userId: string, serverClient?: ReturnType<typeof createServerClient>) {
  try {
    const supabase = serverClient || createAdminClient()

    // Primero intentamos verificar en la tabla profiles
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", userId)
      .single()

    if (!profileError && profileData && profileData.is_admin) {
      // Si encontramos is_admin en profiles y es true/truthy
      return (
        profileData.is_admin === true ||
        profileData.is_admin === "true" ||
        profileData.is_admin === 1 ||
        profileData.is_admin === "1"
      )
    }

    // Si no encontramos en profiles o no tiene is_admin, buscamos en users
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("is_admin, Empresa")
      .eq("id", userId)
      .single()

    if (!userError && userData && userData.is_admin) {
      // Si encontramos is_admin en users y es true/truthy
      return (
        userData.is_admin === true ||
        userData.is_admin === "true" ||
        userData.is_admin === 1 ||
        userData.is_admin === "1"
      )
    }

    // Si no encontramos información de admin en ninguna tabla
    console.log(`No admin information found for user ${userId}`)
    return false
  } catch (error) {
    console.error(`Error checking admin status for ${userId}:`, error)
    return false
  }
}

/**
 * Tipos para la autenticación
 */
export interface AuthResult<T = any> {
  data: T | null
  error: Error | null
  success: boolean
  message: string
}

export interface ProfileData {
  id: string
  role: string
  full_name?: string
  company_name?: string
  email?: string
  [key: string]: any
}

/**
 * Inicia sesión con email y contraseña
 */
export async function signInWithEmail(email: string, password: string) {
  try {
    const supabase = createBrowserClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Error signing in:", error.message)
      return { success: false, message: error.message }
    }

    if (!data.user) {
      return { success: false, message: "No user returned after login" }
    }

    // Intentar obtener o crear el perfil, pero no bloquear el login si falla
    try {
      await getOrCreateUserProfile(data.user)
    } catch (profileError) {
      console.error("Error with user profile, but continuing with login:", profileError)
      // No bloqueamos el login por un error de perfil
    }

    return { success: true, user: data.user }
  } catch (error) {
    console.error("Unexpected error during sign in:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

/**
 * Registra un nuevo usuario
 */
export async function signUpWithEmail(email: string, password: string, name: string) {
  try {
    const supabase = createBrowserClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    })

    if (error) {
      console.error("Error signing up:", error.message)
      return { success: false, message: error.message }
    }

    if (!data.user) {
      return { success: false, message: "No user returned after signup" }
    }

    // Create user profile without requiring company_name
    await createUserProfile(data.user.id, name)

    return { success: true, user: data.user }
  } catch (error) {
    console.error("Unexpected error during sign up:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

/**
 * Cierra la sesión del usuario actual
 */
export async function signOut() {
  const supabase = createBrowserClient()
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error("Error signing out:", error.message)
    return { success: false, message: error.message }
  }
  return { success: true }
}

/**
 * Obtiene la sesión actual del usuario
 */
export async function getCurrentSession(serverClient?: ReturnType<typeof createServerClient>) {
  const supabase = serverClient || createBrowserClient()
  const { data } = await supabase.auth.getSession()
  return data.session
}

/**
 * Obtiene el usuario actual
 */
export async function getCurrentUser(serverClient?: ReturnType<typeof createServerClient>) {
  try {
    const supabase = serverClient || createBrowserClient()
    const { data, error } = await supabase.auth.getUser()

    if (error) {
      // Si el error es "Auth session missing!", simplemente devolvemos null
      // Este es un caso común cuando no hay sesión y no debería considerarse un error real
      if (error.message === "Auth session missing!") {
        return null
      }

      console.error("Error getting current user:", error.message)
      return null
    }

    return data.user
  } catch (error) {
    console.error("Unexpected error getting current user:", error)
    return null
  }
}

/**
 * Obtiene el perfil del usuario
 */
export async function getUserProfile(userId: string) {
  const supabase = createBrowserClient()
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error) {
    console.error("Error fetching user profile:", error.message)
    return null
  }

  return data
}

/**
 * Crea un perfil de usuario
 */
export async function createUserProfile(userId: string, name: string) {
  try {
    const supabase = createAdminClient()

    // Crear un objeto básico con los campos esenciales
    const profileData: any = {
      id: userId,
      full_name: name,
      updated_at: new Date().toISOString(),
    }

    // Intentar insertar sin el campo company_name primero
    const { error: initialError } = await supabase.from("profiles").insert([profileData])

    if (!initialError) {
      console.log(`User profile created successfully for ${userId}`)
      return true
    }

    // Si el error es sobre company_name, intentar forzar la inserción con ese campo
    if (initialError.message && initialError.message.includes("company_name")) {
      console.log("Attempting to insert with company_name field")
      profileData.company_name = "" // Agregar campo con valor vacío

      const { error: retryError } = await supabase.from("profiles").insert([profileData])

      if (retryError) {
        console.error("Error on retry with company_name:", retryError.message)
        throw retryError
      }

      return true
    }

    // Si es otro tipo de error, lanzarlo
    console.error("Error creating user profile:", initialError.message)
    throw initialError
  } catch (error) {
    console.error(`Error creating user profile for ${userId}:`, error)
    throw error
  }
}

/**
 * Obtiene o crea un perfil de usuario
 */
export async function getOrCreateUserProfile(user: User | string) {
  try {
    const userId = typeof user === "string" ? user : user.id

    // Intentar obtener el perfil existente
    const profile = await getUserProfile(userId)

    // Si el perfil existe, devolverlo
    if (profile) {
      return profile
    }

    // Si no hay perfil, obtener datos del usuario para crear uno
    let name = "User"

    if (typeof user !== "string") {
      // Si tenemos el objeto de usuario completo, extraer el nombre
      name = user.user_metadata?.full_name || "User"
    } else {
      // Si solo tenemos el ID, intentar obtener los datos del usuario
      const supabase = createBrowserClient()
      const { data: userData } = await supabase.auth.getUser()

      if (userData && userData.user) {
        name = userData.user.user_metadata?.full_name || "User"
      }
    }

    // Crear perfil con manejo de errores mejorado
    try {
      await createUserProfile(userId, name)
    } catch (profileError) {
      console.error("Error creating profile, but continuing:", profileError)
      // Continuamos aunque haya error para no bloquear el login
    }

    // Intentar obtener el perfil recién creado
    const newProfile = await getUserProfile(userId)
    return newProfile
  } catch (error) {
    console.error(`Error in getOrCreateUserProfile for ${typeof user === "string" ? user : user.id}:`, error)
    // Devolver null en lugar de lanzar error para no bloquear el flujo de autenticación
    return null
  }
}

// Operaciones comunes de la API de datos
export const dataAPI = {
  // Productos
  async getAllProducts() {
    const supabase = createSupabaseClient() // Usa cliente normal
    const { data, error } = await supabase.from("products").select("*").order("name")
    if (error) {
      console.error("Error getting all products:", error.message)
      throw error
    }
    return data || []
  },

  async getProductById(id: string) {
    const supabase = createSupabaseClient() // Usa cliente normal
    const { data, error } = await supabase.from("products").select("*").eq("id", id).single()
    // PGRST116 = Not found, which is not necessarily an error we want to throw
    if (error && error.code !== "PGRST116") {
      console.error(`Error getting product by ID ${id}:`, error.message)
      throw error
    }
    return data
  },

  // Verificar si un usuario ya tiene un producto
  async hasUserProduct(userId: string, productId: string): Promise<boolean> {
    if (!userId || !productId) return false
    const supabase = createSupabaseClient() // Usa cliente normal

    const { count, error } = await supabase
      .from("order_items")
      .select("id", { count: "exact", head: true })
      .eq("product_id", productId)
      .eq("order_id.user_id", userId)

    // Fallback al método anterior si la relación directa no funciona o falla
    if (error || count === null) {
      console.warn("Direct check failed, falling back to two-step check for hasUserProduct", error)
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("id")
        .eq("user_id", userId)
        .in("status", ["pending", "completed"])

      if (ordersError) {
        console.error("Error getting user orders for product check:", ordersError.message)
        throw ordersError
      }
      if (!orders || orders.length === 0) return false

      const orderIds = orders.map((order) => order.id)
      const { count: itemsCount, error: itemsError } = await supabase
        .from("order_items")
        .select("id", { count: "exact", head: true })
        .eq("product_id", productId)
        .in("order_id", orderIds)

      if (itemsError) {
        console.error("Error checking order items for product check:", itemsError.message)
        throw itemsError
      }
      return (itemsCount || 0) > 0
    }

    return (count || 0) > 0
  },

  // Usuarios - obtener perfil del usuario
  async getUserProfile(userId: string) {
    if (!userId) return null
    const supabase = createSupabaseClient()
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle()

    if (error) {
      console.error(`Error getting user profile ${userId}:`, error.message)
      throw error
    }
    return data
  },

  // Órdenes
  async getUserOrders(userId: string) {
    if (!userId) return []
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items:order_items(
          *,
          product:products(*)
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error(`Error getting user orders ${userId}:`, error.message)
      throw error
    }
    return data || []
  },

  // Crear orden
  async createOrder(userId: string, items: { productId: string; quantity: number }[]) {
    if (!userId || !items || items.length === 0) {
      throw new Error("User ID and items are required to create an order.")
    }

    const supabase = createAdminClient()

    // 1. Obtener precios de productos y verificar stock
    const productIds = items.map((item) => item.productId)
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, price, stock")
      .in("id", productIds)

    if (productsError) {
      console.error("Error getting products for order creation:", productsError.message)
      throw productsError
    }

    const priceMap: Record<string, number> = {}
    const stockMap: Record<string, number> = {}
    if (products) {
      for (const product of products) {
        priceMap[product.id] = product.price
        stockMap[product.id] = product.stock
      }
    }

    // Validar si todos los productos existen y hay stock
    for (const item of items) {
      if (!(item.productId in priceMap)) {
        throw new Error(`Product with ID ${item.productId} not found.`)
      }
      if (stockMap[item.productId] < item.quantity) {
        throw new Error(
          `Not enough stock for product ID ${item.productId}. Available: ${stockMap[item.productId]}, Requested: ${item.quantity}`,
        )
      }
    }

    // 2. Crear la orden
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({ user_id: userId, status: "pending", total: 0 })
      .select()
      .single()

    if (orderError || !order) {
      console.error("Error creating order record:", orderError?.message)
      throw orderError || new Error("Failed to create order record.")
    }

    // 3. Insertar items de la orden y calcular total
    let calculatedTotal = 0
    const orderItems = items.map((item) => {
      const price = priceMap[item.productId]
      calculatedTotal += price * item.quantity
      return {
        order_id: order.id,
        product_id: item.productId,
        quantity: item.quantity,
        price: price,
      }
    })

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

    if (itemsError) {
      console.error("Error inserting order items:", itemsError.message)
      throw itemsError
    }

    // 4. Actualizar total de la orden
    const { error: updateError } = await supabase.from("orders").update({ total: calculatedTotal }).eq("id", order.id)

    if (updateError) {
      console.error("Error updating order total:", updateError.message)
      throw updateError
    }

    // 5. Actualizar stock de productos
    try {
      for (const item of items) {
        const newStock = stockMap[item.productId] - item.quantity
        const { error: stockUpdateError } = await supabase
          .from("products")
          .update({ stock: newStock })
          .eq("id", item.productId)
        if (stockUpdateError) {
          console.error(`Failed to update stock for product ${item.productId}:`, stockUpdateError.message)
        }
      }
    } catch (stockError) {
      console.error("Error during stock update:", stockError)
    }

    // Devolver la orden con el total actualizado
    return { ...order, total: calculatedTotal }
  },
}

// Cliente Supabase para uso general
// import { createClient } from '@supabase/supabase-js'
// import { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

