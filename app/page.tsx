"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import Image from "next/image"
import QrScannerFab from "@/components/qr-scanner/qr-scanner-fab"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  return (
    <div className="flex min-h-screen flex-col bg-[#0055a5] text-white">
      <main className="flex-1">
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            {/* Logo de Nestlé */}
            <div className="mb-8 flex justify-center">
              <Image
                src="/images/nestledigitalpharmasummitvertical.svg"
                alt="Nestle Digital Pharma Summit"
                width={200}
                height={100}
                priority
              />
            </div>

            <h2 className="mb-4 text-3xl font-bold text-[#a4ce4e] md:text-4xl">Escanea, Elige y Recibe</h2>

            <p className="mx-auto mb-10 max-w-2xl text-xl text-white/90">
              Regístrate, recibe tus monedas, escanea códigos QR y canjea productos exclusivos de QRexperience
            </p>

            {!user && (
              <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-6 sm:space-y-0">
                <Link
                  href="/qr-scanner"
                  className="flex items-center rounded-full bg-[#004489] px-8 py-3 text-lg font-medium text-white shadow-lg transition-colors hover:bg-[#003366]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2 h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                    />
                  </svg>
                  Escanear QR
                </Link>
                <Link
                  href="/login"
                  className="rounded-full bg-white/20 backdrop-blur-sm px-8 py-3 text-lg font-medium text-white shadow-lg transition-colors hover:bg-white/30"
                >
                  Iniciar Sesión
                </Link>
              </div>
            )}
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-8 text-center text-3xl font-bold text-white md:text-4xl">Cómo Funciona</h2>
            <p className="mx-auto mb-12 max-w-3xl text-center text-xl text-white/90">
              Sigue estos sencillos pasos para comenzar a disfrutar de la experiencia QRexperience
            </p>

            <div className="grid gap-8 md:grid-cols-4">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#0066cc] text-white shadow-lg">
                  <span className="text-3xl font-bold">1</span>
                  <div className="absolute right-0 top-1/2 hidden h-1 w-16 -translate-y-1/2 md:flex md:items-center">
                    <div className="h-2 w-2 rounded-full bg-white/60"></div>
                    <div className="mx-1 h-2 w-2 rounded-full bg-white/60"></div>
                    <div className="mx-1 h-2 w-2 rounded-full bg-white/60"></div>
                    <div className="h-2 w-2 rounded-full bg-white/60"></div>
                  </div>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-white">Regístrate</h3>
                <p className="text-white/80">Crea una cuenta y recibe tus monedas de bienvenida</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#0066cc] text-white shadow-lg">
                  <span className="text-3xl font-bold">2</span>
                  <div className="absolute right-0 top-1/2 hidden h-1 w-16 -translate-y-1/2 md:flex md:items-center">
                    <div className="h-2 w-2 rounded-full bg-white/60"></div>
                    <div className="mx-1 h-2 w-2 rounded-full bg-white/60"></div>
                    <div className="mx-1 h-2 w-2 rounded-full bg-white/60"></div>
                    <div className="h-2 w-2 rounded-full bg-white/60"></div>
                  </div>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-white">Escanea QR</h3>
                <p className="text-white/80">Busca códigos QR para ver productos disponibles</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#0066cc] text-white shadow-lg">
                  <span className="text-3xl font-bold">3</span>
                  <div className="absolute right-0 top-1/2 hidden h-1 w-16 -translate-y-1/2 md:flex md:items-center">
                    <div className="h-2 w-2 rounded-full bg-white/60"></div>
                    <div className="mx-1 h-2 w-2 rounded-full bg-white/60"></div>
                    <div className="mx-1 h-2 w-2 rounded-full bg-white/60"></div>
                    <div className="h-2 w-2 rounded-full bg-white/60"></div>
                  </div>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-white">Elige Productos</h3>
                <p className="text-white/80">Selecciona los productos que deseas obtener</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#0066cc] text-white shadow-lg">
                  <span className="text-3xl font-bold">4</span>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-white">Recibe tus Productos</h3>
                <p className="text-white/80">Finaliza tu compra y recoge tus productos</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#004489] py-6 text-white">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} QRexperience. Todos los derechos reservados.</p>
        </div>
      </footer>

      {/* Botón flotante para escanear QR */}
      <QrScannerFab />
    </div>
  )
}

