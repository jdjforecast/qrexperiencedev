"use client"

import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BackButtonProps {
  fallbackPath?: string
  title?: string
  className?: string
}

export function BackButton({ fallbackPath = "/", title = "Volver", className = "" }: BackButtonProps) {
  const router = useRouter()

  const handleBack = () => {
    // Intenta ir atrás en el historial, o redirige a la ruta fallback
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push(fallbackPath)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleBack}
      className={`gap-1 mb-4 hover:bg-background/60 ${className}`}
      aria-label="Volver atrás"
    >
      <ChevronLeft size={16} />
      <span>{title}</span>
    </Button>
  )
}

