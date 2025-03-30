"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { supabaseClient } from "@/lib/supabase/client-utils"

export default function FixRLSPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleFixRLS = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      // Ejecutar la migración SQL directamente
      const { error } = await supabaseClient.rpc("fix_rls")

      if (error) {
        setResult({
          success: false,
          message: error.message || "Error fixing RLS",
        })
        return
      }

      setResult({
        success: true,
        message: "Políticas RLS actualizadas correctamente. Ahora deberías poder iniciar sesión sin problemas.",
      })
    } catch (error) {
      console.error("Error fixing RLS:", error)
      setResult({
        success: false,
        message: error.message || "Error fixing RLS",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-10">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Corregir Políticas RLS</CardTitle>
          <CardDescription>
            Esta herramienta corrige las políticas de seguridad a nivel de fila (RLS) para la tabla "profiles", lo que
            debería resolver el error "new row violates row-level security policy for table profiles".
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            El error ocurre porque las políticas RLS actuales no permiten la creación automática de perfiles cuando un
            usuario inicia sesión. Esta herramienta actualiza las políticas para permitir esta operación.
          </p>

          {result && (
            <Alert className={result.success ? "bg-green-50" : "bg-red-50"}>
              <AlertTitle>{result.success ? "Éxito" : "Error"}</AlertTitle>
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleFixRLS} disabled={isLoading} className="w-full">
            {isLoading ? "Ejecutando..." : "Corregir Políticas RLS"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

