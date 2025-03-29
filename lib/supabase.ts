import { createClient } from "@supabase/supabase-js"

// Esta función crea un cliente de Supabase básico
// Puede usarse en cualquier contexto: cliente, servidor, API routes, etc.
export function createSupabaseClient(options?: { admin?: boolean }) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = options?.admin 
    ? process.env.SUPABASE_SERVICE_ROLE_KEY 
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Variables de entorno de Supabase faltantes')
    throw new Error('Variables de entorno de Supabase faltantes')
  }
  
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: typeof window !== 'undefined', // Solo en el navegador
      persistSession: typeof window !== 'undefined'    // Solo en el navegador
    }
  })
}

// Instancia singleton para cliente (navegador)
let browserClient: ReturnType<typeof createSupabaseClient> | null = null

// Cliente para componentes de cliente
export function getClientSupabase() {
  if (typeof window === 'undefined') {
    // Si se llama desde el servidor durante SSR de un componente cliente,
    // devolvemos un cliente sin persistencia de sesión
    return createSupabaseClient()
  }
  
  // En el navegador, reutilizamos la instancia
  if (!browserClient) {
    browserClient = createSupabaseClient()
  }
  return browserClient
}

// Cliente para acceso en API routes y Server Actions
// No depende de next/headers y es seguro para usar en cualquier contexto
export function getAPISupabase(options?: { admin?: boolean }) {
  return createSupabaseClient(options)
}

// Operaciones comunes agrupadas
export const dataAPI = {
  // Productos
  async getAllProducts() {
    const { data, error } = await getAPISupabase().from('products').select('*')
    if (error) throw error
    return data || []
  },
  
  async getProductById(id: string) {
    const { data, error } = await getAPISupabase().from('products').select('*').eq('id', id).single()
    if (error && error.code !== 'PGRST116') throw error
    return data
  },
  
  // Usuarios (autenticación)
  async getCurrentUser() {
    // Solo usar en API routes o server actions
    const { data: { user } } = await getAPISupabase().auth.getUser()
    return user
  },
  
  // Verificar si un usuario ya tiene un producto
  async hasUserProduct(userId: string, productId: string) {
    // Primero obtener las órdenes del usuario
    const { data: orders, error: ordersError } = await getAPISupabase()
      .from('orders')
      .select('id')
      .eq('user_id', userId)
      .in('status', ['pending', 'completed'])
    
    if (ordersError) throw ordersError
    
    if (!orders || orders.length === 0) {
      return false // No tiene órdenes
    }
    
    // Buscar el producto en las órdenes del usuario
    const orderIds = orders.map(order => order.id)
    const { data, error } = await getAPISupabase()
      .from('order_items')
      .select('id')
      .eq('product_id', productId)
      .in('order_id', orderIds)
      .limit(1)
      
    if (error) throw error
    return data && data.length > 0
  }
}

