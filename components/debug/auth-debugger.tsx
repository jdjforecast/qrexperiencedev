"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth/AuthProvider"
import { Button } from "@/components/ui/button"
import { getBrowserClient } from "@/lib/supabase"

export function AuthDebugger() {
  const { user, session, isLoading, isAuthenticated, isAdmin, refreshAuth, error } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [sessionData, setSessionData] = useState<any>(null)
  const [envVars, setEnvVars] = useState<any>(null)

  const checkSupabaseSession = async () => {
    try {
      const supabase = getBrowserClient()
      const { data } = await supabase.auth.getSession()
      setSessionData(data)
    } catch (error) {
      console.error("Error checking Supabase session:", error)
      setSessionData({ error: String(error) })
    }
  }

  const checkEnvVars = () => {
    setEnvVars({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓" : "✗",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✓" : "✗",
    })
  }

  const handleRefreshAuth = async () => {
    await refreshAuth()
  }

  if (!isOpen) {
    return (
      <Button
        className="fixed bottom-4 left-4 z-50 bg-yellow-600 hover:bg-yellow-700 text-xs"
        onClick={() => setIsOpen(true)}
      >
        Debug
      </Button>
    )
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-black/80 backdrop-blur-md p-4 rounded-lg border border-yellow-500 text-white max-w-xs text-xs">
      <div className="flex justify-between mb-2">
        <h3 className="font-bold">Auth Debugger</h3>
        <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => setIsOpen(false)}>
          ×
        </Button>
      </div>

      <div className="space-y-1">
        <p>
          <span className="text-yellow-400">Loading:</span> {isLoading ? "Yes" : "No"}
        </p>
        <p>
          <span className="text-yellow-400">Authenticated:</span> {isAuthenticated ? "Yes" : "No"}
        </p>
        <p>
          <span className="text-yellow-400">Admin:</span> {isAdmin ? "Yes" : "No"}
        </p>
        <p>
          <span className="text-yellow-400">User ID:</span> {user?.id || "None"}
        </p>
        <p>
          <span className="text-yellow-400">Email:</span> {user?.email || "None"}
        </p>
        <p>
          <span className="text-yellow-400">Session:</span> {session ? "Present" : "None"}
        </p>
        {error && (
          <p>
            <span className="text-red-400">Error:</span> {error}
          </p>
        )}
      </div>

      <div className="mt-2 space-y-2">
        <Button size="sm" className="w-full text-xs" onClick={handleRefreshAuth}>
          Refresh Auth
        </Button>
        <Button size="sm" className="w-full text-xs" onClick={checkSupabaseSession}>
          Check Supabase Session
        </Button>
        <Button size="sm" className="w-full text-xs" onClick={checkEnvVars}>
          Check Env Variables
        </Button>
      </div>

      {envVars && (
        <div className="mt-2 p-2 bg-gray-800 rounded text-xs">
          <p className="font-bold mb-1">Environment Variables:</p>
          {Object.entries(envVars).map(([key, value]) => (
            <p key={key}>
              <span className={value === "✓" ? "text-green-400" : "text-red-400"}>{value}</span> {key}
            </p>
          ))}
        </div>
      )}

      {sessionData && (
        <div className="mt-2 p-2 bg-gray-800 rounded text-xs overflow-auto max-h-32">
          <pre>{JSON.stringify(sessionData, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

