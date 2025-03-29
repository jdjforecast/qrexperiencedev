"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { createBrowserClient } from "@/lib/supabase-client"
import { Loader2, CheckCircle, AlertTriangle } from "lucide-react"
import AdminLayout from "@/components/admin-layout"

export default function MigrationsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const executeRemoveQRCodeMigration = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const supabase = createBrowserClient()

      // Check if the code column exists
      const { data: columnExists, error: checkError } = await supabase.rpc("check_column_exists", {
        table_name: "products",
        column_name: "code",
      })

      if (checkError) {
        throw new Error(`Error checking column: ${checkError.message}`)
      }

      if (!columnExists) {
        setResult({
          success: true,
          message: 'La columna "code" ya ha sido eliminada o no existe.',
        })
        return
      }

      // Execute the migration to remove the code column
      const { error: migrationError } = await supabase.rpc("remove_qr_code_column")

      if (migrationError) {
        throw new Error(`Error en la migración: ${migrationError.message}`)
      }

      setResult({
        success: true,
        message: 'La columna "code" ha sido eliminada exitosamente de la tabla "products".',
      })
    } catch (error) {
      console.error("Migration error:", error)
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido al ejecutar la migración",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Administración de Migraciones</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Eliminar funcionalidad de códigos QR</CardTitle>
            <CardDescription>
              Esta migración eliminará la columna "code" de la tabla "products" que se utilizaba para la generación de
              códigos QR.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Al ejecutar esta migración, se eliminará permanentemente la columna "code" de la tabla "products". Esta
              acción no puede deshacerse y cualquier dato almacenado en esta columna se perderá.
            </p>

            {result && (
              <Alert className={result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
                {result.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                )}
                <AlertTitle>{result.success ? "Éxito" : "Error"}</AlertTitle>
                <AlertDescription>{result.message}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={executeRemoveQRCodeMigration} disabled={isLoading} variant="destructive">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ejecutando...
                </>
              ) : (
                "Ejecutar Migración"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AdminLayout>
  )
}

