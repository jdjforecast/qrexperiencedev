import { createServerClient, getBrowserClient } from "../supabase"
import type { OrderItem } from "@/types/order"

// Crear un nuevo pedido
export async function createOrder(userId: string, items: OrderItem[], totalCoins: number) {
  const supabase = createServerClient()

  // Iniciar transacción
  // 1. Crear el pedido
  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      total_coins: totalCoins,
      status: "completed",
    })
    .select()
    .single()

  if (orderError || !orderData) {
    return { success: false, error: orderError || new Error("Error al crear el pedido") }
  }

  // 2. Crear los items del pedido
  const orderItems = items.map((item) => ({
    order_id: orderData.id,
    product_id: item.product_id,
    product_name: item.product_name,
    quantity: item.quantity,
    price: item.price,
  }))

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

  if (itemsError) {
    return { success: false, error: itemsError }
  }

  // 3. Deducir monedas del usuario
  const { error: coinsError } = await supabase.rpc("deduct_user_coins", {
    user_id: userId,
    amount: totalCoins,
  })

  if (coinsError) {
    return { success: false, error: coinsError }
  }

  // 4. Limpiar el carrito
  const { error: clearError } = await supabase.from("cart_items").delete().eq("user_id", userId)

  if (clearError) {
    return { success: false, error: clearError }
  }

  return { success: true, data: orderData }
}

// Obtener pedidos de un usuario
export async function getUserOrders(userId: string) {
  const supabase = getBrowserClient()

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  return { data: data || [], error }
}

// Obtener detalles de un pedido
export async function getOrderDetails(orderId: string) {
  const supabase = getBrowserClient()

  const { data: order, error: orderError } = await supabase.from("orders").select("*").eq("id", orderId).single()

  if (orderError || !order) {
    return { data: null, error: orderError || new Error("Pedido no encontrado") }
  }

  const { data: items, error: itemsError } = await supabase.from("order_items").select("*").eq("order_id", orderId)

  return {
    data: {
      ...order,
      items: items || [],
    },
    error: itemsError,
  }
}

// Obtener todos los pedidos (admin)
export async function getAllOrders() {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      user:user_id (email, full_name)
    `)
    .order("created_at", { ascending: false })

  return { data: data || [], error }
}

// Actualizar estado de un pedido
export async function updateOrderStatus(orderId: string, status: "pending" | "completed" | "cancelled") {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId)
    .select()
    .single()

  return { data, error }
}

// Obtener estadísticas de pedidos
export async function getOrderStats() {
  const supabase = createServerClient()

  // Total de pedidos
  const { count: totalOrders } = await supabase.from("orders").select("*", { count: "exact", head: true })

  // Pedidos completados
  const { count: completedOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "completed")

  // Total de monedas gastadas
  const { data: coinsData } = await supabase.from("orders").select("total_coins")

  const totalCoinsSpent = coinsData?.reduce((sum, order) => sum + order.total_coins, 0) || 0

  // Productos más populares
  const { data: popularProducts } = await supabase
    .from("order_items")
    .select("product_id, product_name, quantity")
    .order("quantity", { ascending: false })
    .limit(5)

  return {
    totalOrders: totalOrders || 0,
    completedOrders: completedOrders || 0,
    totalCoinsSpent,
    popularProducts: popularProducts || [],
  }
}

