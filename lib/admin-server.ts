import { getServerClient } from "./supabase-client-server"
import type { AdminOrder } from "@/types/order"

/**
 * Obtiene todas las órdenes para el panel de administración (Server-Side)
 */
export async function getAdminOrders(): Promise<{ orders: AdminOrder[]; error?: string }> {
  try {
    const supabase = getServerClient()
    const { data, error } = await supabase
      .from("orders")
      .select(`
        order_id,
        created_at,
        status,
        total_amount,
        user:user_id(email, full_name), 
        order_items (
          quantity,
          price, 
          products ( 
            id:product_id, 
            name,
            price, 
            image_url,
            stock
          )
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching admin orders:", error)
      return { orders: [], error: error.message }
    }

    return { orders: data || [] }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Error inesperado al obtener órdenes"
    console.error("Error in getAdminOrders:", err)
    return { orders: [], error: errorMessage }
  }
}

/**
 * Actualiza el estado de una orden (Server-Side)
 */
export async function updateOrderStatus(orderId: string, status: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getServerClient()
    const { error } = await supabase.from("orders").update({ status }).eq("order_id", orderId)

    if (error) {
      console.error("Error updating order status:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Error inesperado al actualizar orden"
    console.error("Error in updateOrderStatus:", err)
    return { success: false, error: errorMessage }
  }
}

/**
 * Obtiene estadísticas del dashboard de administración (Server-Side)
 */
export async function getAdminDashboardStats() {
  const supabase = getServerClient()

  try {
    // Get total users
    const { count: totalUsers, error: usersError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })

    // Get total orders
    const { count: totalOrders, error: ordersError } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })

    // Get total coins spent
    const { data: coinsData, error: coinsError } = await supabase.from("orders").select("total_coins")

    const totalCoinsSpent = coinsData?.reduce((sum, order) => sum + order.total_coins, 0) || 0

    // Get most popular products
    const { data: popularProducts, error: productsError } = await supabase
      .from("order_items")
      .select("product_id, product_name, quantity")
      .order("quantity", { ascending: false })
      .limit(5)

    if (usersError || ordersError || coinsError || productsError) {
      throw new Error("Error fetching dashboard stats")
    }

    return {
      totalUsers: totalUsers || 0,
      totalOrders: totalOrders || 0,
      totalCoinsSpent,
      popularProducts: popularProducts || [],
    }
  } catch (error) {
    console.error("Error getting admin dashboard stats:", error)
    throw error
  }
} 