import { supabase } from "./supabase-client"
import { clearCart } from "./cart"

// Crear un nuevo pedido
export async function createOrder(userId: string, cartItems: any[], total: number) {
  try {
    // Iniciar una transacción
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        status: "pending",
        total,
      })
      .select()
      .single()

    if (orderError) {
      console.error("Error al crear el pedido:", orderError.message)
      return { success: false, error: orderError.message }
    }

    // Crear los items del pedido
    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.products.price,
    }))

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

    if (itemsError) {
      console.error("Error al crear los items del pedido:", itemsError.message)
      return { success: false, error: itemsError.message }
    }

    // Actualizar el inventario
    for (const item of cartItems) {
      const { error: stockError } = await supabase
        .from("products")
        .update({
          stock: supabase.rpc("decrement_stock", {
            product_id: item.product_id,
            quantity: item.quantity,
          }),
        })
        .eq("id", item.product_id)

      if (stockError) {
        console.error("Error al actualizar el inventario:", stockError.message)
        // Continuar con los demás productos aunque haya un error
      }
    }

    // Vaciar el carrito
    await clearCart(userId)

    return { success: true, data: order }
  } catch (error) {
    console.error("Error inesperado al crear el pedido:", error)
    return { success: false, error: "Error inesperado al crear el pedido" }
  }
}

// Obtener todos los pedidos de un usuario
export async function getUserOrders(userId: string) {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        created_at,
        status,
        total,
        order_items (
          id,
          quantity,
          price,
          product_id,
          products (
            id,
            name,
            image_url,
            code
          )
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error al obtener los pedidos:", error.message)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error inesperado al obtener los pedidos:", error)
    return { success: false, error: "Error inesperado al obtener los pedidos" }
  }
}

// Obtener un pedido específico
export async function getOrderById(orderId: string) {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        created_at,
        status,
        total,
        order_items (
          id,
          quantity,
          price,
          product_id,
          products (
            id,
            name,
            image_url,
            code
          )
        )
      `)
      .eq("id", orderId)
      .single()

    if (error) {
      console.error("Error al obtener el pedido:", error.message)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error inesperado al obtener el pedido:", error)
    return { success: false, error: "Error inesperado al obtener el pedido" }
  }
}

// Actualizar el estado de un pedido (solo para administradores)
export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const { data, error } = await supabase.from("orders").update({ status }).eq("id", orderId).select().single()

    if (error) {
      console.error("Error al actualizar el estado del pedido:", error.message)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error inesperado al actualizar el estado del pedido:", error)
    return { success: false, error: "Error inesperado al actualizar el estado del pedido" }
  }
}

