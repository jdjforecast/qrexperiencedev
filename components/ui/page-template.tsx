"use client"

import { ReactNode } from "react"
import { AppHeader } from "@/components/AppHeader"
import { AppFooter } from "@/components/AppFooter"
import { useRouter } from "next/navigation"

interface PageTemplateProps {
  title?: string
  children: ReactNode
  showBackButton?: boolean
  activeTab?: string
  className?: string
  headerProps?: {
    cartCount?: number
    onCartClick?: () => void
    onBackClick?: () => void
  }
}

/**
 * Componente de plantilla de página que incluye encabezado y pie de página
 * para mantener una experiencia de usuario consistente
 */
export function PageTemplate({
  title,
  children,
  showBackButton = false,
  activeTab = "unknown",
  className = "",
  headerProps = {},
}: PageTemplateProps) {
  const router = useRouter()
  
  const defaultHeaderProps = {
    onBackClick: () => router.back(),
    ...headerProps,
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader 
        title={title} 
        showBackButton={showBackButton} 
        {...defaultHeaderProps} 
      />
      
      <main className={`flex-1 ${className}`}>
        {children}
      </main>
      
      <AppFooter activeTab={activeTab} />
    </div>
  )
}

/**
 * Componente para envolver el contenido de la página en un contenedor
 */
export function PageContent({
  children,
  className = "",
  fullWidth = false,
}: {
  children: ReactNode
  className?: string
  fullWidth?: boolean
}) {
  const containerClass = fullWidth 
    ? "container-wide" 
    : "container-narrow"
  
  return (
    <div className={`${containerClass} my-4 ${className}`}>
      {children}
    </div>
  )
}

/**
 * Componente para mostrar un título de sección
 */
export function SectionTitle({
  title,
  subtitle,
  className = "",
}: {
  title: string
  subtitle?: string
  className?: string
}) {
  return (
    <div className={`mb-4 ${className}`}>
      <h2 className="text-xl font-bold text-white">{title}</h2>
      {subtitle && <p className="text-white/70 text-sm">{subtitle}</p>}
      <div className="h-0.5 w-16 bg-white/20 mt-2"></div>
    </div>
  )
}

/**
 * Componente para mostrar un mensaje de error
 */
export function ErrorMessage({
  message,
  onRetry,
  className = "",
}: {
  message: string
  onRetry?: () => void
  className?: string
}) {
  return (
    <div className={`card-solid text-center p-6 ${className}`}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-12 w-12 text-error mx-auto mb-4">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <h3 className="text-xl font-bold mb-2 text-white">Error</h3>
      <p className="mb-6 text-white/80">{message}</p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="bg-white/20 hover:bg-white/30 transition-colors text-white font-medium rounded-lg py-2 px-4"
        >
          Intentar de nuevo
        </button>
      )}
    </div>
  )
}

/**
 * Componente para mostrar un mensaje de carga
 */
export function LoadingMessage({
  message = "Cargando...",
  className = "",
}: {
  message?: string
  className?: string
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <svg className="animate-spin h-10 w-10 text-white mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p className="text-white text-lg font-medium">{message}</p>
    </div>
  )
}

/**
 * Componente para mostrar una tarjeta
 */
export function Card({
  children,
  className = "",
  solid = false,
}: {
  children: ReactNode
  className?: string
  solid?: boolean
}) {
  const baseClass = solid ? "card-solid" : "card"
  return (
    <div className={`${baseClass} ${className}`}>{children}</div>
  )
} 