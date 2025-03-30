"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/auth"
import { getUserProfile } from "@/lib/user-service"
import RouteGuard from "@/components/auth/route-guard"
import {
  PageTemplate,
  PageContent,
  SectionTitle,
  LoadingMessage,
  ErrorMessage,
  Card,
} from "@/components/ui/page-template"
import { PageTransition, AnimateOnView } from "@/components/ui/page-transition"
import { User, Building, Mail, Key, Calendar, Award } from "lucide-react"

// Define Profile type inline or import if defined elsewhere
interface ProfileData {
  id: string
  role: "customer" | "admin" | string
  full_name?: string
  company_name?: string
  coins?: number
  email?: string
  created_at?: string
  [key: string]: any
}

export default function ProfilePage() {
  const { user, isAuthenticated, loading } = useAuth()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadProfileData() {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const profileData = await getUserProfile(user.id)

        if (!profileData) {
          setError("No se encontró información de perfil detallada")
        } else {
          setProfile({
            ...profileData,
            email: user.email,
          })
        }
      } catch (err) {
        console.error("Error cargando perfil:", err)
        setError("No se pudo cargar la información del perfil")
      } finally {
        setIsLoading(false)
      }
    }

    if (!loading) {
      loadProfileData()
    }
  }, [user, loading])

  // Formatear fecha en formato legible
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"

    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  return (
    <RouteGuard>
      <PageTemplate title="Perfil de Usuario" showBackButton activeTab="profile">
        <PageTransition>
          <PageContent>
            <SectionTitle title="Mi perfil" subtitle="Información personal y detalles de tu cuenta" />

            {isLoading ? (
              <LoadingMessage message="Cargando tu perfil..." />
            ) : error ? (
              <ErrorMessage message={error} />
            ) : !user ? (
              <ErrorMessage message="Debes iniciar sesión para ver tu perfil" />
            ) : !profile ? (
              <ErrorMessage message="No se encontró información de perfil detallada" />
            ) : (
              <div className="space-y-6">
                <AnimateOnView delay={0.1}>
                  <Card>
                    <div className="flex flex-col md:flex-row md:items-center">
                      <div className="p-4 flex-shrink-0 flex justify-center md:justify-start">
                        <div className="h-24 w-24 rounded-full bg-white/20 flex items-center justify-center">
                          <User className="h-12 w-12 text-white/70" />
                        </div>
                      </div>

                      <div className="flex-grow p-4">
                        <h2 className="text-2xl font-bold text-white">{profile.full_name || "Usuario"}</h2>
                        <div className="flex flex-wrap gap-3 mt-2">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-light/30">
                            {profile.role === "admin" ? "Administrador" : "Cliente"}
                          </span>
                          {profile.coins !== undefined && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-warning/30">
                              <Award className="h-3 w-3 mr-1" />
                              {profile.coins} monedas
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </AnimateOnView>

                <AnimateOnView delay={0.2}>
                  <Card>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Mail className="h-5 w-5 mr-2 text-white/70" />
                        Información de Contacto
                      </h3>

                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white/10 p-3 rounded-lg">
                            <p className="text-sm text-white/60 mb-1">Email</p>
                            <p className="font-medium">{profile.email || "No especificado"}</p>
                          </div>

                          <div className="bg-white/10 p-3 rounded-lg">
                            <p className="text-sm text-white/60 mb-1">Empresa</p>
                            <div className="font-medium flex items-center">
                              {profile.company_name ? (
                                <>
                                  <Building className="h-4 w-4 mr-1 inline-block text-white/70" />
                                  {profile.company_name}
                                </>
                              ) : (
                                "No especificada"
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </AnimateOnView>

                <AnimateOnView delay={0.3}>
                  <Card>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Key className="h-5 w-5 mr-2 text-white/70" />
                        Detalles de Cuenta
                      </h3>

                      <div className="bg-white/10 p-3 rounded-lg">
                        <p className="text-sm text-white/60 mb-1">Miembro desde</p>
                        <div className="font-medium flex items-center">
                          <Calendar className="h-4 w-4 mr-1 inline-block text-white/70" />
                          {formatDate(profile.created_at || user.created_at)}
                        </div>
                      </div>
                    </div>
                  </Card>
                </AnimateOnView>
              </div>
            )}
          </PageContent>
        </PageTransition>
      </PageTemplate>
    </RouteGuard>
  )
}

