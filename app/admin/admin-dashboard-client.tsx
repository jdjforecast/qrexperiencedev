"use client"

import type React from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AuthGuard from "@/components/auth/auth-guard"
import { Users, Package, Settings, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ShoppingCart } from "lucide-react"

export default function AdminDashboardClient() {
  const router = useRouter()

  return (
    <AuthGuard requireAdmin>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Panel de Administración</h1>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="modules">Módulos</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <DashboardCard
                title="Productos"
                description="Gestiona el catálogo de productos"
                icon={<Package className="h-5 w-5" />}
                href="/admin/products"
              />
              <DashboardCard
                title="Usuarios"
                description="Administra usuarios y permisos"
                icon={<Users className="h-5 w-5" />}
                href="/admin/users"
              />
              <DashboardCard
                title="Pedidos"
                description="Visualiza y gestiona pedidos"
                icon={<ShoppingCart className="h-5 w-5" />}
                href="/admin/orders"
              />
              <DashboardCard
                title="Configuración"
                description="Ajustes generales del sistema"
                icon={<Settings className="h-5 w-5" />}
                href="/admin/settings"
              />
            </div>
          </TabsContent>

          <TabsContent value="modules">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <ModuleCard
                title="Catálogo"
                description="Gestión completa del catálogo de productos"
                icon={<Package className="h-12 w-12 text-primary" />}
                features={[
                  "Crear y editar productos",
                  "Gestionar categorías",
                  "Configurar precios y descuentos",
                  "Administrar inventario",
                ]}
                href="/admin/products"
              />
              <ModuleCard
                title="Usuarios"
                description="Administración de usuarios y perfiles"
                icon={<Users className="h-12 w-12 text-primary" />}
                features={[
                  "Gestionar cuentas de usuario",
                  "Asignar roles y permisos",
                  "Ver historial de actividad",
                  "Bloquear usuarios",
                ]}
                href="/admin/users"
              />
              <ModuleCard
                title="Pedidos"
                description="Gestión de pedidos y ventas"
                icon={<ShoppingCart className="h-12 w-12 text-primary" />}
                features={[
                  "Ver todos los pedidos",
                  "Actualizar estado de pedidos",
                  "Procesar devoluciones",
                  "Generar informes de ventas",
                ]}
                href="/admin/orders"
              />
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Configuración del Sistema</CardTitle>
                <CardDescription>Ajusta la configuración general de la aplicación</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <SettingsCard
                    title="General"
                    description="Configuración básica del sistema"
                    href="/admin/settings/general"
                  />
                  <SettingsCard
                    title="Apariencia"
                    description="Personaliza la apariencia de la tienda"
                    href="/admin/settings/appearance"
                  />
                  <SettingsCard
                    title="Notificaciones"
                    description="Configura las notificaciones del sistema"
                    href="/admin/settings/notifications"
                  />
                  <SettingsCard
                    title="Integraciones"
                    description="Conecta con servicios externos"
                    href="/admin/settings/integrations"
                  />
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Migraciones de Base de Datos</CardTitle>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">Mantenimiento</div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" onClick={() => router.push("/admin/migrations")}>
                        Gestionar Migraciones
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuthGuard>
  )
}

interface DashboardCardProps {
  title: string
  description: string
  icon: React.ReactNode
  href: string
}

function DashboardCard({ title, description, icon, href }: DashboardCardProps) {
  return (
    <Link href={href} className="block">
      <Card className="h-full transition-all hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <CardDescription>{description}</CardDescription>
        </CardContent>
      </Card>
    </Link>
  )
}

interface ModuleCardProps {
  title: string
  description: string
  icon: React.ReactNode
  features: string[]
  href: string
}

function ModuleCard({ title, description, icon, features, href }: ModuleCardProps) {
  return (
    <Link href={href} className="block">
      <Card className="h-full transition-all hover:shadow-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">{icon}</div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </Link>
  )
}

interface SettingsCardProps {
  title: string
  description: string
  href: string
}

function SettingsCard({ title, description, href }: SettingsCardProps) {
  return (
    <Link href={href} className="block">
      <div className="border rounded-lg p-4 transition-all hover:border-primary hover:bg-primary/5">
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
    </Link>
  )
}

