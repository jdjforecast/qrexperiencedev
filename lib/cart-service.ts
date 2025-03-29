import { createClient } from "@/lib/supabase-client"
import { getUserCart } from "@/lib/user"

// Función para agregar un producto al carrito desde un código QR
export async function addProductToCartFromQR(productId: string) {
  try {
    const supabase = createClient()

    // Verificar si el usuario está autenticado
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      throw new Error("Debe iniciar sesión para agregar productos al carrito")
    }

    const userId = session.user.id

    // Verificar si el producto existe
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, name, price")
      .eq("id", productId)
      .single()

    if (productError || !product) {
      throw new Error("Producto no encontrado")
    }

    // Verificar si el usuario ya tiene este producto en su carrito
    const { data: cart } = await getUserCart(userId)
    const existingItem = cart.find((item) => item.product_id === productId)

    if (existingItem) {
      throw new Error("Ya tienes este producto en tu carrito. Solo puedes agregar 1 unidad por referencia.")
    }

    // Agregar el producto al carrito
    const { error: insertError } = await supabase.from("cart_items").insert({
      user_id: userId,
      product_id: productId,
      quantity: 1,
    })

    if (insertError) {
      throw new Error("Error al agregar el producto al carrito")
    }

    return {
      success: true,
      message: `${product.name} ha sido agregado a tu carrito`,
    }
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
      }
    }
    return {
      success: false,
      message: "Error desconocido al agregar el producto al carrito",
    }
  }
}

