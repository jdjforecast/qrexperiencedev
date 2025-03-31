import { getServerClient } from "@/lib/supabase-client-server"
import { getCurrentUser } from "@/lib/auth-utils"
import { redirect } from "next/navigation"
import OrdersTable from "./orders-table"

export default async function AdminOrdersPage() {
  const supabase = getServerClient()
  const user = await getCurrentUser(supabase)

  if (!user) {
    redirect("/login")
  }

  // Verificar si el usuario es admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile || profile.role !== "admin") {
    redirect("/")
  }

  // Obtener órdenes con información de usuario y productos
  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      *,
      user:users(email, full_name),
      order_items(id, product_name, quantity, price)
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching orders:", error)
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>No se pudieron cargar las órdenes. Por favor, intenta de nuevo más tarde.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Administración de Órdenes</h1>
      <OrdersTable initialOrders={orders || []} />
    </div>
  )
}

