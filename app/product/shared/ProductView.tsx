"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useCart } from "@/contexts/cart-context"
import type { ProductViewProps } from "./types"

export function ProductView({ product, userId, hasQr = false, isPublic = false }: ProductViewProps) {
  const router = useRouter()
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Determinar imagen principal
  const mainImage =
    product.image_url ||
    (product.product_images && product.product_images.length > 0 ? product.product_images[0].url : null)

  // Obtener imágenes adicionales
  const additionalImages = product.product_images || []

  const handleAddToCart = () => {
    if (!userId && !isPublic) {
      router.push("/login?returnUrl=" + encodeURIComponent(`/product/${product.id}`))
      return
    }

    setIsLoading(true)

    try {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        image: imageError ? "/images/placeholder.jpg" : mainImage,
      })

      // Opcional: Mostrar mensaje de éxito o redirigir al carrito
    } catch (error) {
      console.error("Error al agregar al carrito:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2">
            {/* Imagen principal */}
            {mainImage && !imageError ? (
              <div className="relative h-[400px]">
                <Image
                  src={mainImage}
                  alt={product.name}
                  fill
                  style={{ objectFit: "contain" }}
                  onError={() => {
                    console.error("Error cargando imagen:", mainImage)
                    setImageError(true)
                  }}
                  priority
                  className="rounded-t-lg md:rounded-l-lg md:rounded-t-none"
                />
              </div>
            ) : (
              <div className="bg-gray-200 flex items-center justify-center h-[400px]">
                <p className="text-gray-500">Imagen no disponible</p>
              </div>
            )}

            {/* Imágenes adicionales (si existen) */}
            {additionalImages.length > 0 && (
              <div className="p-2 flex overflow-x-auto">
                {additionalImages.map((img) => (
                  <div key={img.id} className="w-20 h-20 relative flex-shrink-0 mr-2">
                    <Image
                      src={img.url}
                      alt={`${product.name} - imagen adicional`}
                      fill
                      style={{ objectFit: "cover" }}
                      className="rounded"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="md:w-1/2 p-6">
            <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
            <p className="text-xl font-semibold text-blue-600 mb-4">${(product.price / 100).toFixed(2)}</p>

            {product.category && <p className="text-sm text-gray-500 mb-4">Categoría: {product.category}</p>}

            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Descripción</h2>
              <p className="text-gray-700">{product.description || "Sin descripción disponible"}</p>
            </div>

            {product.stock > 0 ? (
              <>
                <p className="text-sm text-green-600 mb-4">En stock: {product.stock} unidades</p>

                <div className="flex items-center mb-6">
                  <span className="mr-3">Cantidad:</span>
                  <div className="flex items-center border rounded">
                    <button
                      className="px-3 py-1 bg-gray-100"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={isLoading}
                    >
                      -
                    </button>
                    <span className="px-4 py-1">{quantity}</span>
                    <button
                      className="px-3 py-1 bg-gray-100"
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={isLoading}
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  className={`w-full py-2 px-4 rounded ${
                    isLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                  onClick={handleAddToCart}
                  disabled={isLoading}
                >
                  {isLoading ? "Agregando..." : "Agregar al carrito"}
                </button>
              </>
            ) : (
              <p className="text-red-600 font-semibold">Producto no disponible</p>
            )}

            {hasQr && (
              <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                <p className="text-center">Este producto tiene un código QR asociado.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

