import type { Database } from "@/types/supabase"

export type ProductWithImages = Database["public"]["Tables"]["products"]["Row"] & {
  product_images: {
    id: string
    url: string
  }[]
}

export type ProductPageProps = {
  params: {
    id: string
  }
}

export type ProductViewProps = {
  product: ProductWithImages
  userId: string | undefined
  hasQR: boolean
}

