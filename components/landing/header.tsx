import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Header() {
  return (
    <header className="fixed top-0 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 border-b">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="text-2xl font-black tracking-tight flex items-center gap-2">
          <span className="text-orange-600">QR</span>
          <span className="text-slate-900">Survey</span>
        </Link>

        <nav className="hidden lg:flex items-center space-x-10">
          <Link href="#funciones" className="text-foreground hover:text-orange-600 transition-colors font-bold text-sm">
            Funciones
          </Link>
          <Link href="#precios" className="text-foreground hover:text-orange-600 transition-colors font-bold text-sm">
            Precios
          </Link>
          <Link href="#recursos" className="text-foreground hover:text-orange-600 transition-colors font-bold text-sm">
            Recursos
          </Link>
          <Link href="#contacto" className="text-foreground hover:text-orange-600 transition-colors font-bold text-sm">
            Contacto
          </Link>
        </nav>

        <div className="flex items-center space-x-3">
          <Link href="/login">
            <Button variant="ghost" className="font-bold text-slate-600 hover:text-orange-600">Iniciar sesión</Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-orange-600 hover:bg-orange-700 text-white font-black px-6 shadow-lg shadow-orange-100 rounded-xl transition-all hover:scale-105 active:scale-95">
              Probar gratis
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
