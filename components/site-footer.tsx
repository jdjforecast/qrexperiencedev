"use client"

import Link from "next/link"
import { PharmaSummitLogo } from "./ui/pharma-summit-logo"

export function SiteFooter() {
  return (
    <footer className="mt-auto py-4 px-6 text-white/80 text-sm backdrop-blur-sm bg-black/20 border-t border-white/10">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-2">
          <PharmaSummitLogo width={100} height={40} />
        </div>

        <div className="text-center md:text-right">
          <p>© {new Date().getFullYear()} MiPartner. Todos los derechos reservados.</p>
          <div className="mt-2 flex flex-wrap justify-center md:justify-end gap-4">
            <Link href="/terms" className="hover:text-white">
              Términos y Condiciones
            </Link>
            <Link href="/privacy" className="hover:text-white">
              Política de Privacidad
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

