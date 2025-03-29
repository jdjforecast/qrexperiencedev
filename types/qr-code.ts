// Definición de tipos para QR codes

export interface QRCodeData {
  id?: string
  code?: string
  product_id?: string
  coins_value?: number
  is_used?: boolean
  created_at?: string
  updated_at?: string
  created_by?: string
  qr_image_url?: string
  description?: string
  veces_escaneado?: number
  last_scanned_at?: string
  product?: {
    id: string
    name: string
    description: string
    price: number
    stock: number
    max_per_user: number
    image_url?: string
    category?: string
  }
  productInfo?: {
    name: string
    stock: number
    max_per_user: number
  }
}

export interface QRGenerationResult {
  success: boolean
  url?: string
  code?: string
  qrId?: string
  data?: QRCodeData
  error?: string
}

export interface QRScanResult {
  isValid: boolean
  productId?: string
  code?: string
  error?: string
  product?: any
}

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image_url?: string
}

