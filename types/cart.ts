/**
 * Shared types related to the shopping cart.
 */

import type { Product } from "./product" // Import the canonical Product type

// Represents the product data structure expected within a CartItem
export interface ProductData {
  id: string
  name: string
  price: number
  image_url: string | null
  stock: number
  // Add other relevant product fields if needed
}

// Represents an item in the shopping cart
export interface CartItem {
  // Note: If the cart items table only stores product_id and quantity,
  // the 'product' field would typically be populated by joining data when fetching the cart.
  // The exact structure depends on how CartService fetches and shapes the data.
  product: Product // The full product details
  quantity: number
}

