"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { LoadingFallback } from "@/components/ui/loading-fallback"
import dynamic from "next/dynamic"

// Importaciones dinámicas para el lado del cliente
const AuthProvider = dynamic(() => import("@/contexts/auth-context").then((mod) => mod.AuthProvider), {
  loading: () => <LoadingFallback />,
})

const ScannerProvider = dynamic(() => import("@/contexts/scanner-context").then((mod) => mod.ScannerProvider), {
  loading: () => <LoadingFallback />,
})

const SessionRefresh = dynamic(() => import("@/components/session-refresh").then((mod) => mod.SessionRefresh))

const BubbleBackground = dynamic(() => import("@/components/BubbleBackground").then((mod) => mod.BubbleBackground))

export function ClientProviders({ children }: { children: React.ReactNode }) {
  // Usamos un estado para controlar el montaje solo en el cliente
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // No renderizar nada durante el SSR
  if (!isMounted) {
    return <LoadingFallback />
  }

  return (
    <>
      <AuthProvider>
        <ScannerProvider>
          <SessionRefresh />
          <BubbleBackground />
          {children}
        </ScannerProvider>
      </AuthProvider>
    </>
  )
}

