"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { QrCode, ShoppingCart, User } from "lucide-react"
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
      className={`flex flex-col items-center ${isActive ? "text-white" : "text-white/70"}`}
      onClick={onClick}
      aria-label={label}
      aria-pressed={isActive}
    >
      {icon}
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

    // Si estamos al principio de la página, siempre mostrar el footer
    if (currentScrollY < 100) {
      setIsVisible(true)
    } else {
      // Ocultar al hacer scroll hacia abajo, mostrar al hacer scroll hacia arriba
      setIsVisible(currentScrollY < lastScrollY || currentScrollY < 50)
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
    <div className="flex flex-col">
      {/* Pie de página con información de copyright */}
      <div className="bg-[#0033A0]/80 backdrop-blur-md border-t border-white/10 p-4 text-center text-white/70 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col items-center">
          <NestleLogo width={70} height={28} className="mb-2" />
          <p className="mb-3">
            Una experiencia{" "}
            <Link
              href="https://mipartner.com.co/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-200 hover:text-white transition-colors"
            >
              Mipartner
            </Link>
            , developed by Jaime Forero Castillo
          </p>
          <div className="flex items-center justify-center">
            <span className="font-bold">KOROVA MB</span>
            <MilkBoxIcon className="h-4 w-4 ml-1" />
            <span className="ml-2">all rights reserved 2025</span>
          </div>
        </div>
      </div>

      {/* Barra de navegación inferior */}
      <footer
        className={`bg-[#0055B8]/50 backdrop-blur-md border-t border-white/10 p-2 fixed bottom-0 w-full z-20 transition-transform duration-300 ease-in-out ${
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
      </footer>
    </div>
  )
}

