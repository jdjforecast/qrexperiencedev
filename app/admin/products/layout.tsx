import type React from "react"
import AuthGuard from "@/components/auth/auth-guard"

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthGuard requireAdmin>{children}</AuthGuard>
}

