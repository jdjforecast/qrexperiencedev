"use client"

import { motion } from "framer-motion"
import { QrCode } from "lucide-react"
import { useScanner } from "@/contexts/scanner-context"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

/**
 * Botón flotante para abrir el escáner de códigos QR
 * @returns {JSX.Element} Botón flotante animado para escaneo
 */
export function FloatingScanButton() {
  const { openScanner } = useScanner()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Solo renderizar después de montar para evitar errores de hidratación
  useEffect(() => {
    setMounted(true)
  }, [])

  // Determinar colores basados en el tema
  const buttonBgColor = mounted && resolvedTheme === "dark" ? "bg-[#0055B8]" : "bg-[#0033A0]"
  const buttonHoverColor = mounted && resolvedTheme === "dark" ? "hover:bg-[#0077CC]" : "hover:bg-[#0055B8]"

  if (!mounted) {
    return null // Evitar renderizado durante SSR
  }

  return (
    <motion.button
      className={`fixed bottom-20 right-4 z-40 ${buttonBgColor} ${buttonHoverColor} text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={openScanner}
      aria-label="Escanear código QR"
      title="Escanear código QR"
    >
      <QrCode className="h-6 w-6" aria-hidden="true" />
      <span className="sr-only">Escanear código QR</span>
    </motion.button>
  )
}

