import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import LogoutButton from "@/components/auth/LogoutButton"

export default async function Dashboard() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <LogoutButton />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">Mi Perfil</h2>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Email:</span> {user.email}
            </p>
            <p>
              <span className="font-medium">ID:</span> {user.id}
            </p>
          </div>
        </div>

        {/* Más tarjetas de contenido aquí */}
      </div>
    </div>
  )
}

