"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ShoppingCart, QrCode, CreditCard, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CoinBalance } from "@/components/ui/coin-balance"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { getBrowserClient } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth/AuthProvider"

interface UserDashboardProps {
  userProfile: any
}

export function UserDashboard({ userProfile }: UserDashboardProps) {
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [recentScans, setRecentScans] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    const fetchUserActivity = async () => {
      if (!user?.id) return

      try {
        setIsLoading(true)
        const supabase = getBrowserClient()

        // Obtener órdenes recientes
        const { data: orders, error: ordersError } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5)

        if (ordersError) throw ordersError
        setRecentOrders(orders || [])

        // Obtener escaneos recientes
        const { data: scans, error: scansError } = await supabase
          .from("scanned_qr_codes")
          .select("*")
          .eq("user_id", user.id)
          .order("scanned_at", { ascending: false })
          .limit(5)

        if (scansError) throw scansError
        setRecentScans(scans || [])
      } catch (error: any) {
        console.error("Error fetching user activity:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo cargar la actividad reciente",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserActivity()
  }, [user, toast])

  return (
    <div className="w-full">
      {/* Cabecera de bienvenida */}
      <section className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Bienvenido, {userProfile.full_name || "Usuario"}</h2>
              <p className="text-blue-200 mb-4">Aquí puedes ver tu actividad reciente y gestionar tu perfil</p>
            </div>
            <CoinBalance coins={userProfile.coins || 0} size="lg" />
          </div>
        </motion.div>
      </section>

      {/* Acciones rápidas */}
      <section className="mb-8">
        <h3 className="text-xl font-bold mb-4">Acciones rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center h-24 bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300"
            onClick={() => router.push("/products")}
          >
            <ShoppingCart className="h-6 w-6 mb-2" />
            <span>Ver Productos</span>
          </Button>

          <Button
            variant="outline"
            className="flex flex-col items-center justify-center h-24 bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300"
            onClick={() => router.push("/scanner")}
          >
            <QrCode className="h-6 w-6 mb-2" />
            <span>Escanear QR</span>
          </Button>

          <Button
            variant="outline"
            className="flex flex-col items-center justify-center h-24 bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300"
            onClick={() => router.push("/cart")}
          >
            <CreditCard className="h-6 w-6 mb-2" />
            <span>Mi Carrito</span>
          </Button>

          <Button
            variant="outline"
            className="flex flex-col items-center justify-center h-24 bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300"
            onClick={() => router.push("/orders")}
          >
            <History className="h-6 w-6 mb-2" />
            <span>Mis Pedidos</span>
          </Button>
        </div>
      </section>

      {/* Tabs para actividad reciente */}
      <section>
        <h3 className="text-xl font-bold mb-4">Actividad reciente</h3>
        <Tabs defaultValue="orders">
          <TabsList className="mb-4 bg-white/10 backdrop-blur-md border border-white/20">
            <TabsTrigger value="orders">Pedidos</TabsTrigger>
            <TabsTrigger value="scans">Escaneos QR</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
              </div>
            ) : recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-4"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Pedido #{order.id.substring(0, 8)}</p>
                      <p className="text-sm text-blue-200">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{order.total_coins} monedas</p>
                      <p className="text-sm text-blue-200">
                        {order.status === "completed" ? "Completado" : "Pendiente"}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 backdrop-blur-md bg-white/5 border border-white/10 rounded-xl">
                <ShoppingCart className="h-10 w-10 mx-auto mb-2 text-blue-200/50" />
                <p>No has realizado ningún pedido aún</p>
                <Button
                  variant="outline"
                  className="mt-4 bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20"
                  onClick={() => router.push("/products")}
                >
                  Ver productos
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="scans" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
              </div>
            ) : recentScans.length > 0 ? (
              recentScans.map((scan) => (
                <motion.div
                  key={scan.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-4"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Código QR #{scan.qr_code_id.substring(0, 8)}</p>
                      <p className="text-sm text-blue-200">{new Date(scan.scanned_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">+{scan.coins_earned} monedas</p>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 backdrop-blur-md bg-white/5 border border-white/10 rounded-xl">
                <QrCode className="h-10 w-10 mx-auto mb-2 text-blue-200/50" />
                <p>No has escaneado ningún código QR aún</p>
                <Button
                  variant="outline"
                  className="mt-4 bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20"
                  onClick={() => router.push("/scanner")}
                >
                  Escanear QR
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>
    </div>
  )
}

