import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database.types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export async function getUserProfile() {
  const { data, error } = await supabase.rpc("get_user_profile")

  if (error) {
    console.error("Error fetching user profile:", error)
    throw error
  }

  return data
}

export async function getUserCart() {
  const { data, error } = await supabase.rpc("get_user_cart")

  if (error) {
    console.error("Error fetching user cart:", error)
    throw error
  }

  return data
}

export async function addToCart(productId: string, quantity = 1) {
  const { data, error } = await supabase.rpc("add_to_cart", {
    p_product_id: productId,
    p_quantity: quantity,
  })

  if (error) {
    console.error("Error adding to cart:", error)
    throw error
  }

  return data
}

export async function createOrderFromCart() {
  const { data, error } = await supabase.rpc("create_order_from_cart")

  if (error) {
    console.error("Error creating order:", error)
    throw error
  }

  return data
}

export async function getProducts() {
  const { data, error } = await supabase.from("products").select("*")

  if (error) {
    console.error("Error fetching products:", error)
    throw error
  }

  return data
}

export async function getProductByCode(code: string) {
  const { data, error } = await supabase.from("products").select("*").eq("code", code).single()

  if (error) {
    console.error("Error fetching product by code:", error)
    throw error
  }

  return data
}

export async function getOrders() {
  const { data, error } = await supabase.from("orders").select("*, order_items(*)")

  if (error) {
    console.error("Error fetching orders:", error)
    throw error
  }

  return data
}

export async function getOrderById(orderId: string) {
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*, products(*))")
    .eq("id", orderId)
    .single()

  if (error) {
    console.error("Error fetching order by id:", error)
    throw error
  }

  return data
}

export async function updateOrderStatus(orderId: string, status: string) {
  const { data, error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId)
    .select()
    .single()

  if (error) {
    console.error("Error updating order status:", error)
    throw error
  }

  return data
}

