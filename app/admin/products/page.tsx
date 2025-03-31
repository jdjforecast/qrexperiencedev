import { getServerClient } from "@/lib/supabase-client-server"
import { getCurrentUser } from "@/lib/auth-utils"
import { redirect } from "next/navigation"
import ProductsList from "./products-list"

export default async function AdminProductsPage() {
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

  // Obtener productos
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, price, category, stock, created_at")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching products:", error)
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>No se pudieron cargar los productos. Por favor, intenta de nuevo más tarde.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Administración de Productos</h1>
      <ProductsList initialProducts={products || []} />
    </div>
  )
}

