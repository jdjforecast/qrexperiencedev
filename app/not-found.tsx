import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, Search } from "lucide-react"

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-4 mt-8">
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <p className="text-xl mb-2">¡Ups! Página no encontrada</p>
      <p className="text-muted-foreground mb-8 max-w-md">
        No pudimos encontrar la página que estás buscando. Es posible que haya sido movida o eliminada.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild>
          <Link href="/" className="flex items-center gap-2">
            <Home size={16} />
            Volver al inicio
          </Link>
        </Button>

        <Button variant="outline" asChild>
          <Link href="/products" className="flex items-center gap-2">
            <Search size={16} />
            Ver productos
          </Link>
        </Button>
      </div>
    </div>
  )
}

