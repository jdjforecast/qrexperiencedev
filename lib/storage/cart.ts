import { getBrowserClient } from "../supabase"

// Obtener carrito del usuario
export async function getUserCart(userId: string) {
  const supabase = getBrowserClient()

  const { data, error } = await supabase
    .from("cart_items")
    .select(`
      *,
      product:product_id (*)
    `)
    .eq("user_id", userId)

  return { data: data || [], error }
}

// Añadir producto al carrito
export async function addToCart(userId: string, productId: string, quantity = 1) {
  const supabase = getBrowserClient()

  // Verificar si el producto ya está en el carrito
  const { data: existingItem } = await supabase
    .from("cart_items")
    .select("*")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .single()

  if (existingItem) {
    // Actualizar cantidad
    const { data, error } = await supabase
      .from("cart_items")
      .update({ quantity: existingItem.quantity + quantity })
      .eq("id", existingItem.id)
      .select()
      .single()

    return { data, error }
  } else {
    // Insertar nuevo item
    const { data, error } = await supabase
      .from("cart_items")
      .insert({
        user_id: userId,
        product_id: productId,
        quantity,
      })
      .select()
      .single()

    return { data, error }
  }
}

// Actualizar cantidad de un item del carrito
export async function updateCartItemQuantity(cartItemId: string, quantity: number) {
  const supabase = getBrowserClient()

  if (quantity <= 0) {
    // Eliminar item si la cantidad es 0 o menor
    const { data, error } = await supabase.from("cart_items").delete().eq("id", cartItemId).select()

    return { data, error }
  } else {
    // Actualizar cantidad
    const { data, error } = await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("id", cartItemId)
      .select()
      .single()

    return { data, error }
  }
}

// Eliminar item del carrito
export async function removeFromCart(cartItemId: string) {
  const supabase = getBrowserClient()

  const { data, error } = await supabase.from("cart_items").delete().eq("id", cartItemId).select()

  return { data, error }
}

// Vaciar carrito
export async function clearCart(userId: string) {
  const supabase = getBrowserClient()

  const { data, error } = await supabase.from("cart_items").delete().eq("user_id", userId)

  return { data, error }
}

// Calcular total del carrito
export async function getCartTotal(userId: string) {
  const { data: cartItems, error } = await getUserCart(userId)

  if (error || !cartItems) {
    return { total: 0, error }
  }

  const total = cartItems.reduce((sum, item) => {
    return sum + (item.product?.price || 0) * item.quantity
  }, 0)

  return { total, error: null }
}

