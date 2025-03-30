"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { QrCode, ShoppingCart, User, Home } from "lucide-react"
import { useRouter } from "next/navigation"
import { NestleLogo } from "@/components/ui/nestle-logo"
import { useScanner } from "@/contexts/scanner-context"
import { useEffect, useState, useCallback } from "react"
import Link from "next/link"

/**
 * Props para el componente AppFooter
 */
interface AppFooterProps {
  /** Pestaña actualmente activa */
  activeTab: string
  /** Función para cambiar de pestaña */
  onTabChange?: (tab: string) => void
}

/**
 * Props para el componente NavButton
 */
interface NavButtonProps {
  /** Icono a mostrar */
  icon: React.ReactNode
  /** Texto del botón */
  label: string
  /** Indica si el botón está activo */
  isActive: boolean
  /** Manejador de clic */
  onClick: () => void
}

/**
 * Componente para el icono de caja de leche
 */
function MilkBoxIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M8 2h8l2 4H6l2-4z" />
      <path d="M6 6v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </svg>
  )
}

/**
 * Componente para un botón de navegación
 */
function NavButton({ icon, label, isActive, onClick }: NavButtonProps) {
  return (
    <Button
      variant="ghost"
      className={`relative flex flex-col items-center justify-center h-14 ${
        isActive 
        ? "text-white nav-active" 
        : "text-white/70 hover:text-white"
      }`}
      onClick={onClick}
      aria-label={label}
      aria-pressed={isActive}
    >
      <div className={`${isActive ? "scale-110" : ""} transition-transform duration-200`}>
        {icon}
      </div>
      <span className="text-xs mt-1">{label}</span>
    </Button>
  )
}

/**
 * Componente para el pie de página de la aplicación
 * Incluye información de copyright y navegación
 * @param {AppFooterProps} props - Propiedades del componente
 * @returns {JSX.Element} Componente de pie de página
 */
export function AppFooter({ activeTab, onTabChange }: AppFooterProps) {
  const router = useRouter()
  const { openScanner } = useScanner()
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  // Controlador de scroll optimizado con useCallback
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY
    const threshold = 50

    // Si estamos al principio de la página, siempre mostrar el footer
    if (currentScrollY < threshold) {
      setIsVisible(true)
      return
    }

    // Ocultar al hacer scroll hacia abajo, mostrar al hacer scroll hacia arriba
    if (
      (currentScrollY < lastScrollY && currentScrollY > threshold) || 
      // Siempre mostrar cuando llegamos cerca del final de la página
      (window.innerHeight + currentScrollY) >= document.body.offsetHeight - 100
    ) {
      setIsVisible(true)
    } else if (currentScrollY > lastScrollY && currentScrollY > threshold) {
      setIsVisible(false)
    }

    setLastScrollY(currentScrollY)
  }, [lastScrollY])

  // Controlar la visibilidad del footer de navegación basado en el scroll
  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  // Manejador para cambiar de pestaña
  const handleTabChange = (tab: string) => {
    if (tab === "scanner") {
      openScanner()
      return
    }

    if (onTabChange) {
      onTabChange(tab)
    } else {
      // Navegar a la página correspondiente
      switch (tab) {
        case "home":
          router.push("/")
          break
        case "cart":
          router.push("/cart")
          break
        case "profile":
          router.push("/profile")
          break
      }
    }
  }

  // Configuración de los botones de navegación
  const navButtons = [
    {
      id: "home",
      label: "Inicio",
      icon: <Home className="h-6 w-6" aria-hidden="true" />,
      onClick: () => handleTabChange("home"),
    },
    {
      id: "scanner",
      label: "Escanear",
      icon: <QrCode className="h-6 w-6" aria-hidden="true" />,
      onClick: () => handleTabChange("scanner"),
    },
    {
      id: "cart",
      label: "Carrito",
      icon: <ShoppingCart className="h-6 w-6" aria-hidden="true" />,
      onClick: () => handleTabChange("cart"),
    },
    {
      id: "profile",
      label: "Perfil",
      icon: <User className="h-6 w-6" aria-hidden="true" />,
      onClick: () => handleTabChange("profile"),
    },
  ]

  return (
    <>
      {/* Barra de navegación inferior para móviles */}
      <nav
        className={`md:hidden fixed bottom-0 left-0 right-0 bg-primary/95 backdrop-blur-md border-t border-white/20 z-30 transition-transform duration-300 ease-in-out ${
          isVisible ? "translate-y-0" : "translate-y-full"
        }`}
        aria-label="Navegación principal"
        role="navigation"
      >
        <div className="flex justify-around">
          {navButtons.map((button) => (
            <NavButton
              key={button.id}
              icon={button.icon}
              label={button.label}
              isActive={activeTab === button.id}
              onClick={button.onClick}
            />
          ))}
        </div>
      </nav>

      {/* Pie de página con información de copyright - visible en todos los tamaños */}
      <footer className="bg-primary-dark/80 backdrop-blur-md border-t border-white/10 p-4 text-center text-white/70 text-xs mt-auto">
        <div className="container mx-auto">
          <p className="mb-1">
            Una experiencia{" "}
            <Link
              href="https://mipartner.com.co/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-200 hover:text-white transition-colors"
            >
              Mipartner
            </Link>
          </p>
          <p>© 2024 KOROVA MB. Todos los derechos reservados.</p>
        </div>
      </footer>
    </>
  )
}

