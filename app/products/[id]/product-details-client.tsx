"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/components/auth/AuthProvider"
import { addToCart } from "@/lib/cart"
import LoadingSpinner from "@/components/ui/loading-spinner"

// Icon for placeholder
const ImageIconPlaceholder = () => (
  <svg className="w-16 h-16 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);

// Define the Product type matching the one in page.tsx
interface Product {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  stock: number
  code: string
}

interface ProductDetailsClientProps {
  product: Product
}

export default function ProductDetailsClient({ product }: ProductDetailsClientProps) {
  const router = useRouter()
  const { user } = useAuth()

  const [addingToCart, setAddingToCart] = useState(false)
  const [cartMessage, setCartMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleAddToCart = async () => {
    if (!user || !product || !user.id) {
      console.error("User or product missing, or user ID not found");
      setCartMessage({ type: "error", text: "Error de autenticación o producto no válido." });
      return;
    }

    try {
      setAddingToCart(true)
      setCartMessage(null)

      const result = await addToCart(user.id, product.id)

      if (result.success) {
        setCartMessage({
          type: "success",
          text: "Producto agregado al carrito.",
        })
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
    <div className="overflow-hidden rounded-lg bg-white text-gray-900 shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="relative h-64 min-h-[300px] md:h-auto md:min-h-[450px]">
          {product.image_url ? (
            <Image
              src={product.image_url || "/placeholder.svg"}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-gray-100">
              <ImageIconPlaceholder />
              <span className="mt-2 text-sm text-gray-500">Imagen no disponible</span>
            </div>
          )}
        </div>

        <div className="flex flex-col p-4 sm:p-6 lg:p-8">
          <h1 className="mb-2 text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>

          <div className="mb-4">
            <span className="text-3xl font-bold text-gray-800">${product.price.toFixed(2)}</span>
          </div>

          <div className="mb-4">
            <span
              className={`inline-block rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${
                product.stock > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}
            >
              {product.stock > 0 ? `En stock (${product.stock} disponibles)` : "Agotado"}
            </span>
          </div>

          <div className="mb-5 flex-grow">
            <h2 className="mb-2 text-base font-semibold text-gray-700">Descripción</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{product.description || "Sin descripción disponible"}</p>
          </div>

          {cartMessage && (
            <div
              className={`my-4 rounded-md p-3 text-sm flex justify-between items-center ${
                cartMessage.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              <span>{cartMessage.text}</span>
              {cartMessage.type === 'success' && (
                <Link href="/cart" className="ml-2 flex-shrink-0 underline font-medium text-green-900 hover:text-green-700">Ver carrito</Link>
              )}
            </div>
          )}

          <div className="mt-auto space-y-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleAddToCart}
              disabled={addingToCart || product.stock <= 0 || !user}
              className="w-full rounded-md bg-verde px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-verde focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
            >
              {addingToCart && (
                <span className="mr-2">
                   <LoadingSpinner size="sm" />
                </span>
              )}
              {!user ? "Inicia sesión para comprar" : addingToCart ? "Agregando..." : product.stock <= 0 ? "Agotado" : "Agregar al Carrito"}
            </button>

            <button
              onClick={() => router.push("/products")}
              className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-azul focus:ring-offset-2 transition-colors duration-200"
            >
              Volver al Catálogo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 