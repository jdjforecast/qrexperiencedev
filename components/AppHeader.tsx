"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CoinBalance } from "@/components/ui/coin-balance"
import { ArrowLeft, ShoppingCart, Menu, X, QrCode, LogIn, UserCircle, LogOut, Home, Package } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { NestleLogo } from "@/components/ui/nestle-logo"
import { PharmaSummitLogo } from "@/components/ui/pharma-summit-logo"
import { useScanner } from "@/contexts/scanner-context"
import { useAuth } from "@/components/auth/AuthProvider"
import { useToast } from "@/components/ui/use-toast"

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
          className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
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
    <Button variant="ghost" size="icon" className="relative" onClick={onClick} aria-label="Escanear código QR">
      <QrCode className="h-6 w-6" />
    </Button>
  )
}

/**
 * Componente para el menú lateral
 */
function SideMenu({
  isOpen,
  onOpenChange,
  onLogout,
  isLoggingOut,
  isAuthenticated,
  onScanClick,
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onLogout: () => void
  isLoggingOut: boolean
  isAuthenticated: boolean
  onScanClick: () => void
}) {
  const menuItems = [
    { href: "/", label: "Inicio", icon: <Home className="h-5 w-5 mr-2" /> },
    { label: "Escanear QR", icon: <QrCode className="h-5 w-5 mr-2" />, onClick: onScanClick },
    { href: "/products", label: "Productos", icon: <Package className="h-5 w-5 mr-2" /> },
    { href: "/cart", label: "Carrito", icon: <ShoppingCart className="h-5 w-5 mr-2" /> },
  ]

  const authenticatedItems = [{ href: "/profile", label: "Mi Perfil", icon: <UserCircle className="h-5 w-5 mr-2" /> }]

  const unauthenticatedItems = [
    { href: "/login", label: "Iniciar Sesión", icon: <LogIn className="h-5 w-5 mr-2" /> },
    { href: "/register", label: "Registrarse", icon: null },
  ]

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Menú principal">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="bg-[#3E5B99]/90 backdrop-blur-md border-white/10">
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <PharmaSummitLogo width={180} height={60} />
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} aria-label="Cerrar menú">
              <X className="h-6 w-6" />
            </Button>
          </div>

          <nav className="flex flex-col gap-2" aria-label="Navegación principal">
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

            {isAuthenticated ? (
              <>
                {authenticatedItems.map((item, index) => (
                  <Link
                    key={`auth-${index}`}
                    href={item.href}
                    className="p-3 rounded-lg hover:bg-white/10 transition-colors flex items-center"
                    onClick={() => onOpenChange(false)}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}

                <button
                  onClick={onLogout}
                  disabled={isLoggingOut}
                  className="p-3 rounded-lg hover:bg-red-500/20 text-left transition-colors flex items-center text-white mt-auto"
                >
                  {isLoggingOut ? (
                    <>
                      <span className="mr-2 h-5 w-5 inline-block">
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      </span>
                      Cerrando sesión...
                    </>
                  ) : (
                    <>
                      <LogOut className="h-5 w-5 mr-2" />
                      Cerrar Sesión
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                {unauthenticatedItems.map((item, index) => (
                  <Link
                    key={`unauth-${index}`}
                    href={item.href}
                    className="p-3 rounded-lg hover:bg-white/10 transition-colors flex items-center"
                    onClick={() => onOpenChange(false)}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </>
            )}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  )
}

/**
 * Componente principal del encabezado de la aplicación
 * @param {AppHeaderProps} props - Propiedades del componente
 * @returns {JSX.Element} Componente de encabezado
 */
export function AppHeader({
  title,
  showBackButton = false,
  onBackClick,
  cartCount = 0,
  onCartClick,
}: AppHeaderProps) {
  const router = useRouter()
  const { openScanner } = useScanner()
  const { user, profile, signOut, isAuthenticated } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { toast } = useToast()

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await signOut()
      setIsMenuOpen(false)
      router.push("/login")
      toast({ title: "Sesión cerrada", description: "Has cerrado sesión exitosamente." })
    } catch (error) {
      console.error("Error logging out:", error)
      toast({ title: "Error", description: "No se pudo cerrar sesión.", variant: "destructive" })
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleCartClick = onCartClick ?? (() => router.push("/cart"))
  const handleBackClick = onBackClick ?? (() => router.back())
  const currentCoins = profile?.coins ?? null

  return (
    <header className="sticky top-0 z-30 w-full bg-gradient-to-r from-[#0033A0] to-[#0055B8]/90 backdrop-blur-md border-b border-white/10 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          {showBackButton && <BackButton onClick={handleBackClick} />}
          {title ? (
            <h1 className="text-lg font-semibold text-white truncate pr-2">{title}</h1>
          ) : (
            <Link href="/" className="flex items-center">
              <PharmaSummitLogo width={150} height={50} />
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated && <CoinBalance coins={currentCoins} />}
          <CartButton count={cartCount} onClick={handleCartClick} />
          <SideMenu
            isOpen={isMenuOpen}
            onOpenChange={setIsMenuOpen}
            onLogout={handleLogout}
            isLoggingOut={isLoggingOut}
            isAuthenticated={isAuthenticated}
            onScanClick={openScanner}
          />
        </div>
      </div>
    </header>
  )
}

