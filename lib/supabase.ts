import { createClient } from "@supabase/supabase-js"

// Esta función crea un cliente de Supabase básico
// Se debe llamar CADA VEZ que se necesite un cliente, no usar como singleton.
export function createSupabaseClient(options?: { admin?: boolean }) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = options?.admin 
    ? process.env.SUPABASE_SERVICE_ROLE_KEY 
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Variables de entorno de Supabase faltantes')
    throw new Error('Variables de entorno de Supabase faltantes')
  }
  
  // Configuración para autenticación con Supabase
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    }
  })
}

// Cliente para uso general (principalmente client-side o donde las claves públicas son suficientes)
export function getSupabase() {
  return createSupabaseClient()
}

// Cliente explícito para uso en el navegador (usa claves públicas)
export function getBrowserClient() {
  return createSupabaseClient() // Crea una nueva instancia
}

// Cliente explícito para uso en servidor (puede usar claves de admin si se especifica)
export function createServerClient(options?: { admin?: boolean }) {
  return createSupabaseClient(options) // Crea una nueva instancia
}

// Cliente para acceso con permisos de admin (solo servidor)
export function getAdminSupabase() {
  return createSupabaseClient({ admin: true }) // Crea una nueva instancia
}

// --- Operaciones comunes agrupadas (dataAPI) ---
// Ahora usan getSupabase() o getAdminSupabase() según necesidad.
// Se asume que las funciones dentro de dataAPI determinan si necesitan acceso admin.

