"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/components/auth/AuthProvider"

export function Navbar() {
  const router = useRouter()
  const { profile, isAdmin, signOut } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const isAuthenticated = !!profile

  return (
    <nav className="navbar">
      <div className="flex items-center">
        <Link href="/" className="flex items-center">
          <Image src="/images/nestledigitalpharmasummitvertical.svg" alt="Logo" width={100} height={40} priority />
        </Link>
      </div>

      {/* Mobile menu button */}
      <button className="md:hidden text-white" onClick={toggleMenu}>
        {isMenuOpen ? "Cerrar" : "Menú"}
      </button>

      {/* Desktop menu */}
      <div className="hidden md:flex items-center space-x-4">
        {isAuthenticated ? (
          <>
            <Link href="/dashboard" className="text-blanco hover:text-verde">
              Dashboard
            </Link>
            <Link href="/cart" className="text-blanco hover:text-verde">
              Carrito
            </Link>
            {isAdmin && (
              <Link href="/admin" className="text-blanco hover:text-verde">
                Admin
              </Link>
            )}
            <button onClick={handleSignOut} className="text-blanco hover:text-verde">
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-blanco hover:text-verde">
              Iniciar sesión
            </Link>
            <Link href="/register" className="text-blanco hover:text-verde">
              Registrarse
            </Link>
          </>
        )}
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 right-0 left-0 bg-azul-oscuro p-4 z-50">
          {isAuthenticated ? (
            <div className="flex flex-col space-y-2">
              <Link href="/dashboard" className="text-blanco hover:text-verde">
                Dashboard
              </Link>
              <Link href="/cart" className="text-blanco hover:text-verde">
                Carrito
              </Link>
              {isAdmin && (
                <Link href="/admin" className="text-blanco hover:text-verde">
                  Admin
                </Link>
              )}
              <button onClick={handleSignOut} className="text-blanco hover:text-verde text-left">
                Cerrar sesión
              </button>
            </div>
          ) : (
            <div className="flex flex-col space-y-2">
              <Link href="/login" className="text-blanco hover:text-verde">
                Iniciar sesión
              </Link>
              <Link href="/register" className="text-blanco hover:text-verde">
                Registrarse
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}

