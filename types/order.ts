export interface Order {
  id: string
  user_id: string
  total_coins: number
  status: "pending" | "completed" | "cancelled"
  created_at: string
  updated_at?: string
}

export interface OrderItem {
  id?: string
  order_id?: string
  product_id: string
  product_name: string
  quantity: number
  price: number
}

