"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { ShoppingCart, Trash, ChevronLeft, Plus, Minus } from "lucide-react"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image_url?: string
}

export default function SimpleCartPage() {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Cargar el carrito
    const cartJson = localStorage.getItem("cart")
    if (cartJson) {
      setItems(JSON.parse(cartJson))
    }
    setLoading(false)
  }, [])

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return

    const updatedItems = items.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item))

    setItems(updatedItems)
    localStorage.setItem("cart", JSON.stringify(updatedItems))
  }

  const removeItem = (id: string) => {
    const updatedItems = items.filter((item) => item.id !== id)
    setItems(updatedItems)
    localStorage.setItem("cart", JSON.stringify(updatedItems))

    toast({
      title: "Producto eliminado",
      description: "El producto ha sido eliminado del carrito",
    })
  }

  const clearCart = () => {
    setItems([])
    localStorage.removeItem("cart")

    toast({
      title: "Carrito vacío",
      description: "El carrito ha sido vaciado",
    })
  }

  const checkout = () => {
    toast({
      title: "Proceso de pago",
      description: "Funcionalidad de pago en desarrollo",
    })
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link href="/" className="flex items-center text-blue-600 hover:text-blue-800">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Volver
          </Link>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold mb-8 flex items-center">
          <ShoppingCart className="h-6 w-6 mr-2" />
          Carrito de Compras
        </h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="flex justify-center mb-4">
              <ShoppingCart className="h-16 w-16 text-gray-300" />
            </div>
            <h2 className="text-xl font-medium mb-4">Tu carrito está vacío</h2>
            <p className="text-gray-500 mb-6">Parece que no has añadido ningún producto a tu carrito todavía.</p>
            <Link href="/">
              <Button className="px-6">Explorar productos</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-4 bg-gray-50 border-b">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-medium">
                      {items.length} {items.length === 1 ? "Producto" : "Productos"}
                    </h2>
                    <Button
                      variant="ghost"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={clearCart}
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Vaciar carrito
                    </Button>
                  </div>
                </div>

                <div className="divide-y">
                  {items.map((item) => (
                    <div key={item.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center">
                      <div className="flex-shrink-0 w-full sm:w-auto mb-4 sm:mb-0">
                        {item.image_url ? (
                          <img
                            src={item.image_url || "/placeholder.svg"}
                            alt={item.name}
                            className="w-full sm:w-24 h-24 object-cover rounded"
                          />
                        ) : (
                          <div className="w-full sm:w-24 h-24 bg-gray-200 flex items-center justify-center rounded">
                            <ShoppingCart className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>

                      <div className="flex-grow px-4">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-gray-500 text-sm mb-2">ID: {item.id}</p>
                        <p className="font-medium">{formatCurrency(item.price)}</p>
                      </div>

                      <div className="flex flex-col items-end">
                        <div className="flex items-center mb-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="mx-3 w-6 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash className="h-4 w-4 mr-1" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="md:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <h2 className="text-lg font-medium mb-4">Resumen</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Envío</span>
                    <span>Gratis</span>
                  </div>
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>

                <Button className="w-full" onClick={checkout}>
                  Proceder al pago
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

