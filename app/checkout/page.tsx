"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { getUserCart } from "@/lib/cart"
import { createOrder } from "@/lib/orders"
import RouteGuard from "@/components/auth/route-guard"
import LoadingSpinner from "@/components/ui/loading-spinner"

interface CartItem {
  id: string
  quantity: number
  product_id: string
  products: {
    id: string
    name: string
    price: number
  }
}

export default function CheckoutPage() {
  const router = useRouter()
  const { user, profile } = useAuth()

  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Datos de envío
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [phone, setPhone] = useState("")

  useEffect(() => {
    async function loadCart() {
      if (!user) return

      try {
        setIsLoading(true)
        const result = await getUserCart(user.id)

        if (result.success) {
          if (!result.data || result.data.length === 0) {
            // Si el carrito está vacío, redirigir al carrito
            router.push("/cart")
            return
          }

          setCartItems(result.data)
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
  }, [user, router])

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + item.products.price * item.quantity
    }, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    try {
      setIsProcessing(true)
      setError(null)

      const total = calculateTotal()
      const result = await createOrder(user.id, cartItems, total)

      if (result.success) {
        router.push(`/orders/${result.data.id}`)
      } else {
        setError(result.error || "Error al procesar el pedido")
      }
    } catch (err) {
      console.error("Error al procesar el pedido:", err)
      setError("Error inesperado al procesar el pedido")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <RouteGuard requireAuth>
      <div className="container mx-auto p-4">
        <h1 className="mb-6 text-2xl font-bold">Checkout</h1>

        {isLoading ? (
          <div className="flex justify-center">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <div className="rounded-lg bg-white p-6 shadow-md">
                <h2 className="mb-4 text-lg font-semibold">Información de Envío</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Nombre Completo
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={profile?.full_name || ""}
                      disabled
                      className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 shadow-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Correo Electrónico
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={profile?.email || ""}
                      disabled
                      className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 shadow-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                      Dirección
                    </label>
                    <input
                      id="address"
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                        Ciudad
                      </label>
                      <input
                        id="city"
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
                        Código Postal
                      </label>
                      <input
                        id="postalCode"
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Teléfono
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full rounded-md bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {isProcessing ? "Procesando..." : "Completar Pedido"}
                  </button>
                </form>
              </div>
            </div>

            <div>
              <div className="rounded-lg bg-white p-6 shadow-md">
                <h2 className="mb-4 text-lg font-semibold">Resumen del Pedido</h2>

                <ul className="mb-4 divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <li key={item.id} className="py-2">
                      <div className="flex justify-between">
                        <div>
                          <span className="font-medium">{item.products.name}</span>
                          <span className="ml-2 text-gray-600">x{item.quantity}</span>
                        </div>
                        <span>${(item.products.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Envío</span>
                    <span>Gratis</span>
                  </div>
                </div>

                <div className="my-4 border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => router.push("/cart")}
                  className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Volver al Carrito
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RouteGuard>
  )
}

