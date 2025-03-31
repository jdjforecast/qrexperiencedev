"use client"

import { useState } from "react"
import { Search, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { updateOrderStatus } from "@/lib/admin-client"

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

interface OrdersTableProps {
  initialOrders: Order[]
}

export default function OrdersTable({ initialOrders }: OrdersTableProps) {
  const [orders, setOrders] = useState(initialOrders)
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const filteredOrders = orders.filter((order) => {
    if (!searchTerm) return true

    const searchLower = searchTerm.toLowerCase()
    const orderId = order.id?.toLowerCase() || ""
    const userName = order.user?.full_name?.toLowerCase() || ""
    const userEmail = order.user?.email?.toLowerCase() || ""

    return orderId.includes(searchLower) || userName.includes(searchLower) || userEmail.includes(searchLower)
  })

  const handleMarkAsCompleted = async (orderId: string) => {
    setIsLoading(true)
    const result = await updateOrderStatus(orderId, "completed")
    setIsLoading(false)

    if (result.success) {
      setOrders((currentOrders) =>
        currentOrders.map((order) => (order.id === orderId ? { ...order, status: "completed" } : order)),
      )
      toast({
        title: "Pedido actualizado",
        description: "El pedido ha sido marcado como completado",
      })
    } else {
      console.error("Error updating order status:", result.error)
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error || "No se pudo actualizar el pedido",
      })
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar pedidos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

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
              <th className="py-2 px-4 border-b text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
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
                  <td className="py-2 px-4 border-b">
                    {order.status !== "completed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-green-900/30 border-green-500/30 hover:bg-green-900/50 hover:border-green-500/50"
                        onClick={() => handleMarkAsCompleted(order.id)}
                        disabled={isLoading}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Completar
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500">
                  {searchTerm
                    ? "No se encontraron pedidos que coincidan con la búsqueda"
                    : "No hay pedidos para mostrar"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
} 