import type { Metadata } from "next"
import AdminDashboardClient from "./admin-dashboard-client"

export const metadata: Metadata = {
  title: "Panel de Administración",
  description: "Gestiona productos, usuarios y pedidos",
}

export default function AdminDashboard() {
  return <AdminDashboardClient />
}

