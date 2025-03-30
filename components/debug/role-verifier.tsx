"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { getBrowserClient } from "@/lib/supabase-client-browser"
import { useAuth } from "@/components/auth/AuthProvider"

export function RoleVerifier() {
  const { user, isAdmin } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [userRoles, setUserRoles] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkUserRoles = async () => {
    if (!user) {
      setError("No user is authenticated")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const supabase = getBrowserClient()

      // Check if user exists in the users table
      const { data: userData, error: userError } = await supabase.from("users").select("*").eq("id", user.id).single()

      if (userError) {
        throw new Error(`Error fetching user data: ${userError.message}`)
      }

      // Check if user has admin role
      const { data: adminData, error: adminError } = await supabase
        .from("users")
        .select("is_admin")
        .eq("id", user.id)
        .single()

      if (adminError) {
        throw new Error(`Error checking admin status: ${adminError.message}`)
      }

      setUserRoles({
        userData,
        isAdminInDB: adminData?.is_admin || false,
        isAdminInContext: isAdmin,
      })
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <Button
        className="fixed bottom-4 right-4 z-50 bg-purple-600 hover:bg-purple-700 text-xs"
        onClick={() => setIsOpen(true)}
      >
        Roles
      </Button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/80 backdrop-blur-md p-4 rounded-lg border border-purple-500 text-white max-w-xs text-xs">
      <div className="flex justify-between mb-2">
        <h3 className="font-bold">Role Verifier</h3>
        <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => setIsOpen(false)}>
          ×
        </Button>
      </div>

      <div className="space-y-1">
        <p>
          <span className="text-purple-400">User ID:</span> {user?.id || "None"}
        </p>
        <p>
          <span className="text-purple-400">Email:</span> {user?.email || "None"}
        </p>
        <p>
          <span className="text-purple-400">Admin (Context):</span> {isAdmin ? "Yes" : "No"}
        </p>
      </div>

      <div className="mt-2">
        <Button size="sm" className="w-full text-xs" onClick={checkUserRoles} disabled={isLoading}>
          {isLoading ? "Checking..." : "Check User Roles"}
        </Button>
      </div>

      {error && (
        <div className="mt-2 p-2 bg-red-900/50 rounded text-xs">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {userRoles && (
        <div className="mt-2 p-2 bg-gray-800 rounded text-xs overflow-auto max-h-32">
          <p>
            <span className="text-purple-400">Admin in DB:</span> {userRoles.isAdminInDB ? "Yes" : "No"}
          </p>
          <p>
            <span className="text-purple-400">Admin in Context:</span> {userRoles.isAdminInContext ? "Yes" : "No"}
          </p>
          <p>
            <span className="text-purple-400">User Data:</span>
          </p>
          <pre className="mt-1 text-[10px]">{JSON.stringify(userRoles.userData, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

