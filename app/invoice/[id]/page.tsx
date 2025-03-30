import { notFound } from "next/navigation"
import { getServerClient } from "@/lib/supabase-client-server"
import InvoiceDetail from "./invoice-detail"

interface InvoicePageProps {
  params: {
    id: string
  }
}

export default async function InvoicePage({ params }: InvoicePageProps) {
  try {
    const supabase = getServerClient()

    // Obtener la orden
    const { data: order, error } = await supabase
      .from("orders")
      .select(`
        *,
        user:user_id(
          id,
          email,
          profiles:profiles(*)
        ),
        order_items:order_items(
          *,
          product:products(*)
        )
      `)
      .eq("id", params.id)
      .single()

    if (error || !order) {
      console.error("Error loading invoice:", error)
      return notFound()
    }

    return (
      <div className="container mx-auto py-8 px-4">
        <InvoiceDetail order={order} />
      </div>
    )
  } catch (error) {
    console.error("Error loading invoice:", error)
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-red-500">Error cargando la factura. Por favor intente nuevamente.</p>
      </div>
    )
  }
}

