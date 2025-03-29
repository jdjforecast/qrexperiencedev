"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { createBrowserClient } from "@/lib/supabase-client"

export default function FixRLSPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const runMigration = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const supabase = createBrowserClient()

      // Ejecutar la migración SQL directamente
      const { error } = await supabase.rpc("run_sql", {
        sql: `
          -- Asegurarse de que RLS está habilitado para la tabla profiles
          ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;

          -- Eliminar políticas existentes que puedan estar causando conflictos
          DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
          DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
          DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
          DROP POLICY IF EXISTS "Admin users can view all profiles" ON profiles;
          DROP POLICY IF EXISTS "Admin users can update all profiles" ON profiles;
          DROP POLICY IF EXISTS "Admin users can insert all profiles" ON profiles;
          DROP POLICY IF EXISTS "Service role can manage all profiles" ON profiles;

          -- Crear nuevas políticas más permisivas para la tabla profiles
          CREATE POLICY "Users can view their own profile" ON profiles
              FOR SELECT USING (auth.uid() = id);

          CREATE POLICY "Users can update their own profile" ON profiles
              FOR UPDATE USING (auth.uid() = id);

          CREATE POLICY "Users can insert their own profile" ON profiles
              FOR INSERT WITH CHECK (auth.uid() = id);

          CREATE POLICY "Admin users can view all profiles" ON profiles
              FOR SELECT USING (
                  EXISTS (
                      SELECT 1 FROM profiles
                      WHERE id = auth.uid() AND role = 'admin'
                  )
              );

          CREATE POLICY "Admin users can update all profiles" ON profiles
              FOR UPDATE USING (
                  EXISTS (
                      SELECT 1 FROM profiles
                      WHERE id = auth.uid() AND role = 'admin'
                  )
              );

          CREATE POLICY "Admin users can insert all profiles" ON profiles
              FOR INSERT WITH CHECK (
                  EXISTS (
                      SELECT 1 FROM profiles
                      WHERE id = auth.uid() AND role = 'admin'
                  )
              );

          CREATE POLICY "Service role can manage all profiles" ON profiles
              FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
        `,
      })

      if (error) {
        throw new Error(`Error al ejecutar la migración: ${error.message}`)
      }

      setResult({
        success: true,
        message: "Políticas RLS actualizadas correctamente. Ahora deberías poder iniciar sesión sin problemas.",
      })
    } catch (error) {
      console.error("Error al ejecutar la migración:", error)
      setResult({
        success: false,
        message: error.message || "Error al ejecutar la migración",
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
          <Button onClick={runMigration} disabled={isLoading} className="w-full">
            {isLoading ? "Ejecutando..." : "Corregir Políticas RLS"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

