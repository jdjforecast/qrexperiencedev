"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { addToCart } from "@/lib/cart"
import LoadingSpinner from "@/components/ui/loading-spinner" // Assuming this exists

// Define the Product type matching the one in page.tsx
interface Product {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  stock: number
  code: string // Added code based on original page structure, ensure it's passed if needed
}

interface ProductDetailsClientProps {
  product: Product
}

export default function ProductDetailsClient({ product }: ProductDetailsClientProps) {
  const router = useRouter()
  const { user } = useAuth() // Assuming useAuth provides the user object with an id

  const [addingToCart, setAddingToCart] = useState(false)
  const [cartMessage, setCartMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Note: Removed the useEffect that re-fetched the product,
  // as the product data is now passed via props from the server component.
  // Also removed isLoading and error states related to initial fetch.

  const handleAddToCart = async () => {
    if (!user || !product) return

    // Check if user object has an id property
    if (!user.id) {
       console.error("User ID not found in auth context");
       setCartMessage({ type: "error", text: "Error de autenticación al agregar al carrito." });
       return;
    }

    try {
      setAddingToCart(true)
      setCartMessage(null)

      // Ensure addToCart function signature matches its definition
      const result = await addToCart(user.id, product.id) // Assuming addToCart takes userId and productId

      if (result.success) {
        setCartMessage({
          type: "success",
          text: "Producto agregado al carrito correctamente",
        })

        // Optional: redirect after delay
        setTimeout(() => {
          // Consider redirecting only if the component is still mounted
          // Or perhaps show a persistent success message and a link to the cart
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

  // Initial error/loading state is handled by the parent Server Component (page.tsx)
  // We assume if this component renders, the product exists.

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="relative min-h-[300px]">
          {product.image_url ? (
            <Image
              src={product.image_url || "/placeholder.svg"} // Keep placeholder
              alt={product.name}
              fill
              priority // Add priority for LCP image
              sizes="(max-width: 768px) 100vw, 50vw" // Add sizes attribute
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
              disabled={addingToCart || product.stock <= 0 || !user} // Disable if not logged in
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {!user ? "Inicia sesión para comprar" : addingToCart ? "Agregando..." : product.stock <= 0 ? "Agotado" : "Agregar al Carrito"}
            </button>

            <button
              onClick={() => router.push("/products")} // Assuming /products is the catalog page
              className="mt-4 w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Volver al Catálogo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 