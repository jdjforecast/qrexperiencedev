import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { AuthProvider } from "@/components/auth/AuthProvider"
import { Toaster } from "@/components/ui/toaster"
import { Inter } from "next/font/google"
import { NextAuthProvider } from "@/components/providers/NextAuthProvider"

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
  return (
    <html lang="es" className="h-full">
      <body className={`${inter.className} min-h-screen bg-gray-50`}>
        <NextAuthProvider>
          <AuthProvider>
            <div className="main-layout">
              <Navbar />
              <main className="main-content">{children}</main>
              <Footer />
            </div>
            <Toaster />
          </AuthProvider>
        </NextAuthProvider>
      </body>
    </html>
  )
}