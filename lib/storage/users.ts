import { getBrowserClient, createServerClient } from "../supabase"
import type { UserProfile } from "@/types/user"

// Crear o actualizar perfil de usuario
export async function upsertUserProfile(userId: string, profileData: Partial<UserProfile>) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("users")
    .upsert({
      id: userId,
      ...profileData,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  return { data, error }
}

// Obtener perfil de usuario
export async function getUserProfile(userId: string) {
  const supabase = getBrowserClient()

  const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

  return { data, error }
}

// Obtener todos los usuarios
export async function getAllUsers() {
  const supabase = createServerClient()

  const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })

  return { data: data || [], error }
}

// Actualizar monedas de usuario
export async function updateUserCoins(userId: string, amount: number, isAddition = true) {
  const supabase = createServerClient()

  // Primero obtenemos las monedas actuales
  const { data: userData } = await supabase.from("users").select("coins").eq("id", userId).single()

  if (!userData) {
    return { error: new Error("Usuario no encontrado") }
  }

  const currentCoins = userData.coins || 0
  const newCoins = isAddition ? currentCoins + amount : amount

  // Actualizamos las monedas
  const { data, error } = await supabase
    .from("users")
    .update({ coins: newCoins, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select()
    .single()

  return { data, error }
}

// Establecer rol de administrador
export async function setAdminRole(userId: string, isAdmin: boolean) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("users")
    .update({ is_admin: isAdmin, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select()
    .single()

  return { data, error }
}

// Obtener estadísticas de usuarios
export async function getUserStats() {
  const supabase = createServerClient()

  // Total de usuarios
  const { count: totalUsers } = await supabase.from("users").select("*", { count: "exact", head: true })

  // Usuarios registrados hoy
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { count: newUsersToday } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .gte("created_at", today.toISOString())

  // Usuarios con más monedas
  const { data: topUsers } = await supabase
    .from("users")
    .select("id, email, full_name, coins")
    .order("coins", { ascending: false })
    .limit(5)

  return {
    totalUsers: totalUsers || 0,
    newUsersToday: newUsersToday || 0,
    topUsers: topUsers || [],
  }
}

