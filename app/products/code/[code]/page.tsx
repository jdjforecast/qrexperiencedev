"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { getProductByCode } from "@/lib/products"
import { addToCart } from "@/lib/cart"
import RouteGuard from "@/components/auth/route-guard"
import LoadingSpinner from "@/components/ui/loading-spinner"

interface Product {
  id: string
  name: string
  price: number
  stock: number
}

export default function ProductByCodePage() {
  const { code } = useParams()
  const router = useRouter()
  const { user } = useAuth()

  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addingToCart, setAddingToCart] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function loadProductAndAddToCart() {
      if (!user || !code) return

      try {
        setIsLoading(true)
        setError(null)

        // Obtener el producto por código
        const productResult = await getProductByCode(code as string)

        if (!productResult.success) {
          setError(productResult.error || "Producto no encontrado")
          return
        }

        setProduct(productResult.data)

        // Agregar automáticamente al carrito
        const cartResult = await addToCart(user.id, productResult.data.id)

        if (cartResult.success) {
          setSuccess(true)
          // Redirigir al carrito después de un breve retraso
          setTimeout(() => {
            router.push("/cart")
          }, 2000)
        } else {
          setError(cartResult.error || "Error al agregar al carrito")
        }
      } catch (err) {
        console.error("Error al procesar el código QR:", err)
        setError("Error inesperado al procesar el código QR")
      } finally {
        setIsLoading(false)
      }
    }

    loadProductAndAddToCart()
  }, [code, user, router])

  return (
    <RouteGuard requireAuth>
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-4">
        {isLoading ? (
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-4 text-gray-600">Procesando código QR...</p>
          </div>
        ) : error ? (
          <div className="w-full max-w-md rounded-md bg-red-50 p-6 text-center text-red-700">
            <h2 className="mb-4 text-xl font-bold">Error</h2>
            <p>{error}</p>
            <button
              onClick={() => router.push("/products")}
              className="mt-6 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Ver Catálogo
            </button>
          </div>
        ) : success && product ? (
          <div className="w-full max-w-md rounded-md bg-green-50 p-6 text-center text-green-700">
            <h2 className="mb-4 text-xl font-bold">¡Producto Agregado!</h2>
            <p>
              <span className="font-semibold">{product.name}</span> ha sido agregado a tu carrito.
            </p>
            <p className="mt-2">Redirigiendo al carrito...</p>
          </div>
        ) : null}
      </div>
    </RouteGuard>
  )
}

