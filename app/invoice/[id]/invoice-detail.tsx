"use client"

import { useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Printer } from "lucide-react"

interface OrderItem {
  id: string
  quantity: number
  price: number
  product: {
    id: string
    name: string
    description: string
    price: number
    image_url?: string
  }
}

interface Order {
  id: string
  created_at: string
  status: string
  total: number
  user: {
    id: string
    email: string
    profiles: {
      id: string
      full_name?: string
      company_name?: string
      role: string
    } | null
  }
  order_items: OrderItem[]
}

export default function InvoiceDetail({ order }: { order: Order }) {
  const invoiceRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const handlePrint = () => {
    window.print()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center print:hidden">
        <Link href="/scan" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver a Escanear
        </Link>

        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center bg-gray-100 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-200"
          >
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </button>
        </div>
      </div>

      <div ref={invoiceRef} className="bg-white rounded-lg shadow-md p-8 max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold">FACTURA</h1>
            <p className="text-gray-600">#{order.id.substring(0, 8).toUpperCase()}</p>
          </div>

          <div className="text-right">
            <h2 className="text-xl font-bold">QR Experience</h2>
            <p className="text-gray-600">Fecha: {formatDate(order.created_at)}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-gray-700 mb-2">Facturado a:</h3>
            <p className="font-medium">{order.user.profiles?.full_name || "N/A"}</p>
            <p>{order.user.profiles?.company_name || "N/A"}</p>
            <p>{order.user.email}</p>
          </div>

          <div>
            <h3 className="font-bold text-gray-700 mb-2">Detalles de la Orden:</h3>
            <p>
              <span className="font-medium">Orden ID:</span> #{order.id.substring(0, 8).toUpperCase()}
            </p>
            <p>
              <span className="font-medium">Fecha:</span> {formatDate(order.created_at)}
            </p>
            <p>
              <span className="font-medium">Estado:</span> {order.status === "completed" ? "Completada" : "Pendiente"}
            </p>
          </div>
        </div>

        <table className="w-full mb-8">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="py-2 text-left">Producto</th>
              <th className="py-2 text-center">Cantidad</th>
              <th className="py-2 text-right">Precio</th>
              <th className="py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.order_items.map((item) => (
              <tr key={item.id} className="border-b border-gray-200">
                <td className="py-4">
                  <div className="font-medium">{item.product.name}</div>
                  <div className="text-sm text-gray-600">{item.product.description.substring(0, 60)}...</div>
                </td>
                <td className="py-4 text-center">{item.quantity}</td>
                <td className="py-4 text-right">${item.price.toFixed(2)}</td>
                <td className="py-4 text-right">${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mb-8">
          <div className="w-64">
            <div className="flex justify-between py-2">
              <span className="font-medium">Subtotal:</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 border-t border-gray-200">
              <span className="font-bold">Total:</span>
              <span className="font-bold">${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="text-center text-gray-600 border-t border-gray-200 pt-8">
          <p>Gracias por tu compra</p>
        </div>
      </div>
    </div>
  )
}

