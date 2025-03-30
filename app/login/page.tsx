import { redirect } from "next/navigation"
import { getServerClient } from "@/lib/auth-server"
import LoginForm from "./login-form"

export default async function LoginPage() {
  const supabase = getServerClient()
  
  // Verificar si el usuario ya está autenticado
  const { data: { session } } = await supabase.auth.getSession()
  
  // Si está autenticado, redirigir al dashboard
  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <LoginForm />
      </div>
    </div>
  )
}

