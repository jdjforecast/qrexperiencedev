"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { getProductById } from "@/lib/products"
import { addToCart } from "@/lib/cart"
import RouteGuard from "@/components/auth/route-guard"
import LoadingSpinner from "@/components/ui/loading-spinner"
import { Metadata } from "next"
import { createServerClient } from "@supabase/auth-helpers-nextjs"
import { notFound } from "next/navigation"

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  stock: number
  code: string
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const id = params.id
  const router = useRouter()
  const { user } = useAuth()

  const supabase = createServerClient()
  const { data: product } = await supabase.from("products").select("*").or(`urlpage.eq.${id},id.eq.${id}`).single()

  if (!product) {
    notFound()
  }

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addingToCart, setAddingToCart] = useState(false)
  const [cartMessage, setCartMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    async function loadProduct() {
      try {
        setIsLoading(true)
        const result = await getProductById(id as string)

        if (result.success) {
          // Assuming the result.data is the product
          // If the product structure is different, you might need to adjust this line
          // For example, if the product is stored in a different way, you might need to fetch it from the database
          // and then set the product state
          // setProduct(result.data)
        } else {
          setError(result.error || "Error al cargar el producto")
        }
      } catch (err) {
        console.error("Error al cargar el producto:", err)
        setError("Error inesperado al cargar el producto")
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      loadProduct()
    }
  }, [id])

  const handleAddToCart = async () => {
    if (!user || !product) return

    try {
      setAddingToCart(true)
      setCartMessage(null)

      const result = await addToCart(user.id, product.id)

      if (result.success) {
        setCartMessage({
          type: "success",
          text: "Producto agregado al carrito correctamente",
        })

        // Opcional: redirigir al carrito después de un breve retraso
        setTimeout(() => {
          router.push("/cart")
        }, 1500)
      } else {
        setCartMessage({
          type: "error",
          text: result.error || "Error al agregar al carrito",
        })
      }
    } catch (err) {
      console.error("Error al agregar al carrito:", err)
      setCartMessage({
        type: "error",
        text: "Error inesperado al agregar al carrito",
      })
    } finally {
      setAddingToCart(false)
    }
  }

  return (
    <RouteGuard requireAuth>
      <div className="container mx-auto p-4">
        {isLoading ? (
          <div className="flex justify-center">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>
        ) : product ? (
          <div className="overflow-hidden rounded-lg bg-white shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="relative min-h-[300px]">
                {product.image_url ? (
                  <Image
                    src={product.image_url || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gray-200">
                    <span className="text-gray-500">Sin imagen</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col p-6">
                <h1 className="mb-4 text-2xl font-bold">{product.name}</h1>

                <div className="mb-4">
                  <span className="text-xl font-bold">${product.price.toFixed(2)}</span>
                </div>

                <div className="mb-6">
                  <h2 className="mb-2 text-lg font-semibold">Descripción</h2>
                  <p className="text-gray-700">{product.description || "Sin descripción disponible"}</p>
                </div>

                <div className="mb-6">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${
                      product.stock > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {product.stock > 0 ? `En stock (${product.stock} disponibles)` : "Agotado"}
                  </span>
                </div>

                {cartMessage && (
                  <div
                    className={`mb-4 rounded-md p-4 text-sm ${
                      cartMessage.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                    }`}
                  >
                    {cartMessage.text}
                  </div>
                )}

                <div className="mt-auto">
                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart || product.stock <= 0}
                    className="w-full rounded-md bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {addingToCart ? "Agregando..." : product.stock <= 0 ? "Agotado" : "Agregar al Carrito"}
                  </button>

                  <button
                    onClick={() => router.push("/products")}
                    className="mt-4 w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Volver al Catálogo
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-md bg-yellow-50 p-4 text-sm text-yellow-700">Producto no encontrado</div>
        )}
      </div>
    </RouteGuard>
  )
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const id = params.id
  const supabase = createServerClient()
  const { data: product } = await supabase.from("products").select("*").or(`urlpage.eq.${id},id.eq.${id}`).single()

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

