"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { getOrderById } from "@/lib/orders"
import RouteGuard from "@/components/auth/route-guard"
import LoadingSpinner from "@/components/ui/loading-spinner"

interface OrderItem {
  id: string
  quantity: number
  price: number
  product_id: string
  products: {
    id: string
    name: string
    image_url: string | null
    code: string
  }
}

interface Order {
  id: string
  created_at: string
  status: string
  total: number
  order_items: OrderItem[]
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()

  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadOrder() {
      if (!user || !id) return

      try {
        setIsLoading(true)
        const result = await getOrderById(id as string)

        if (result.success) {
          setOrder(result.data)
        } else {
          setError(result.error || "Error al cargar el pedido")
        }
      } catch (err) {
        console.error("Error al cargar el pedido:", err)
        setError("Error inesperado al cargar el pedido")
      } finally {
        setIsLoading(false)
      }
    }

    loadOrder()
  }, [id, user])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente"
      case "processing":
        return "En Proceso"
      case "completed":
        return "Completado"
      case "cancelled":
        return "Cancelado"
      default:
        return status
    }
  }

  return (
    <RouteGuard requireAuth>
      <div className="container mx-auto p-4">
        <h1 className="mb-6 text-2xl font-bold">Detalles del Pedido</h1>

        {isLoading ? (
          <div className="flex justify-center">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>
        ) : !order ? (
          <div className="rounded-md bg-yellow-50 p-4 text-sm text-yellow-700">Pedido no encontrado</div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="overflow-hidden rounded-lg bg-white shadow-md">
                <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                  <div className="flex flex-wrap items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold">Pedido #{order.id.substring(0, 8)}</h2>
                      <p className="text-sm text-gray-600">Realizado el {formatDate(order.created_at)}</p>
                    </div>
                    <span
                      className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusBadgeClass(order.status)}`}
                    >
                      {getStatusText(order.status)}
                    </span>
                  </div>
                </div>

                <ul className="divide-y divide-gray-200">
                  {order.order_items.map((item) => (
                    <li key={item.id} className="p-4">
                      <div className="flex items-center space-x-4">
                        <div className="relative h-16 w-16 flex-shrink-0">
                          {item.products.image_url ? (
                            <Image
                              src={item.products.image_url || "/placeholder.svg"}
                              alt={item.products.name}
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
                          <p className="truncate text-sm font-medium text-gray-900">{item.products.name}</p>
                          <p className="text-sm text-gray-500">Código: {item.products.code}</p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">${item.price.toFixed(2)}</p>
                          <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <div className="rounded-lg bg-white p-6 shadow-md">
                <h2 className="mb-4 text-lg font-semibold">Resumen del Pedido</h2>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Envío</span>
                    <span>Gratis</span>
                  </div>
                </div>

                <div className="my-4 border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => router.push("/orders")}
                  className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Volver a Mis Pedidos
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

