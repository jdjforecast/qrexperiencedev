"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, Eye, CheckCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getCurrentUser, isUserAdmin } from "@/lib/auth"
import { updateOrderStatus } from "@/lib/orders"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { AdminOrder } from "@/types/order"

export default function AdminOrdersPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [isUserAdminState, setIsUserAdminState] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function checkAdminAndLoadOrders() {
      setIsLoading(true)
      let isAdminCheck = false;
      try {
        const user = await getCurrentUser()
        if (!user) {
          router.push("/login")
          return
        }
        setUserId(user.id)
        isAdminCheck = await isUserAdmin(user.id)
        setIsUserAdminState(isAdminCheck)
        if (!isAdminCheck) {
          router.push("/")
          return
        }
        
        const response = await fetch("/api/orders")
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
        }
        const data: AdminOrder[] = await response.json()
        setOrders(data)

      } catch (err) {
        console.error("Error in admin orders page setup:", err)
        const message = err instanceof Error ? err.message : "An unexpected error occurred"
        toast({
          variant: "destructive",
          title: "Error",
          description: isAdminCheck ? message : "Authentication failed",
        })
        setOrders([])
      } finally {
        setIsLoading(false)
      }
    }

    checkAdminAndLoadOrders()
  }, [router, toast])

  const filteredOrders = orders.filter((order) => {
    if (!searchTerm) return true

    const searchLower = searchTerm.toLowerCase()
    const orderId = order.order_id?.toLowerCase() || ""
    const userName = order.user?.full_name?.toLowerCase() || ""
    const userEmail = order.user?.email?.toLowerCase() || ""

    return (
      orderId.includes(searchLower) ||
      userName.includes(searchLower) ||
      userEmail.includes(searchLower)
    )
  })

  const markAsCompleted = async (orderId: string) => {
    setIsLoading(true)
    const result = await updateOrderStatus(orderId, "completed")
    setIsLoading(false)

    if (result.success && result.data) {
      setOrders(currentOrders => 
        currentOrders.map(order => 
          order.order_id === orderId ? { ...order, ...result.data } : order
        )
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
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-900/50 backdrop-blur-md border-b border-white/10 p-4 flex items-center">
        <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.push("/admin")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Gestión de Pedidos</h1>
      </header>

      <main className="flex-1 p-4 pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <h2 className="text-2xl font-bold">Pedidos</h2>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar pedidos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full sm:w-64 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-3 px-4">ID Pedido</th>
                  <th className="text-left py-3 px-4">Usuario</th>
                  <th className="text-left py-3 px-4">Fecha</th>
                  <th className="text-left py-3 px-4">Total</th>
                  <th className="text-left py-3 px-4">Estado</th>
                  <th className="text-right py-3 px-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <motion.tr
                      key={order.order_id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="border-b border-white/10 hover:bg-white/5"
                    >
                      <td className="py-3 px-4">{order.order_id.substring(0, 8)}...</td>
                      <td className="py-3 px-4">
                        {order.user?.email || "Desconocido"}
                        {order.user?.full_name && ` (${order.user.full_name})`}
                      </td>
                      <td className="py-3 px-4">{new Date(order.created_at).toLocaleDateString()}</td>
                      <td className="py-3 px-4">${order.total_amount?.toFixed(2) ?? 'N/A'}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs ${
                            order.status === "completed"
                              ? "bg-green-500/20 text-green-300"
                              : "bg-yellow-500/20 text-yellow-300"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {order.status !== "completed" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-green-900/30 border-green-500/30 hover:bg-green-900/50 hover:border-green-500/50"
                            onClick={() => markAsCompleted(order.order_id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Completar
                          </Button>
                        )}
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-white/70">
                      {searchTerm
                        ? "No se encontraron pedidos que coincidan con la búsqueda"
                        : "No hay pedidos para mostrar"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}

