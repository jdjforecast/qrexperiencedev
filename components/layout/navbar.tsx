"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function Navbar() {
  const { user, signOut, loading, isAdmin } = useAuth()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const handleSignOut = async () => {
    await signOut()
    closeMenu()
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  // Añadir estos logs para depuración
  useEffect(() => {
    console.log("Estado de autenticación en Navbar:", {
      isAuthenticated: !!user,
      user: user?.email,
      isAdmin,
    })
  }, [user, isAdmin])

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-blue-600">MiPartner</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <Link
                href="/"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive("/") ? "text-blue-600" : "text-gray-700 hover:text-blue-600"
                }`}
              >
                Inicio
              </Link>

              {!loading && user ? (
                <>
                  <Link
                    href="/dashboard"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive("/dashboard") ? "text-blue-600" : "text-gray-700 hover:text-blue-600"
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/products"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive("/products") ? "text-blue-600" : "text-gray-700 hover:text-blue-600"
                    }`}
                  >
                    Productos
                  </Link>
                  <Link
                    href="/cart"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive("/cart") ? "text-blue-600" : "text-gray-700 hover:text-blue-600"
                    }`}
                  >
                    Carrito
                  </Link>
                  <Link
                    href="/orders"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive("/orders") ? "text-blue-600" : "text-gray-700 hover:text-blue-600"
                    }`}
                  >
                    Mis Pedidos
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="ml-4 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                !loading && (
                  <>
                    <Link
                      href="/login"
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        isActive("/login") ? "text-blue-600" : "text-gray-700 hover:text-blue-600"
                      }`}
                    >
                      Iniciar Sesión
                    </Link>
                    <Link
                      href="/register"
                      className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      Registrarse
                    </Link>
                  </>
                )
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Abrir menú principal</span>
              {isMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className={`${isMenuOpen ? "block" : "hidden"} md:hidden`}>
        <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
          <Link
            href="/"
            className={`block rounded-md px-3 py-2 text-base font-medium ${
              isActive("/") ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
            }`}
            onClick={closeMenu}
          >
            Inicio
          </Link>

          {!loading && user ? (
            <>
              <Link
                href="/dashboard"
                className={`block rounded-md px-3 py-2 text-base font-medium ${
                  isActive("/dashboard")
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                }`}
                onClick={closeMenu}
              >
                Dashboard
              </Link>
              <Link
                href="/products"
                className={`block rounded-md px-3 py-2 text-base font-medium ${
                  isActive("/products")
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                }`}
                onClick={closeMenu}
              >
                Productos
              </Link>
              <Link
                href="/cart"
                className={`block rounded-md px-3 py-2 text-base font-medium ${
                  isActive("/cart") ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                }`}
                onClick={closeMenu}
              >
                Carrito
              </Link>
              <Link
                href="/orders"
                className={`block rounded-md px-3 py-2 text-base font-medium ${
                  isActive("/orders")
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                }`}
                onClick={closeMenu}
              >
                Mis Pedidos
              </Link>
              <button
                onClick={handleSignOut}
                className="mt-2 block w-full rounded-md bg-red-600 px-3 py-2 text-base font-medium text-white hover:bg-red-700"
              >
                Cerrar Sesión
              </button>
            </>
          ) : (
            !loading && (
              <>
                <Link
                  href="/login"
                  className={`block rounded-md px-3 py-2 text-base font-medium ${
                    isActive("/login")
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                  }`}
                  onClick={closeMenu}
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/register"
                  className={`block rounded-md px-3 py-2 text-base font-medium ${
                    isActive("/register")
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                  }`}
                  onClick={closeMenu}
                >
                  Registrarse
                </Link>
              </>
            )
          )}
        </div>
      </div>
    </nav>
  )
}

