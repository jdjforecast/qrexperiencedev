import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { AppHeader } from "@/components/AppHeader"
import { AppFooter } from "@/components/AppFooter"
import { AuthProvider } from "@/components/auth/AuthProvider"
import { Toaster } from "@/components/ui/toaster"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

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
  const activeTab = "unknown"; // Placeholder

  return (
    <html lang="es" className="h-full">
      <body className={`${inter.className} min-h-screen`}>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <AppHeader />
            <main className="flex-grow container mx-auto px-4 py-8 pt-20">
              {children}
            </main>
            <AppFooter activeTab={activeTab} />
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}