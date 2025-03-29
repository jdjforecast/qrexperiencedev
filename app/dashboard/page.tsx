"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase-client"
import DashboardLayout from "@/components/dashboard/DashboardLayout"
import { getUserProfile } from "@/lib/user-service"
import { useToast } from "@/components/ui/use-toast"

export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState(null)

  useEffect(() => {
    async function loadUserData() {
      try {
        const supabase = createBrowserClient()
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          router.push("/login")
          return
        }

        const userProfile = await getUserProfile(session.user.id)
        setUserData(userProfile)
      } catch (error) {
        console.error("Error al cargar datos del usuario:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos del usuario",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [router, toast])

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Cargando...</div>
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <h1 className="mb-6 text-2xl font-bold">Panel de Control</h1>
        {userData && (
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold">Bienvenido, {userData.full_name || "Usuario"}</h2>
            <p className="text-gray-600">Correo: {userData.email}</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

