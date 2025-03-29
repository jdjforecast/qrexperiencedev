"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"
import RouteGuard from "@/components/auth/route-guard"
import { getProductByCode } from "@/lib/products"
import { addToCart } from "@/lib/cart"
import LoadingSpinner from "@/components/ui/loading-spinner"

export default function ScanPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Simulación de escaneo de código para la demo
  const simulateScan = async () => {
    if (!user) return

    setIsScanning(true)
    setError(null)

    try {
      // Simular un retraso de escaneo
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Código de producto simulado
      const productCode = "PROD123"

      // Obtener producto por código
      const productResult = await getProductByCode(productCode)

      if (!productResult?.success || !productResult?.data) {
        setError(productResult?.error || "Producto no encontrado")
        return
      }

      // Agregar al carrito
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
      console.error("Error al escanear código:", err)
      setError("Error inesperado al escanear el código")
    } finally {
      setIsScanning(false)
    }
  }

  return (
    <RouteGuard>
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Escanear Código</h1>

        <div className="mx-auto max-w-md rounded-lg border p-6 shadow-md">
          {isScanning ? (
            <div className="text-center">
              <LoadingSpinner />
              <p className="mt-4 text-gray-600">Escaneando código...</p>
            </div>
          ) : error ? (
            <div className="rounded-md bg-red-50 p-4 text-red-700">
              <p className="font-medium">Error</p>
              <p>{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-4 rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              >
                Intentar de nuevo
              </button>
            </div>
          ) : success ? (
            <div className="rounded-md bg-green-50 p-4 text-green-700">
              <p className="font-medium">¡Producto agregado al carrito!</p>
              <p>Redirigiendo al carrito...</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <div className="h-48 w-48 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="h-16 w-16 text-gray-400"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                    />
                  </svg>
                </div>
              </div>
              <p className="mb-4 text-gray-600">Ingresa el código del producto para agregarlo al carrito.</p>
              <button
                onClick={simulateScan}
                className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Escanear Código
              </button>
            </div>
          )}
        </div>
      </div>
    </RouteGuard>
  )
}

