"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/components/auth/AuthProvider"
import { getUserOrders } from "@/lib/orders"
import RouteGuard from "@/components/auth/route-guard"
import LoadingSpinner from "@/components/ui/loading-spinner"
import type { Order } from "@/types/order"

export default function OrdersPage() {
  const { user } = useAuth()

  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadOrders() {
      if (!user) return

      try {
        setIsLoading(true)
        const result = await getUserOrders(user.id)

        if (result.success) {
          setOrders(result.data || [])
        } else {
          setError(result.error || "Error al cargar los pedidos")
        }
      } catch (err) {
        console.error("Error al cargar los pedidos:", err)
        setError("Error inesperado al cargar los pedidos")
      } finally {
        setIsLoading(false)
      }
    }

    loadOrders()
  }, [user])

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
        <h1 className="mb-6 text-2xl font-bold">Mis Pedidos</h1>

        {isLoading ? (
          <div className="flex justify-center">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>
        ) : orders.length === 0 ? (
          <div className="rounded-lg bg-white p-6 text-center shadow-md">
            <p className="mb-4 text-lg text-gray-600">No tienes pedidos realizados</p>
            <Link href="/products" className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Ver Catálogo
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg bg-white shadow-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Pedido
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Fecha
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Estado
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Total
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {orders.map((order) => (
                  <tr key={order.order_id}>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="font-medium text-gray-900">#{order.order_id.substring(0, 8)}</span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusBadgeClass(order.status)}`}
                      >
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      ${order.total_amount.toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <Link href={`/orders/${order.order_id}`} className="text-blue-600 hover:text-blue-900">
                        Ver Detalles
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </RouteGuard>
  )
}

