"use client"
import Image from "next/image"
import { motion } from "framer-motion"

interface NestlePharmaLogoProps {
  className?: string
  variant?: "full" | "compact"
  width?: number
  height?: number
}

export function NestlePharmaLogo({
  className = "",
  variant = "full",
  width = 200,
  height = 80,
}: NestlePharmaLogoProps) {
  const logoPath = variant === "full" ? "/nestle-pharma-summit-logo.svg" : "/nestle-pharma-icon.svg"

  return (
    <motion.div className={`relative ${className}`} whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
      <Image src={logoPath} alt="Nestlé Pharma Summit Logo" width={width} height={height} priority />
    </motion.div>
  )
}

