"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabaseClient } from "@/lib/supabase/client-utils"
import DashboardLayout from "@/components/dashboard/DashboardLayout"
import { getUserProfile } from "@/lib/user-service"
import { useAuth } from "@/components/auth/AuthProvider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadUserData() {
      try {
        const { data: { session } } = await supabaseClient.auth.getSession()

        if (!session) {
          router.push("/login")
          return
        }

        const userProfile = await getUserProfile(session.user.id)
        setUserData(userProfile)
      } catch (error) {
        console.error("Error loading user data:", error)
        setError("Error loading user data")
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

