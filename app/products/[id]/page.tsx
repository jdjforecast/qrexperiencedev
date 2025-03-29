import { notFound } from "next/navigation"
import { Metadata } from "next"
import { createServerClientForApi } from "@/lib/supabase/server-api"
import ProductDetailsClient from "./product-details-client"

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  stock: number
  code: string
}

interface ProductPageProps {
  params: { id: string }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const id = params.id

  // Usar nuestro cliente Supabase sin dependencia de cookies/headers
  const supabase = createServerClientForApi()

  const { data: product, error: fetchError } = await supabase
    .from("products")
    .select("*")
    .or(`urlpage.eq.${id},id.eq.${id}`)
    .single<Product>()

  if (fetchError) {
    console.error("Error fetching product:", fetchError)
    notFound()
  }

  if (!product) {
    notFound()
  }

  return (
    <div className="container mx-auto p-4">
      <ProductDetailsClient product={product} />
    </div>
  )
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const id = params.id

  // Usar nuestro cliente Supabase sin dependencia de cookies/headers
  const supabase = createServerClientForApi()

  const { data: product } = await supabase
    .from("products")
    .select("name, description")
    .or(`urlpage.eq.${id},id.eq.${id}`)
    .single<Pick<Product, "name" | "description">>()

  if (!product) {
    return {
      title: "Producto no encontrado",
    }
  }

  return {
    title: product.name,
    description: product.description || "Sin descripción disponible",
  }
}

