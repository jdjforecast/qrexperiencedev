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
      autoRefreshToken: false, // No necesitamos esto con NextAuth
      persistSession: false    // No necesitamos esto con NextAuth
    }
  })
}

// Instancia singleton para aplicación
let sharedClient: ReturnType<typeof createSupabaseClient> | null = null

// Cliente para uso general en la aplicación
export function getSupabase() {
  if (!sharedClient) {
    sharedClient = createSupabaseClient()
  }
  return sharedClient
}

// Cliente para acceso en API routes y Server Actions con permisos de admin
export function getAdminSupabase() {
  return createSupabaseClient({ admin: true })
}

// Operaciones comunes agrupadas
export const dataAPI = {
  // Productos
  async getAllProducts() {
    const { data, error } = await getSupabase().from('products').select('*')
    if (error) throw error
    return data || []
  },
  
  async getProductById(id: string) {
    const { data, error } = await getSupabase().from('products').select('*').eq('id', id).single()
    if (error && error.code !== 'PGRST116') throw error
    return data
  },
  
  // Verificar si un usuario ya tiene un producto
  async hasUserProduct(userId: string, productId: string) {
    // Primero obtener las órdenes del usuario
    const { data: orders, error: ordersError } = await getSupabase()
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
    const { data, error } = await getSupabase()
      .from('order_items')
      .select('id')
      .eq('product_id', productId)
      .in('order_id', orderIds)
      .limit(1)
      
    if (error) throw error
    return data && data.length > 0
  },

  // Usuarios - obtener perfil del usuario
  async getUserProfile(userId: string) {
    const { data, error } = await getSupabase()
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
      
    if (error) throw error
    return data
  },

  // Órdenes
  async getUserOrders(userId: string) {
    const { data, error } = await getSupabase()
      .from('orders')
      .select(`
        *,
        order_items:order_items(
          *,
          product:products(*)
        )
      `)
      .eq('user_id', userId)
      
    if (error) throw error
    return data || []
  },

  // Crear orden
  async createOrder(userId: string, items: { productId: string, quantity: number }[]) {
    // 1. Crear la orden
    const { data: order, error: orderError } = await getSupabase()
      .from('orders')
      .insert({
        user_id: userId,
        status: 'pending',
        total: 0 // Se calculará después
      })
      .select()
      .single()
      
    if (orderError) throw orderError
    
    // 2. Obtener precios de productos
    const productIds = items.map(item => item.productId)
    const { data: products, error: productsError } = await getSupabase()
      .from('products')
      .select('id, price')
      .in('id', productIds)
      
    if (productsError) throw productsError
    
    const priceMap = products?.reduce((map, product) => {
      map[product.id] = product.price
      return map
    }, {} as Record<string, number>) || {}
    
    // 3. Insertar items de la orden
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      price: priceMap[item.productId] || 0
    }))
    
    const { error: itemsError } = await getSupabase()
      .from('order_items')
      .insert(orderItems)
      
    if (itemsError) throw itemsError
    
    // 4. Calcular total y actualizar la orden
    const total = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    
    const { error: updateError } = await getSupabase()
      .from('orders')
      .update({ total })
      .eq('id', order.id)
      
    if (updateError) throw updateError
    
    return order
  }
}

