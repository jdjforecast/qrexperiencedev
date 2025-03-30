"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/components/auth/AuthProvider"

// Icon components (simple SVG placeholders for brevity)
const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
  </svg>
);
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export function Navbar() {
  const router = useRouter()
  // Use isLoading to prevent showing login/register briefly before auth state is confirmed
  const { profile, isAdmin, signOut, isLoading, isAuthenticated } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleSignOut = async () => {
    setIsMenuOpen(false) // Close menu on sign out
    try {
      await signOut()
      // Redirect to login after sign out
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const closeMenu = () => setIsMenuOpen(false);

  return (
    // Replace .navbar with Tailwind classes
    // Use CSS variables defined in globals.css for custom colors
    <nav className="bg-[--azul-oscuro]/90 backdrop-blur-sm sticky top-0 z-50 shadow-md text-white">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center" onClick={closeMenu}>
            {/* Adjust logo size if needed */}
            <Image src="/images/nestledigitalpharmasummitvertical.svg" alt="Logo" width={120} height={48} priority />
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[--verde]">
            <span className="sr-only">{isMenuOpen ? "Cerrar menú" : "Abrir menú"}</span>
            {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center space-x-4">
          {!isLoading && (
             isAuthenticated ? (
              <>
                <Link href="/dashboard" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-[--verde]/20 transition-colors duration-200">
                  Dashboard
                </Link>
                <Link href="/cart" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-[--verde]/20 transition-colors duration-200">
                  Carrito
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-[--verde]/20 transition-colors duration-200">
                    Admin
                  </Link>
                )}
                <button onClick={handleSignOut} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-[--verde]/20 transition-colors duration-200">
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-[--verde]/20 transition-colors duration-200">
                  Iniciar sesión
                </Link>
                <Link href="/register" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-[--verde]/20 transition-colors duration-200">
                  Registrarse
                </Link>
              </>
            )
          )}
          {isLoading && <div className="h-6 w-24 bg-gray-600 animate-pulse rounded-md"></div> /* Placeholder while loading */}
        </div>
      </div>

      {/* Mobile menu panel - Add transition */}
      <div className={`transition-all duration-300 ease-in-out md:hidden ${isMenuOpen ? 'max-h-screen opacity-100 visible' : 'max-h-0 opacity-0 invisible'} overflow-hidden absolute top-full left-0 right-0 bg-[--azul-oscuro]/95 shadow-lg z-40`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {!isLoading && (
            isAuthenticated ? (
              <>
                <Link href="/dashboard" onClick={closeMenu} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-[--verde]/20 transition-colors duration-200">
                  Dashboard
                </Link>
                <Link href="/cart" onClick={closeMenu} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-[--verde]/20 transition-colors duration-200">
                  Carrito
                </Link>
                {isAdmin && (
                  <Link href="/admin" onClick={closeMenu} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-[--verde]/20 transition-colors duration-200">
                    Admin
                  </Link>
                )}
                <button onClick={handleSignOut} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium hover:bg-[--verde]/20 transition-colors duration-200">
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={closeMenu} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-[--verde]/20 transition-colors duration-200">
                  Iniciar sesión
                </Link>
                <Link href="/register" onClick={closeMenu} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-[--verde]/20 transition-colors duration-200">
                  Registrarse
                </Link>
              </>
            )
          )}
           {isLoading && <div className="h-8 w-full bg-gray-600 animate-pulse rounded-md mb-2"></div> /* Placeholder */}
        </div>
      </div>
    </nav>
  )
}

