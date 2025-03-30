import { requireAdmin } from "@/lib/auth"
import { Suspense } from "react"
import type React from "react"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Verificar que el usuario es administrador
  await requireAdmin()

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div>Cargando...</div>}>{children}</Suspense>
    </div>
  )
}