export const dataAPI = {
  // Productos
  async getAllProducts() {
    const supabase = getSupabase() // Usa cliente normal
    const { data, error } = await supabase.from('products').select('*').order('name') // Added order by name
    if (error) {
      console.error("Error getting all products:", error.message)
      throw error
    }
    return data || []
  },
  
  async getProductById(id: string) {
    const supabase = getSupabase() // Usa cliente normal
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single()
    // PGRST116 = Not found, which is not necessarily an error we want to throw
    if (error && error.code !== 'PGRST116') { 
      console.error(`Error getting product by ID ${id}:`, error.message)
      throw error
    }
    return data
  },
  
  // Verificar si un usuario ya tiene un producto (Asume userId es seguro)
  async hasUserProduct(userId: string, productId: string): Promise<boolean> {
    if (!userId || !productId) return false;
    const supabase = getSupabase() // Usa cliente normal
    // Optimizacion: Buscar directamente en order_items si existe la combinación
    const { count, error } = await supabase
      .from('order_items')
      .select('id', { count: 'exact', head: true })
      .eq('product_id', productId)
      .eq('order_id.user_id', userId) // Asumiendo relación order->user_id
      // Necesitamos confirmar la estructura exacta o ajustar la query
      // Si la relación no es directa, volvemos al método anterior con 2 queries

    // Fallback al método anterior si la relación directa no funciona o falla
    if (error || count === null) { 
      console.warn("Direct check failed, falling back to two-step check for hasUserProduct", error);
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id')
        .eq('user_id', userId)
        .in('status', ['pending', 'completed']) // Asegurar que la orden fue válida
      
      if (ordersError) {
        console.error("Error getting user orders for product check:", ordersError.message);
        throw ordersError;
      }
      if (!orders || orders.length === 0) return false;
      
      const orderIds = orders.map(order => order.id)
      const { count: itemsCount, error: itemsError } = await supabase
        .from('order_items')
        .select('id', { count: 'exact', head: true })
        .eq('product_id', productId)
        .in('order_id', orderIds)
        
      if (itemsError) {
         console.error("Error checking order items for product check:", itemsError.message);
         throw itemsError;
      }
      return (itemsCount || 0) > 0;
    }

    return (count || 0) > 0
  },

  // Usuarios - obtener perfil del usuario
  async getUserProfile(supabase: any, userId: string) {
    if (!userId) return null;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
      
    // No lanzar error si no se encuentra (PGRST116), solo devolver null
    if (error && error.code !== 'PGRST116') { 
      console.error(`Error getting user profile ${userId}:`, error.message);
      throw error
    } 
    return data
  },

  // Órdenes
  async getUserOrders(userId: string) {
    if (!userId) return [];
    const supabase = getSupabase() // Usa cliente normal
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items:order_items(
          *,
          product:products(*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false }) // Ordenar por fecha
      
    if (error) {
      console.error(`Error getting user orders ${userId}:`, error.message);
      throw error
    }
    return data || []
  },

  // Crear orden (Requiere operaciones que podrían necesitar privilegios si hay RLS estricto)
  async createOrder(userId: string, items: { productId: string, quantity: number }[]) {
    if (!userId || !items || items.length === 0) {
      throw new Error("User ID and items are required to create an order.");
    }
    // Podría necesitar cliente admin si RLS previene inserción/actualización directa
    const supabase = getAdminSupabase() // Usar admin por precaución para crear/actualizar órdenes
    
    // 1. Obtener precios de productos y verificar stock (¡IMPORTANTE!)
    const productIds = items.map(item => item.productId);
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, price, stock')
      .in('id', productIds);

    if (productsError) {
      console.error("Error getting products for order creation:", productsError.message);
      throw productsError;
    }

    const priceMap: Record<string, number> = {};
    const stockMap: Record<string, number> = {};
    if (products) {
      for (const product of products) {
        priceMap[product.id] = product.price;
        stockMap[product.id] = product.stock;
      }
    }

    // Validar si todos los productos existen y hay stock
    for (const item of items) {
      if (!(item.productId in priceMap)) {
        throw new Error(`Product with ID ${item.productId} not found.`);
      }
      if (stockMap[item.productId] < item.quantity) {
        throw new Error(`Not enough stock for product ID ${item.productId}. Available: ${stockMap[item.productId]}, Requested: ${item.quantity}`);
      }
    }

    // 2. Crear la orden
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({ user_id: userId, status: 'pending', total: 0 })
      .select()
      .single();
      
    if (orderError || !order) {
      console.error("Error creating order record:", orderError?.message);
      throw orderError || new Error("Failed to create order record.");
    }
    
    // 3. Insertar items de la orden y calcular total
    let calculatedTotal = 0;
    const orderItems = items.map(item => {
      const price = priceMap[item.productId];
      calculatedTotal += price * item.quantity;
      return {
        order_id: order.id,
        product_id: item.productId,
        quantity: item.quantity,
        price: price // Precio al momento de la compra
      };
    });
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
      
    if (itemsError) {
      console.error("Error inserting order items:", itemsError.message);
      // Rollback? Podríamos intentar eliminar la orden creada, pero es complejo.
      // Por ahora, lanzamos error.
      throw itemsError;
    }
    
    // 4. Actualizar total de la orden
    const { error: updateError } = await supabase
      .from('orders')
      .update({ total: calculatedTotal })
      .eq('id', order.id);
      
    if (updateError) {
      console.error("Error updating order total:", updateError.message);
      // La orden se creó, pero el total es incorrecto. Lanzar error.
      throw updateError;
    }
    
    // 5. (Opcional pero recomendado) Actualizar stock de productos
    // Esto debería hacerse en una transacción si es posible
    try {
      for (const item of items) {
        const newStock = stockMap[item.productId] - item.quantity;
        const { error: stockUpdateError } = await supabase
          .from('products')
          .update({ stock: newStock })
          .eq('id', item.productId);
        if (stockUpdateError) {
          console.error(`Failed to update stock for product ${item.productId}:`, stockUpdateError.message);
          // Log potential inconsistency
        }
      }
    } catch (stockError) {
        console.error("Error during stock update:", stockError)
        // Log potential inconsistency
    }

    // Devolver la orden con el total actualizado
    return { ...order, total: calculatedTotal };
  }
};

