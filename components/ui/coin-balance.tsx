"use client"

import { motion } from "framer-motion"
import { Coins } from "lucide-react"

interface CoinBalanceProps {
  coins: number
  size?: "sm" | "md" | "lg"
}

export function CoinBalance({ coins, size = "md" }: CoinBalanceProps) {
  const sizeClasses = {
    sm: "text-sm py-1 px-2",
    md: "text-base py-1.5 px-3",
    lg: "text-lg py-2 px-4",
  }

  return (
    <motion.div
      className={`flex items-center gap-1.5 bg-gradient-to-r from-[#0055B8] to-[#4A7FC7] rounded-full ${sizeClasses[size]} text-white font-medium`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Coins className={size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5"} />
      <span>{coins}</span>
    </motion.div>
  )
}

