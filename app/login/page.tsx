import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import LoginForm from "./login-form"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { redirect?: string; forceRefresh?: string }
}) {
  // Si se solicita forzar la actualización, no hacemos nada especial aquí
  // ya que la recarga forzada se maneja en el cliente

  // Verificar si el usuario ya está autenticado
  const supabase = createServerComponentClient({ cookies })
  const { data } = await supabase.auth.getSession()

  // Si el usuario ya está autenticado, redirigir al dashboard o a la ruta solicitada
  if (data.session) {
    return redirect(searchParams.redirect || "/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg bg-white p-8 shadow-md">
          <h1 className="mb-6 text-center text-2xl font-bold">Iniciar sesión</h1>
          <LoginForm redirectTo={searchParams.redirect} />
          <div className="mt-4 text-center text-sm text-gray-600">
            ¿No tienes una cuenta?{" "}
            <a href="/register" className="text-blue-600 hover:underline">
              Regístrate
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

