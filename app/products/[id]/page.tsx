import { cookies } from "next/headers"
import { createClient, type CookieOptions } from "@supabase/ssr"
import { notFound } from "next/navigation"
import { Metadata } from "next"

import RouteGuard from "@/components/auth/route-guard"
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
  const cookieStore = cookies()
  const id = params.id

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set(name, value, options)
          } catch (error) {
            console.error("Error setting cookie:", error)
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options, maxAge: 0 })
          } catch (error) {
            console.error("Error removing cookie:", error)
          }
        },
      },
    }
  )

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
    <RouteGuard requireAuth>
      <div className="container mx-auto p-4">
        <ProductDetailsClient product={product} />
      </div>
    </RouteGuard>
  )
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const cookieStore = cookies()
  const id = params.id

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set(name, value, options)
          } catch (error) {}
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options, maxAge: 0 })
          } catch (error) {}
        },
      },
    }
  )

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

