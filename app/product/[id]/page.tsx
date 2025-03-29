"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase-client"
import { addProductToCartFromQR } from "@/lib/cart-service"
import { useAuth } from "@/contexts/auth-context"

export default function ProductPage({ params }: { params: { id: string } }) {
  const { id } = params
  const router = useRouter()
  const { user, loading } = useAuth()
  const [product, setProduct] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    async function loadProduct() {
      if (loading) return

      // Redirigir al login si no hay usuario
      if (!user) {
        router.push(`/login?redirect=/product/${id}`)
        return
      }

      try {
        const supabase = createClient()
        const { data, error } = await supabase.from("products").select("*").eq("id", id).single()

        if (error || !data) {
          setMessage({ type: "error", text: "Producto no encontrado" })
          return
        }

        setProduct(data)
      } catch (error) {
        setMessage({ type: "error", text: "Error al cargar el producto" })
      } finally {
        setIsLoading(false)
      }
    }

    loadProduct()
  }, [id, user, loading, router])

  const handleAddToCart = async () => {
    if (!product) return

    const result = await addProductToCartFromQR(id)

    if (result.success) {
      setMessage({ type: "success", text: result.message })
      // Redirigir al carrito después de 2 segundos
      setTimeout(() => {
        router.push("/cart")
      }, 2000)
    } else {
      setMessage({ type: "error", text: result.message })
    }
  }

  if (loading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
          <p>Cargando...</p>
        </div>
      </div>
    )
  }

  if (!product && !loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg bg-red-100 p-4 text-center text-red-700">
          <p>Producto no encontrado</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {message && (
        <div
          className={`mb-4 rounded-lg p-4 text-center ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
        >
          {message.text}
        </div>
      )}

      {product && (
        <div className="overflow-hidden rounded-lg bg-white shadow-lg">
          <div className="md:flex">
            <div className="md:w-1/2">
              {product.image_url ? (
                <img
                  src={product.image_url || "/placeholder.svg"}
                  alt={product.name}
                  className="h-64 w-full object-cover md:h-full"
                />
              ) : (
                <div className="flex h-64 w-full items-center justify-center bg-gray-200 md:h-full">
                  <p className="text-gray-500">Sin imagen</p>
                </div>
              )}
            </div>
            <div className="p-6 md:w-1/2">
              <h1 className="mb-2 text-2xl font-bold">{product.name}</h1>
              <p className="mb-4 text-gray-600">{product.description}</p>
              <p className="mb-6 text-xl font-bold text-blue-600">${product.price.toFixed(2)}</p>

              <button
                onClick={handleAddToCart}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Agregar al carrito
              </button>

              <button
                onClick={() => router.push("/")}
                className="mt-4 w-full rounded-lg border border-blue-600 px-4 py-2 text-blue-600 hover:bg-blue-50"
              >
                Volver al inicio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

