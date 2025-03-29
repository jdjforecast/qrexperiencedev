export interface Product {
  id: string
  name: string
  description?: string
  price: number
  category?: string
  image_url?: string
  stock: number
  max_per_user: number
  sku?: string
  created_at: string
  updated_at?: string
}

