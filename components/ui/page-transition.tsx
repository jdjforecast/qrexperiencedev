"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"

// Tipos de transiciones disponibles
type TransitionType = "fade" | "slide-up" | "slide-left" | "zoom" | "none"

interface PageTransitionProps {
  children: ReactNode
  type?: TransitionType
  duration?: number
  className?: string
}

/**
 * Componente que añade transiciones suaves a las páginas
 * para mejorar la experiencia de usuario
 */
export function PageTransition({
  children,
  type = "fade",
  duration = 0.3,
  className = "",
}: PageTransitionProps) {
  // Configuración de animaciones por tipo
  const animations = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    "slide-up": {
      initial: { opacity: 0, y: 15 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 15 },
    },
    "slide-left": {
      initial: { opacity: 0, x: 15 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 15 },
    },
    zoom: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
    },
    none: {
      initial: {},
      animate: {},
      exit: {},
    },
  }

  // Si el tipo de transición no está disponible, usar fade
  const animation = animations[type] || animations.fade

  return (
    <motion.div
      initial={animation.initial}
      animate={animation.animate}
      exit={animation.exit}
      transition={{ 
        duration, 
        ease: "easeInOut" 
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Componente para animar elementos cuando entran en el viewport
 */
export function AnimateOnView({
  children,
  type = "fade",
  delay = 0,
  threshold = 0.1,
  className = "",
}: {
  children: ReactNode
  type?: TransitionType
  delay?: number
  threshold?: number
  className?: string
}) {
  // Configuración de animaciones por tipo
  const animations = {
    fade: {
      initial: { opacity: 0 },
      whileInView: { opacity: 1 },
    },
    "slide-up": {
      initial: { opacity: 0, y: 20 },
      whileInView: { opacity: 1, y: 0 },
    },
    "slide-left": {
      initial: { opacity: 0, x: 20 },
      whileInView: { opacity: 1, x: 0 },
    },
    zoom: {
      initial: { opacity: 0, scale: 0.9 },
      whileInView: { opacity: 1, scale: 1 },
    },
    none: {
      initial: {},
      whileInView: {},
    },
  }

  // Si el tipo de transición no está disponible, usar fade
  const animation = animations[type] || animations.fade

  return (
    <motion.div
      initial={animation.initial}
      whileInView={animation.whileInView}
      viewport={{ once: true, amount: threshold }}
      transition={{ 
        duration: 0.5, 
        delay, 
        ease: "easeOut" 
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
} 