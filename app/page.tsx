import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import Link from "next/link"

export default async function Home() {
  // Verificar si el usuario está autenticado
  const user = await getCurrentUser()

  // Si el usuario está autenticado, redirigir al dashboard
  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg bg-white p-8 shadow-md">
          <h1 className="mb-6 text-center text-2xl font-bold">QR Experience</h1>
          <p className="mb-6 text-center text-gray-600">
            Escanea códigos QR, gana monedas y canjéalas por productos exclusivos.
          </p>
          <div className="flex flex-col space-y-4">
            <Link
              href="/login"
              className="rounded-md bg-blue-600 px-4 py-2 text-center text-white transition-colors hover:bg-blue-700"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="rounded-md bg-gray-200 px-4 py-2 text-center text-gray-800 transition-colors hover:bg-gray-300"
            >
              Registrarse
            </Link>
            <Link
              href="/scan"
              className="rounded-md bg-green-600 px-4 py-2 text-center text-white transition-colors hover:bg-green-700"
            >
              Escanear QR
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

