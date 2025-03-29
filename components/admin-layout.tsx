import type { ReactNode } from "react"
import { AppHeader } from "@/components/AppHeader"
import { AppFooter } from "@/components/AppFooter"

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader title="Administración" showBackButton={true} onBackClick={() => window.history.back()} />
      <main className="flex-1">{children}</main>
      <AppFooter activeTab="admin" />
    </div>
  )
}

