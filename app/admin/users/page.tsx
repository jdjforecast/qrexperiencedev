import { getServerClient } from "@/lib/supabase-client-server"
import { revalidatePath } from "next/cache"

export default async function AdminUsersPage() {
  const supabase = getServerClient()

  // Obtener todos los usuarios de auth.users
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

  if (authError) {
    console.error("Error al obtener usuarios:", authError)
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Administración de Usuarios</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error al cargar usuarios: {authError.message}
        </div>
      </div>
    )
  }

  // Obtener todos los perfiles
  const { data: profiles, error: profilesError } = await supabase.from("profiles").select("id, role")

  if (profilesError) {
    console.error("Error al obtener perfiles:", profilesError)
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Administración de Usuarios</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error al cargar perfiles: {profilesError.message}
        </div>
      </div>
    )
  }

  // Combinar los datos
  const users =
    authUsers?.users?.map((user) => {
      const profile = profiles?.find((p) => p.id === user.id)
      return {
        ...user,
        role: profile?.role || "customer",
      }
    }) || []

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Administración de Usuarios</h1>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha de Registro
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === "admin" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{new Date(user.created_at).toLocaleDateString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <form action={makeAdmin} className="inline">
                    <input type="hidden" name="userId" value={user.id} />
                    <button
                      type="submit"
                      className={`text-indigo-600 hover:text-indigo-900 ${
                        user.role === "admin" ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      disabled={user.role === "admin"}
                    >
                      {user.role === "admin" ? "Ya es Admin" : "Hacer Admin"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

async function makeAdmin(formData: FormData) {
  "use server"

  const userId = formData.get("userId") as string

  if (!userId) {
    return { error: "ID de usuario no proporcionado" }
  }

  try {
    const supabase = getServerClient()

    // Actualizar el rol del usuario a admin
    const { error } = await supabase.from("profiles").update({ role: "admin" }).eq("id", userId)

    if (error) {
      console.error("Error al actualizar el rol del usuario:", error)
      return { error: error.message }
    }

    // Revalidar la página para mostrar los cambios
    revalidatePath("/admin/users")

    return { success: true }
  } catch (error) {
    console.error("Error al hacer admin al usuario:", error)
    return { error: "Error al actualizar el usuario" }
  }
}

