"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CoinBalance } from "@/components/ui/coin-balance"
import { ArrowLeft, ShoppingCart, Menu, X, QrCode, LogIn, UserCircle, LogOut, Home, Package } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { PharmaSummitLogo } from "@/components/ui/pharma-summit-logo"
import { useScanner } from "@/contexts/scanner-context"

/**
 * Props para el componente AppHeader
 */
interface AppHeaderProps {
  /** Título de la página */
  title?: string
  /** Mostrar botón de volver */
  showBackButton?: boolean
  /** Función para manejar el clic en el botón de volver */
  onBackClick?: () => void
  /** Número de elementos en el carrito */
  cartCount?: number
  /** Función para manejar el clic en el carrito */
  onCartClick?: () => void
}

/**
 * Componente para el botón de volver
 */
function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="ghost" size="icon" className="mr-2 text-white" onClick={onClick} aria-label="Volver">
      <ArrowLeft className="h-6 w-6" />
    </Button>
  )
}

/**
 * Componente para el botón del carrito
 */
function CartButton({ count = 0, onClick }: { count: number; onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={onClick}
      aria-label={`Carrito con ${count} productos`}
    >
      <ShoppingCart className="h-6 w-6" />
      {count > 0 && (
        <span
          className="absolute -top-1 -right-1 bg-error text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse-light"
          aria-hidden="true"
        >
          {count}
        </span>
      )}
    </Button>
  )
}

/**
 * Componente para el botón de escaneo
 */
function ScanButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative hover:bg-white/10 transition-colors"
      onClick={onClick}
      aria-label="Escanear código QR"
    >
      <QrCode className="h-6 w-6" />
    </Button>
  )
}

/**
 * Componente para el menú lateral simplificado
 */
function SideMenu({
  isOpen,
  onOpenChange,
  onScanClick,
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onScanClick: () => void
}) {
  // Items siempre visibles (públicos)
  const menuItems = [
    { href: "/", label: "Inicio", icon: <Home className="h-5 w-5 mr-2" /> },
    { label: "Escanear QR", icon: <QrCode className="h-5 w-5 mr-2" />, onClick: onScanClick },
    { href: "/products", label: "Productos", icon: <Package className="h-5 w-5 mr-2" /> },
    { href: "/cart", label: "Carrito", icon: <ShoppingCart className="h-5 w-5 mr-2" /> },
  ]

  // Nuevo item para "Empezar Pedido"
  const startOrderItems = [
    { href: "/identificar", label: "Empezar Pedido", icon: <LogIn className="h-5 w-5 mr-2" /> }, // Reutilizamos icono de LogIn
  ]

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-white/10 transition-colors" aria-label="Menú principal">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="bg-primary/95 backdrop-blur-md border-white/10 w-full max-w-xs sm:max-w-sm">
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <PharmaSummitLogo width={180} height={60} />
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} aria-label="Cerrar menú">
              <X className="h-6 w-6" />
            </Button>
          </div>

          <nav className="flex flex-col gap-2 animate-fade-in" aria-label="Navegación principal">
            {/* Items públicos principales */}
            {menuItems.map((item, index) =>
              item.href ? (
                <Link
                  key={index}
                  href={item.href}
                  className="p-3 rounded-lg hover:bg-white/10 transition-colors flex items-center"
                  onClick={() => onOpenChange(false)}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ) : (
                <button
                  key={index}
                  className="p-3 rounded-lg hover:bg-white/10 transition-colors text-left flex items-center"
                  onClick={() => {
                    onOpenChange(false)
                    item.onClick && item.onClick()
                  }}
                >
                  {item.icon}
                  {item.label}
                </button>
              ),
            )}

            {/* Separador y botón "Empezar Pedido" */}
            <div className="border-t border-white/10 my-4"></div>
            {startOrderItems.map((item, index) => (
              <Link
                key={`start-${index}`}
                href={item.href}
                className="p-3 rounded-lg hover:bg-white/10 transition-colors flex items-center"
                onClick={() => onOpenChange(false)}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto text-center pt-4 border-t border-white/10 text-xs opacity-70">
            <p>© 2024 Mi Partner App</p>
            <p>Developed by KOROVA MB</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

/**
 * Componente principal del encabezado de la aplicación simplificado
 */
export function AppHeader({ title, showBackButton = false, onBackClick, cartCount = 0, onCartClick }: AppHeaderProps) {
  const router = useRouter() // Mantenemos router si es necesario para onBackClick por defecto
  const { openScanner } = useScanner()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  // Manejar evento de scroll
  const handleScroll = useCallback(() => {
    const scrollPosition = window.scrollY
    setIsScrolled(scrollPosition > 10)
  }, [])

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  // Función onBackClick por defecto si no se proporciona
  const defaultOnBackClick = () => router.back()

  // Función onCartClick por defecto (ejemplo, podría navegar a /cart)
  const defaultOnCartClick = () => router.push('/cart')

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${isScrolled ? "bg-primary/95 backdrop-blur-md" : "bg-primary"}`}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between text-white">
        <div className="flex items-center">
          {showBackButton && <BackButton onClick={onBackClick || defaultOnBackClick} />}
          {title && <h1 className="text-lg font-semibold truncate ml-2">{title}</h1>}
          {!showBackButton && !title && (
            <Link href="/" aria-label="Ir al inicio">
              <PharmaSummitLogo height={40} />
            </Link>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <ScanButton onClick={openScanner} />
          <CartButton count={cartCount} onClick={onCartClick || defaultOnCartClick} />
          <SideMenu
            isOpen={isMenuOpen}
            onOpenChange={setIsMenuOpen}
            onScanClick={openScanner}
          />
        </div>
      </div>
    </header>
  )
}

