export interface Product {
  id: string
  name: string
  description?: string | null
  price: number
  category?: string
  image_url?: string | null
  stock: number
  max_per_user?: number
  sku?: string
  code?: string
  urlpage?: string
  created_at?: string
  updated_at?: string
  [key: string]: any
}

