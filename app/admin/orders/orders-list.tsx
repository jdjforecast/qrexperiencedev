"use client"

import { useEffect, useState } from "react"
import { getBrowserClient } from "@/lib/supabase-client-browser"

interface Order {
  id: string
  user_id: string
  total_coins: number
  status: string
  created_at: string
  user?: {
    email: string
    full_name: string
  }
  order_items?: OrderItem[]
}

interface OrderItem {
  id: string
  product_name: string
  quantity: number
  price: number
}

interface OrdersListProps {
  initialOrders: Order[]
}

export default function OrdersList({ initialOrders }: OrdersListProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshOrders = async () => {
    try {
      setLoading(true)
      const supabase = getBrowserClient()

      // Obtener órdenes con información de usuario y productos
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          user:users(email, full_name),
          order_items(id, product_name, quantity, price)
        `)
        .order("created_at", { ascending: false })

      if (error) throw error

      setOrders(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar las órdenes")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={refreshOrders}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Actualizando..." : "Actualizar"}
        </button>
      </div>

      {error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b text-left">ID</th>
                <th className="py-2 px-4 border-b text-left">Usuario</th>
                <th className="py-2 px-4 border-b text-left">Total</th>
                <th className="py-2 px-4 border-b text-left">Estado</th>
                <th className="py-2 px-4 border-b text-left">Fecha</th>
                <th className="py-2 px-4 border-b text-left">Productos</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{order.id.substring(0, 8)}...</td>
                  <td className="py-2 px-4 border-b">
                    {order.user ? (
                      <div>
                        <div>{order.user.full_name}</div>
                        <div className="text-sm text-gray-500">{order.user.email}</div>
                      </div>
                    ) : (
                      <span className="text-gray-500">Usuario no encontrado</span>
                    )}
                  </td>
                  <td className="py-2 px-4 border-b">{order.total_coins} monedas</td>
                  <td className="py-2 px-4 border-b">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        order.status === "completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {order.status === "completed" ? "Completado" : "Pendiente"}
                    </span>
                  </td>
                  <td className="py-2 px-4 border-b">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="py-2 px-4 border-b">
                    {order.order_items && order.order_items.length > 0 ? (
                      <ul className="list-disc pl-5">
                        {order.order_items.map((item) => (
                          <li key={item.id}>
                            {item.product_name} x{item.quantity} ({item.price} monedas)
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-gray-500">Sin productos</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

