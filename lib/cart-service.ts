import { supabase } from "@/lib/supabase-client"
import { getUserCart } from "@/lib/user-service"

// Define type for cart items based on the select in getUserCart
interface CartItem {
  id: string; // Or number, depending on your DB schema
  quantity: number;
  product_id: string; // Or number
  products: {
    id: string; // Or number
    name: string;
    description: string | null;
    price: number;
    image_url: string | null;
  } | null; // products might be null if relation fails or isn't required
}

// Función para agregar un producto al carrito desde un código QR
export async function addProductToCartFromQR(productId: string) {
  try {
    // No need to create client, use the imported instance
    // const supabase = createClient()

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

    // --- Performance Improvement: Check if item already exists efficiently --- //
    const { count: existingCount, error: checkError } = await supabase
      .from("cart_items")
      .select('id', { count: 'exact', head: true }) // Efficient count query
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (checkError) {
      console.error("Error checking for existing cart item:", checkError);
      throw new Error("Error al verificar el carrito");
    }

    if (existingCount !== null && existingCount > 0) {
      throw new Error("Ya tienes este producto en tu carrito. Solo puedes agregar 1 unidad por referencia.");
    }
    // --- End Performance Improvement --- //

    // Agregar el producto al carrito
    const { error: insertError } = await supabase.from("cart_items").insert({
      user_id: userId,
      product_id: productId,
      quantity: 1, // Assuming quantity is always 1 when adding from QR
    })

    if (insertError) {
      // Log the detailed error for debugging
      console.error("Supabase insert error:", insertError);
      throw new Error("Error al agregar el producto al carrito")
    }

    return {
      success: true,
      message: `${product.name} ha sido agregado a tu carrito`,
    }
  } catch (error) {
    // Log the error for debugging
    console.error("addProductToCartFromQR error:", error);
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

