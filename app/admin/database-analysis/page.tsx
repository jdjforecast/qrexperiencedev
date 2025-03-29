import { createServerClient } from "@/lib/supabase-client"

export default async function DatabaseAnalysisPage() {
  const supabase = createServerClient({ admin: true })

  // Ejecutar la función de análisis
  const { data: consistencyData, error: consistencyError } = await supabase.rpc("check_user_consistency")

  if (consistencyError) {
    console.error("Error al verificar consistencia:", consistencyError)
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Análisis de Base de Datos</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error al analizar la base de datos: {consistencyError.message}
        </div>
      </div>
    )
  }

  // Obtener estructura de tablas
  const { data: profilesStructure, error: profilesError } = await supabase
    .from("information_schema.columns")
    .select("column_name, data_type")
    .eq("table_name", "profiles")
    .eq("table_schema", "public")

  const { data: usersStructure, error: usersError } = await supabase
    .from("information_schema.columns")
    .select("column_name, data_type")
    .eq("table_name", "users")
    .eq("table_schema", "public")

  // Verificar si hay inconsistencias
  const inconsistencies = consistencyData?.filter(
    (user) => !(user.auth_exists && user.profile_exists && user.users_exists),
  )

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Análisis de Base de Datos</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Estructura de Tabla "profiles"</h2>
          {profilesError ? (
            <div className="text-red-500">Error: {profilesError.message}</div>
          ) : (
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="text-left">Columna</th>
                  <th className="text-left">Tipo</th>
                </tr>
              </thead>
              <tbody>
                {profilesStructure?.map((col, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                    <td className="py-2">{col.column_name}</td>
                    <td className="py-2">{col.data_type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Estructura de Tabla "users"</h2>
          {usersError ? (
            <div className="text-red-500">Error: {usersError.message}</div>
          ) : (
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="text-left">Columna</th>
                  <th className="text-left">Tipo</th>
                </tr>
              </thead>
              <tbody>
                {usersStructure?.map((col, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                    <td className="py-2">{col.column_name}</td>
                    <td className="py-2">{col.data_type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Inconsistencias Detectadas</h2>
        {inconsistencies && inconsistencies.length > 0 ? (
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="text-left">ID de Usuario</th>
                <th className="text-center">En Auth</th>
                <th className="text-center">En Profiles</th>
                <th className="text-center">En Users</th>
              </tr>
            </thead>
            <tbody>
              {inconsistencies.map((user, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                  <td className="py-2">{user.user_id}</td>
                  <td className="py-2 text-center">
                    {user.auth_exists ? (
                      <span className="text-green-500">✓</span>
                    ) : (
                      <span className="text-red-500">✗</span>
                    )}
                  </td>
                  <td className="py-2 text-center">
                    {user.profile_exists ? (
                      <span className="text-green-500">✓</span>
                    ) : (
                      <span className="text-red-500">✗</span>
                    )}
                  </td>
                  <td className="py-2 text-center">
                    {user.users_exists ? (
                      <span className="text-green-500">✓</span>
                    ) : (
                      <span className="text-red-500">✗</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-green-600">
            No se detectaron inconsistencias. Todos los usuarios están correctamente sincronizados.
          </p>
        )}
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Recomendaciones</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Si ambas tablas contienen información similar, considere consolidarlas en una sola tabla.</li>
          <li>
            Asegúrese de que todas las operaciones de autenticación actualicen ambas tablas si decide mantenerlas
            separadas.
          </li>
          <li>Implemente triggers de base de datos para mantener la consistencia entre tablas.</li>
          <li>Revise las políticas RLS para asegurarse de que estén correctamente configuradas para ambas tablas.</li>
        </ul>

        <div className="mt-6">
          <form action="/admin/consolidate-tables" method="POST" className="inline">
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Consolidar Tablas
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

