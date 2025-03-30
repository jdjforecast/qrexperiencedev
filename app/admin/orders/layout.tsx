import type React from "react"
export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Gestión de Órdenes</h1>
        <p className="text-gray-500">Administra las órdenes de los usuarios.</p>
      </div>
      {children}
    </div>
  )
}

