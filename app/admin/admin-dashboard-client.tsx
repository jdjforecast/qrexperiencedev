"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import MostPurchasedChart from "./products/most-purchased-chart"

export default function AdminDashboardClient() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Panel de Administración</h1>

      <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="products">Productos</TabsTrigger>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="database">Base de Datos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Productos</CardTitle>
                <CardDescription>Gestión de productos y categorías</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/catalog" className="text-blue-600 hover:underline block mb-2">
                  Catálogo de Productos
                </Link>
                <Link href="/admin/products" className="text-blue-600 hover:underline block">
                  Gestionar Productos
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usuarios</CardTitle>
                <CardDescription>Gestión de usuarios y permisos</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/users" className="text-blue-600 hover:underline block">
                  Gestionar Usuarios
                </Link>
              </CardContent>
            </Card>

            <MostPurchasedChart />

            <Card>
              <CardHeader>
                <CardTitle>Base de Datos</CardTitle>
                <CardDescription>Explorar y gestionar datos</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/database" className="text-blue-600 hover:underline block">
                  Explorador de Base de Datos
                </Link>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Productos</CardTitle>
              <CardDescription>Administra el catálogo de productos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link href="/admin/catalog" className="text-blue-600 hover:underline block">
                  Catálogo de Productos
                </Link>
                <Link href="/admin/products" className="text-blue-600 hover:underline block">
                  Gestionar Productos
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Usuarios</CardTitle>
              <CardDescription>Administra usuarios y permisos</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/users" className="text-blue-600 hover:underline block">
                Gestionar Usuarios
              </Link>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database">
          <Card>
            <CardHeader>
              <CardTitle>Explorador de Base de Datos</CardTitle>
              <CardDescription>Visualiza y gestiona los datos de la aplicación</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/database" className="text-blue-600 hover:underline block">
                Explorador de Base de Datos
              </Link>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

