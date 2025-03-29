/**
 * Definición de tipos para el esquema de la base de datos
 * Esto proporciona autocompletado y verificación de tipos al interactuar con la base de datos
 */

export interface Product {
  id: string
  name: string
  description?: string
  price: number
  image_url?: string
  stock: number
  category?: string
  max_per_user: number
  sku?: string
  urlpage?: string
  created_at: string
  updated_at?: string
}

export interface QrCode {
  id: string
  code: string
  product_id: string
  coins_value: number
  is_used: boolean
  created_at: string
  created_by?: string
  qr_image_url?: string
  description?: string
  veces_escaneado: number
  last_scanned_at?: string
}

export interface User {
  id: string
  email: string
  full_name?: string
  company_name?: string
  is_admin: boolean
  coins: number
  created_at: string
}

export interface CartItem {
  id: string
  user_id: string
  product_id: string
  quantity: number
  created_at: string
  product?: Product
}

export interface Order {
  id: string
  user_id: string
  status: "pending" | "processing" | "completed" | "cancelled"
  total: number
  created_at: string
  updated_at?: string
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
  product?: Product
}

export interface QrScanEvent {
  id: string
  qr_code_id: string
  user_id?: string
  scanned_at: string
  device_info?: any
  success: boolean
  action_taken?: string
  error?: string
}

