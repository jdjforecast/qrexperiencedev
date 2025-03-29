"use client"

import type { ReactNode } from "react"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

interface ErrorHandlerProps {
  error: string | null
  className?: string
  action?: {
    label: string
    onClick: () => void
    icon?: ReactNode
  }
}

export function ErrorHandler({ error, className = "", action }: ErrorHandlerProps) {
  if (!error) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-white ${className}`}
    >
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 mr-2 text-red-400 shrink-0 mt-0.5" />
        <p className="text-sm">{error}</p>
      </div>

      {action && (
        <Button onClick={action.onClick} className="mt-3 w-full bg-blue-600 hover:bg-blue-700">
          {action.icon}
          {action.label}
        </Button>
      )}
    </motion.div>
  )
}

