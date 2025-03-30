"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Package, Users, ShoppingCart, BarChart3, QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { getBrowserClient } from "@/lib/supabase-client-browser"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth/AuthProvider"
import Link from "next/link"

interface AdminDashboardProps {
  userProfile: any
}

export function AdminDashboard({ userProfile }: AdminDashboardProps) {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    const fetchAdminStats = async () => {
      if (!user?.id) return

      try {
        setIsLoading(true)
        const supabase = getBrowserClient()

        // Obtener estadísticas de usuarios
        const { count: usersCount, error: usersError } = await supabase
          .from("users")
          .select("*", { count: "exact", head: true })

        if (usersError) throw usersError

        // Obtener estadísticas de pedidos
        const { count: ordersCount, error: ordersError } = await supabase
          .from("orders")
          .select("*", { count: "exact", head: true })

        if (ordersError) throw ordersError

        // Obtener estadísticas de productos
        const { count: productsCount, error: productsError } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true })

        if (productsError) throw productsError

        // Obtener estadísticas de códigos QR
        const { count: qrCodesCount, error: qrCodesError } = await supabase
          .from("qr_codes")
          .select("*", { count: "exact", head: true })

        if (qrCodesError) throw qrCodesError

        // Agregar todas las estadísticas
        setStats({
          usersCount: usersCount || 0,
          ordersCount: ordersCount || 0,
          productsCount: productsCount || 0,
          qrCodesCount: qrCodesCount || 0,
        })
      } catch (error: any) {
        console.error("Error fetching admin stats:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar las estadísticas del administrador",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAdminStats()
  }, [user, toast])

  // Enlaces rápidos para el panel de administración
  const adminLinks = [
    {
      title: "Productos",
      description: "Gestionar productos y catálogo",
      href: "/admin/products",
      icon: Package,
    },
    {
      title: "Códigos QR",
      description: "Generar y gestionar QR",
      href: "/admin/qr-codes",
      icon: QrCode,
    },
    {
      title: "Usuarios",
      description: "Gestionar usuarios",
      href: "/admin/users",
      icon: Users,
    },
    {
      title: "Pedidos",
      description: "Ver pedidos recientes",
      href: "/admin/orders",
      icon: ShoppingCart,
    },
  ]

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
              <h2 className="text-2xl font-bold mb-2">Panel de Administración</h2>
              <p className="text-blue-200 mb-4">Gestiona usuarios, productos y más desde aquí</p>
            </div>
            <Button
              className="bg-[#0033A0] hover:bg-[#0055B8] transition-all duration-300"
              onClick={() => router.push("/admin")}
            >
              Panel Completo
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Estadísticas rápidas */}
      <section className="mb-8">
        <h3 className="text-xl font-bold mb-4">Resumen</h3>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6"
            >
              <div className="flex items-center mb-2">
                <Users className="h-5 w-5 mr-2 text-blue-300" />
                <h3 className="text-lg font-medium">Usuarios</h3>
              </div>
              <p className="text-3xl font-bold">{stats.usersCount}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6"
            >
              <div className="flex items-center mb-2">
                <ShoppingCart className="h-5 w-5 mr-2 text-blue-300" />
                <h3 className="text-lg font-medium">Pedidos</h3>
              </div>
              <p className="text-3xl font-bold">{stats.ordersCount}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6"
            >
              <div className="flex items-center mb-2">
                <Package className="h-5 w-5 mr-2 text-blue-300" />
                <h3 className="text-lg font-medium">Productos</h3>
              </div>
              <p className="text-3xl font-bold">{stats.productsCount}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6"
            >
              <div className="flex items-center mb-2">
                <QrCode className="h-5 w-5 mr-2 text-blue-300" />
                <h3 className="text-lg font-medium">Códigos QR</h3>
              </div>
              <p className="text-3xl font-bold">{stats.qrCodesCount}</p>
            </motion.div>
          </div>
        ) : (
          <div className="text-center py-8 backdrop-blur-md bg-white/5 border border-white/10 rounded-xl">
            <BarChart3 className="h-10 w-10 mx-auto mb-2 text-blue-200/50" />
            <p>No se pudieron cargar las estadísticas</p>
          </div>
        )}
      </section>

      {/* Acciones rápidas */}
      <section className="mb-8">
        <h3 className="text-xl font-bold mb-4">Acciones rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {adminLinks.map((link) => {
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex flex-col items-center justify-center h-24 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-300 p-4"
              >
                <Icon className="h-6 w-6 mb-2" />
                <span className="text-center">{link.title}</span>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}

