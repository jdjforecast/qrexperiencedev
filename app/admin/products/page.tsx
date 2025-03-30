import { Suspense } from "react"
import { requireAdmin } from "@/lib/auth"
import { MostPurchasedChart } from "@/app/admin/products/most-purchased-chart"
import Loading from "@/app/admin/products/loading"

export default async function ProductsPage() {
  // Verificar que el usuario es administrador
  await requireAdmin()

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Gestión de Productos</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Suspense fallback={<Loading />}>
          <MostPurchasedChart />
        </Suspense>

        {/* Aquí irían más componentes relacionados con productos */}
      </div>
    </div>
  )
}

