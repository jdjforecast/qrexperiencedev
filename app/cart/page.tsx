"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/components/auth/AuthProvider"
import { getUserCart, removeFromCart, updateCartItem } from "@/lib/cart"
import RouteGuard from "@/components/auth/route-guard"
import LoadingSpinner from "@/components/ui/loading-spinner"
import type { CartItem, ProductData } from "@/types/cart"

export default function CartPage() {
  const router = useRouter()
  const { user } = useAuth()

  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    async function loadCart() {
      if (!user) return

      try {
        setIsLoading(true)
        const result = await getUserCart(user.id)

        if (result.success) {
            const formattedData = (result.data || []).map(item => ({
                ...item,
                products: Array.isArray(item.products) ? item.products : (item.products ? [item.products] : null)
            })) as CartItem[];
          setCartItems(formattedData)
        } else {
          setError(result.error || "Error al cargar el carrito")
        }
      } catch (err) {
        console.error("Error al cargar el carrito:", err)
        setError("Error inesperado al cargar el carrito")
      } finally {
        setIsLoading(false)
      }
    }

    loadCart()
  }, [user])

  const handleRemoveItem = async (itemId: string) => {
    if (isUpdating) return

    try {
      setIsUpdating(true)
      const result = await removeFromCart(itemId)

      if (result.success) {
        setCartItems(cartItems.filter((item) => item.id !== itemId))
      } else {
        setError(result.error || "Error al eliminar el producto del carrito")
      }
    } catch (err) {
      console.error("Error al eliminar del carrito:", err)
      setError("Error inesperado al eliminar el producto del carrito")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (isUpdating || newQuantity < 1) return

    try {
      setIsUpdating(true)
      const result = await updateCartItem(itemId, newQuantity)

      if (result.success) {
        setCartItems(cartItems.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item)))
      } else {
        setError(result.error || "Error al actualizar la cantidad")
      }
    } catch (err) {
      console.error("Error al actualizar la cantidad:", err)
      setError("Error inesperado al actualizar la cantidad")
    } finally {
      setIsUpdating(false)
    }
  }

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const product = item.products?.[0];
      if (!product) return total;
      return total + product.price * item.quantity
    }, 0)
  }

  return (
    <RouteGuard requireAuth>
      <div className="container mx-auto p-4">
        <h1 className="mb-6 text-2xl font-bold">Tu Carrito</h1>

        {isLoading ? (
          <div className="flex justify-center">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>
        ) : cartItems.length === 0 ? (
          <div className="rounded-lg bg-white p-6 text-center shadow-md">
            <p className="mb-4 text-lg text-gray-600">Tu carrito está vacío</p>
            <button
              onClick={() => router.push("/products")}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Ver Catálogo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="overflow-hidden rounded-lg bg-white shadow-md">
                <ul className="divide-y divide-gray-200">
                  {cartItems.map((item) => {
                    const product = item.products?.[0];

                    return (
                    <li key={item.id} className="p-4">
                      <div className="flex items-center space-x-4">
                        <div className="relative h-16 w-16 flex-shrink-0">
                          {product?.image_url ? (
                            <Image
                              src={product.image_url || "/placeholder.svg"}
                              alt={product.name || "Producto"}
                              fill
                              className="rounded-md object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center rounded-md bg-gray-200">
                              <span className="text-xs text-gray-500">Sin imagen</span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium text-gray-900">{product?.name || "Producto Desconocido"}</p>
                          <p className="text-sm text-gray-500">${(product?.price || 0).toFixed(2)}</p>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="flex items-center border rounded">
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1 || isUpdating}
                              className="px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                            >
                              -
                            </button>
                            <span className="px-2 py-1">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              disabled={isUpdating || !product || item.quantity >= product.stock}
                              className="px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={isUpdating}
                            className="text-red-600 hover:text-red-800 disabled:opacity-50"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="rounded-lg bg-white p-6 shadow-md">
                <h2 className="mb-4 text-lg font-semibold">Resumen del Pedido</h2>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Envío</span>
                    <span>Calculado en el checkout</span>
                  </div>
                </div>

                <div className="my-4 border-t border-gray-200 pt-4">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => router.push("/checkout")}
                  className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Proceder al Checkout
                </button>

                <button
                  onClick={() => router.push("/products")}
                  className="mt-4 w-full rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Continuar Comprando
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RouteGuard>
  )
}

