import { createServerClient } from "./supabase"

// Get all users
export async function getAllUsers() {
  const supabase = createServerClient()
  const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })

  return { data: data || [], error }
}

// Get all orders
export async function getAllOrders() {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("orders")
    .select("*, user:user_id(email, full_name)")
    .order("created_at", { ascending: false })

  return { data: data || [], error }
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

