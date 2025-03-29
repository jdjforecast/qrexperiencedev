"use client"

import { motion } from "framer-motion"

interface PharmaSummitLogoProps {
  className?: string
  width?: number
  height?: number
}

export function PharmaSummitLogo({ className = "", width = 240, height = 80 }: PharmaSummitLogoProps) {
  return (
    <motion.div
      className={`relative ${className}`}
      style={{ width, height }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex flex-col items-center justify-center h-full">
        <div
          className="text-[#A4CE4E] font-bold tracking-wider text-2xl md:text-3xl"
          style={{ fontFamily: "Arial, sans-serif", letterSpacing: "0.1em" }}
        >
          DIGITAL
        </div>
        <div
          className="text-white font-extrabold tracking-tight text-4xl md:text-5xl -mt-1"
          style={{ fontFamily: "Arial, sans-serif", letterSpacing: "-0.02em" }}
        >
          PHARMA
        </div>
        <div
          className="text-white font-extrabold tracking-tight text-4xl md:text-5xl -mt-2"
          style={{ fontFamily: "Arial, sans-serif", letterSpacing: "-0.02em" }}
        >
          SUMMIT
        </div>
        <div className="w-full h-1 bg-[#A4CE4E] mt-1 rounded-full"></div>
      </div>
    </motion.div>
  )
}

