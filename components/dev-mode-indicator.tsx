"use client"

import { useState } from "react"
import { DISABLE_AUTH, USE_MOCK_USER, MOCK_USER } from "@/lib/dev-mode"

export function DevModeIndicator() {
  const [expanded, setExpanded] = useState(false)

  // Solo mostrar en modo de desarrollo
  if (!DISABLE_AUTH) return null

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full">
      <div
        className="bg-yellow-500 text-black px-4 py-2 flex justify-between items-center cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center">
          <span className="font-bold mr-2">🛠️ MODO DESARROLLO</span>
          {USE_MOCK_USER && (
            <span>
              Usuario: {MOCK_USER.email} ({MOCK_USER.app_metadata.role})
            </span>
          )}
        </div>
        <span>{expanded ? "▼" : "▲"}</span>
      </div>

      {expanded && (
        <div className="bg-yellow-100 p-4 border-t border-yellow-600">
          <h3 className="font-bold mb-2">Configuración de Desarrollo</h3>
          <ul className="list-disc pl-5">
            <li>Autenticación deshabilitada: {DISABLE_AUTH ? "Sí" : "No"}</li>
            <li>Usuario de prueba: {USE_MOCK_USER ? "Sí" : "No"}</li>
            {USE_MOCK_USER && (
              <>
                <li>Email: {MOCK_USER.email}</li>
                <li>Rol: {MOCK_USER.app_metadata.role}</li>
                <li>Nombre: {MOCK_USER.user_metadata.full_name}</li>
                <li>Empresa: {MOCK_USER.user_metadata.company_name}</li>
              </>
            )}
          </ul>
          <p className="mt-4 text-sm">
            Para cambiar esta configuración, edita el archivo <code>lib/dev-mode.ts</code>
          </p>
        </div>
      )}
    </div>
  )
}

