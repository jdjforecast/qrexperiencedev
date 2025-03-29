import { createServerClient } from "./supabase"
import { createClientClient } from "@/lib/supabase/client"
import { AdminOrder } from "@/types/order"
import { AdminOrdersArraySchema } from "@/types/schemas"

// Get all users
export async function getAllUsers() {
  const supabase = createServerClient()
  const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })

  return { data: data || [], error }
}

// Define return type for this function
type AdminOrdersFetchResult = 
  | { success: true; data: AdminOrder[] }
  | { success: false; error: string };

// Refactored getAllOrders for client-side usage with detailed select and validation
export async function getAllOrders(): Promise<AdminOrdersFetchResult> {
  const supabase = createClientClient(); // Use client-side instance
  try {
    const { data, error } = await supabase
      .from("orders")
      // Select fields matching AdminOrderSchema
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
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching all orders:", error);
      return { success: false, error: error.message }; 
    }

    // Validate data with Zod 
    const validationResult = AdminOrdersArraySchema.safeParse(data);
    if (!validationResult.success) {
      console.error("Zod validation failed for getAllOrders:", validationResult.error.errors);
      // Provide a user-friendly error message
      return { success: false, error: "Error: Datos de pedidos inválidos recibidos del servidor." }; 
    }

    // Return validated data
    return { success: true, data: validationResult.data };

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Error inesperado al obtener todos los pedidos";
    console.error("Unexpected error fetching all orders:", err);
    return { success: false, error: errorMessage };
  }
}

// Get dashboard stats
export async function getDashboardStats() {
  const supabase = createServerClient()

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

  return {
    data: {
      totalUsers: totalUsers || 0,
      totalOrders: totalOrders || 0,
      totalCoinsSpent,
      popularProducts: popularProducts || [],
    },
    error: usersError || ordersError || coinsError || productsError,
  }
}

// Update product
export async function updateProduct(productId: string, updates: any) {
  const supabase = createServerClient()
  const { data, error } = await supabase.from("products").update(updates).eq("id", productId).select().single()

  return { data, error }
}

// Create QR code
export async function createQRCode(code: string, productId: string | null = null, coinsValue = 0) {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("qr_codes")
    .insert({
      code,
      product_id: productId,
      coins_value: coinsValue,
      is_used: false,
    })
    .select()
    .single()

  return { data, error }
}

