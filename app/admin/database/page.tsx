"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { supabase } from "@/lib/database"

export default function DatabaseAdminPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const runMigration = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      // Ejecutar el script de migración
      const { error } = await supabase.rpc("run_migration")

      if (error) {
        throw error
      }

      setResult({
        success: true,
        message: "Migración ejecutada correctamente. La base de datos ha sido optimizada.",
      })
    } catch (error: any) {
      console.error("Error al ejecutar la migración:", error)
      setResult({
        success: false,
        message: `Error al ejecutar la migración: ${error.message || "Error desconocido"}`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const runAudit = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      // Ejecutar el script de auditoría
      const { data, error } = await supabase.rpc("run_audit")

      if (error) {
        throw error
      }

      setResult({
        success: true,
        message: "Auditoría completada. Revisa la consola para ver los resultados detallados.",
      })

      console.log("Resultados de la auditoría:", data)
    } catch (error: any) {
      console.error("Error al ejecutar la auditoría:", error)
      setResult({
        success: false,
        message: `Error al ejecutar la auditoría: ${error.message || "Error desconocido"}`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Administración de Base de Datos</h1>

      <Tabs defaultValue="optimize">
        <TabsList className="mb-4">
          <TabsTrigger value="optimize">Optimizar Base de Datos</TabsTrigger>
          <TabsTrigger value="audit">Auditar Base de Datos</TabsTrigger>
        </TabsList>

        <TabsContent value="optimize">
          <Card>
            <CardHeader>
              <CardTitle>Optimización de Base de Datos</CardTitle>
              <CardDescription>
                Ejecuta la migración para optimizar la estructura de la base de datos según las recomendaciones de la
                auditoría.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Esta operación realizará las siguientes acciones:</p>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li>Añadir columnas faltantes en las tablas existentes</li>
                <li>Eliminar columnas redundantes o no utilizadas</li>
                <li>Añadir índices para mejorar el rendimiento</li>
                <li>Crear o actualizar políticas RLS para todas las tablas</li>
                <li>Implementar funciones RPC optimizadas</li>
              </ul>
              <p className="text-amber-600">
                <strong>Advertencia:</strong> Esta operación modificará la estructura de la base de datos. Asegúrate de
                tener una copia de seguridad antes de continuar.
              </p>
            </CardContent>
            <CardFooter>
              <Button onClick={runMigration} disabled={isLoading}>
                {isLoading ? "Ejecutando..." : "Ejecutar Migración"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>Auditoría de Base de Datos</CardTitle>
              <CardDescription>
                Ejecuta un análisis completo de la estructura actual de la base de datos para identificar posibles
                mejoras.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Esta operación analizará:</p>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li>Tablas y columnas existentes</li>
                <li>Relaciones entre tablas</li>
                <li>Índices y restricciones</li>
                <li>Políticas de seguridad RLS</li>
                <li>Funciones RPC</li>
              </ul>
              <p>Los resultados detallados se mostrarán en la consola del navegador.</p>
            </CardContent>
            <CardFooter>
              <Button onClick={runAudit} disabled={isLoading}>
                {isLoading ? "Ejecutando..." : "Ejecutar Auditoría"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {result && (
        <Alert className={`mt-6 ${result.success ? "bg-green-50" : "bg-red-50"}`}>
          <AlertTitle>{result.success ? "Operación Exitosa" : "Error"}</AlertTitle>
          <AlertDescription>{result.message}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

