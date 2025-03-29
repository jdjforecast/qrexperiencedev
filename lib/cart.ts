import { supabaseClient } from "./supabase/client-utils"

// Obtener el carrito del usuario actual
export async function getUserCart(userId: string) {
  try {
    const { data, error } = await supabaseClient
      .from("cart_items")
      .select(`
        id,
        quantity,
        product_id,
        products (
          id,
          name,
          price,
          image_url,
          stock
        )
      `)
      .eq("user_id", userId)

    if (error) {
      console.error("Error al obtener el carrito:", error.message)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error inesperado al obtener el carrito:", error)
    return { success: false, error: "Error inesperado al obtener el carrito" }
  }
}

// Agregar un producto al carrito
export async function addToCart(userId: string, productId: string, quantity = 1) {
  try {
    // Verificar si el producto ya está en el carrito
    const { data: existingItem, error: checkError } = await supabaseClient
      .from("cart_items")
      .select("*")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 es el código para "no se encontraron resultados"
      console.error("Error al verificar el carrito:", checkError.message)
      return { success: false, error: checkError.message }
    }

    // Si el producto ya está en el carrito, actualizar la cantidad
    if (existingItem) {
      // Verificar la restricción de 1 unidad por referencia
      if (existingItem.quantity >= 1) {
        return {
          success: false,
          error: "Solo puedes agregar 1 unidad de cada producto a tu carrito",
        }
      }

      const { data, error } = await supabaseClient
        .from("cart_items")
        .update({ quantity: existingItem.quantity + quantity })
        .eq("id", existingItem.id)
        .select()
        .single()

      if (error) {
        console.error("Error al actualizar el carrito:", error.message)
        return { success: false, error: error.message }
      }

      return { success: true, data }
    }

    // Si el producto no está en el carrito, agregarlo
    const { data, error } = await supabaseClient
      .from("cart_items")
      .insert({
        user_id: userId,
        product_id: productId,
        quantity,
      })
      .select()
      .single()

    if (error) {
      console.error("Error al agregar al carrito:", error.message)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error inesperado al agregar al carrito:", error)
    return { success: false, error: "Error inesperado al agregar al carrito" }
  }
}

// Actualizar la cantidad de un producto en el carrito
export async function updateCartItem(cartItemId: string, quantity: number) {
  try {
    // Verificar que la cantidad no exceda 1 (restricción del sistema)
    if (quantity > 1) {
      return {
        success: false,
        error: "Solo puedes tener 1 unidad de cada producto en tu carrito",
      }
    }

    const { data, error } = await supabaseClient
      .from("cart_items")
      .update({ quantity })
      .eq("id", cartItemId)
      .select()
      .single()

    if (error) {
      console.error("Error al actualizar el carrito:", error.message)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error inesperado al actualizar el carrito:", error)
    return { success: false, error: "Error inesperado al actualizar el carrito" }
  }
}

// Eliminar un producto del carrito
export async function removeFromCart(cartItemId: string) {
  try {
    const { error } = await supabaseClient.from("cart_items").delete().eq("id", cartItemId)

    if (error) {
      console.error("Error al eliminar del carrito:", error.message)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Error inesperado al eliminar del carrito:", error)
    return { success: false, error: "Error inesperado al eliminar del carrito" }
  }
}

// Vaciar el carrito completo
export async function clearCart(userId: string) {
  try {
    const { error } = await supabaseClient.from("cart_items").delete().eq("user_id", userId)

    if (error) {
      console.error("Error al vaciar el carrito:", error.message)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Error inesperado al vaciar el carrito:", error)
    return { success: false, error: "Error inesperado al vaciar el carrito" }
  }
}

