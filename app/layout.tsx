import type React from "react"
import "./globals.css"
import type { Metadata, Viewport } from "next"
import { AppHeader } from "@/components/AppHeader"
import { AppFooter } from "@/components/AppFooter"
import { AuthProvider } from "@/components/auth/AuthProvider"
import { Toaster } from "@/components/ui/toaster"
import { Inter } from "next/font/google"

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: "Mi Partner App",
  description: "Aplicación para gestionar productos y pedidos mediante códigos QR",
  generator: 'v0.dev',
  applicationName: 'Mi Partner App',
  authors: [{ name: 'Jaime Forero Castillo' }],
  keywords: ['productos', 'qr', 'escaneo', 'compras', 'nestle'],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0033A0',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const activeTab = "unknown"; // Placeholder

  return (
    <html lang="es" className="h-full">
      <body className={`${inter.className} min-h-screen text-base antialiased`}>
        <AuthProvider>
          <div className="flex flex-col min-h-screen relative overflow-hidden">
            <AppHeader />
            <main className="flex-grow pb-20 pt-16 md:pt-20 md:pb-16">
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