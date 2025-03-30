"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { ScannerModal } from "@/components/ui/scanner-modal"

interface ScannerContextType {
  openScanner: () => void
  closeScanner: () => void
  isOpen: boolean
}

const ScannerContext = createContext<ScannerContextType>({
  openScanner: () => {},
  closeScanner: () => {},
  isOpen: false,
})

export const useScanner = () => useContext(ScannerContext)

export function ScannerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [userCoins, setUserCoins] = useState(0)

  const openScanner = () => setIsOpen(true)
  const closeScanner = () => setIsOpen(false)

  const handleProductAdded = (product: any) => {
    setCartCount((prev) => prev + 1)
    // You could also update a global cart state here
  }

  const handleCoinsAdded = (coins: number) => {
    setUserCoins((prev) => prev + coins)
    // You could also update a global user state here
  }

  return (
    <ScannerContext.Provider value={{ openScanner, closeScanner, isOpen }}>
      {children}
      <ScannerModal
        isOpen={isOpen}
        onClose={closeScanner}
        onProductAdded={handleProductAdded}
        onCoinsAdded={handleCoinsAdded}
      />
    </ScannerContext.Provider>
  )
}

