import { supabase } from "./supabase-client"

// Función para verificar la estructura de la tabla profiles
export async function checkProfilesTableStructure() {
  try {
    const { data, error } = await supabase.from("profiles").select("*").limit(1)

    if (error) {
      console.error("Error al consultar la tabla profiles:", error.message)
      return { success: false, error: error.message }
    }

    // Si no hay datos, intentamos obtener la estructura de la tabla de otra manera
    if (!data || data.length === 0) {
      // Podemos intentar insertar un registro de prueba y luego eliminarlo
      const testId = "test-" + Date.now()
      const { error: insertError } = await supabase.from("profiles").insert({ id: testId }).select()

      if (insertError) {
        console.error("Error al insertar registro de prueba:", insertError.message)
        return { success: false, error: insertError.message, columns: [] }
      }

      // Eliminar el registro de prueba
      await supabase.from("profiles").delete().eq("id", testId)

      return {
        success: true,
        message: "No hay datos en la tabla profiles, pero se pudo insertar un registro de prueba",
      }
    }

    // Obtener las columnas de la tabla
    const columns = Object.keys(data[0])

    return {
      success: true,
      columns,
      message: `Columnas encontradas en la tabla profiles: ${columns.join(", ")}`,
    }
  } catch (error) {
    console.error("Error inesperado al verificar la estructura de la tabla:", error)
    return { success: false, error: "Error inesperado al verificar la estructura de la tabla" }
  }
}

