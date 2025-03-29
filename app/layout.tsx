import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { AuthProvider } from "@/lib/auth-context"
import { Toaster } from "@/components/ui/toaster"
import RouteGuard from "@/components/auth/route-guard"

export const metadata: Metadata = {
  title: "Mi Partner App",
  description: "Aplicación para gestionar productos y pedidos",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <RouteGuard>
            <div className="main-layout">
              <Navbar />
              <main className="main-content">{children}</main>
              <Footer />
            </div>
          </RouteGuard>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}