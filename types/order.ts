import type { ProductData } from "./cart" // Reuse ProductData from cart types

// Interface for a single item within an order
export interface OrderItem {
  quantity: number
  price: number // Price at the time of order
  products: ProductData | null // The actual product data, might be null
}

// Base interface for a complete order
export interface Order {
  order_id: string
  created_at: string // Typically an ISO date string
  status: string // e.g., 'pending', 'completed', 'cancelled'
  total_amount: number
  order_items: OrderItem[] // Array of items in the order
}

// Extended interface for Admin view, including user details
export interface AdminOrder extends Order {
  user: {
    email: string | null
    full_name: string | null
  } | null // User object might be null
}

