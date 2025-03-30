"use client"

import { useState } from "react"
import { Scan, KeyboardIcon, X } from "lucide-react"
import QrScannerFab from "./qr-scanner-fab"
import ManualCodeEntry from "./manual-code-entry"

export default function MultiOptionScanner() {
  const [showOptions, setShowOptions] = useState(false)
  const [selectedOption, setSelectedOption] = useState<"scanner" | "manual" | null>(null)

  const handleSelectOption = (option: "scanner" | "manual") => {
    setSelectedOption(option)
    setShowOptions(false)
  }

  const renderSelectedComponent = () => {
    switch (selectedOption) {
      case "scanner":
        return <QrScannerFab />
      case "manual":
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
            <div className="relative w-full max-w-md rounded-lg bg-white p-6">
              <button
                onClick={() => setSelectedOption(null)}
                className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
                aria-label="Cerrar"
              >
                <X className="h-6 w-6" />
              </button>

              <h3 className="mb-4 text-center text-xl font-bold">Ingresar código manualmente</h3>
              <ManualCodeEntry />
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <>
      {/* Botón flotante principal */}
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Opciones de escaneo"
      >
        <Scan className="h-6 w-6" />
      </button>

      {/* Menú de opciones */}
      {showOptions && (
        <div className="fixed bottom-24 right-6 z-50 w-48 rounded-lg bg-white p-2 shadow-xl">
          <button
            onClick={() => handleSelectOption("scanner")}
            className="flex w-full items-center rounded-md p-2 text-left hover:bg-gray-100"
          >
            <Scan className="mr-2 h-5 w-5 text-blue-600" />
            <span>Escáner QR</span>
          </button>

          <button
            onClick={() => handleSelectOption("manual")}
            className="flex w-full items-center rounded-md p-2 text-left hover:bg-gray-100"
          >
            <KeyboardIcon className="mr-2 h-5 w-5 text-purple-600" />
            <span>Ingresar código</span>
          </button>
        </div>
      )}

      {/* Renderizar el componente seleccionado */}
      {renderSelectedComponent()}
    </>
  )
}

