import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-muted/50 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="text-2xl font-bold text-primary mb-4 block">
              QRSurvey
            </Link>
            <p className="text-muted-foreground mb-4">
              La plataforma más fácil para crear encuestas, generar códigos QR y medir satisfacción.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-primary">
                Twitter
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                LinkedIn
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                Facebook
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Producto</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#funciones" className="text-muted-foreground hover:text-primary">
                  Funciones
                </Link>
              </li>
              <li>
                <Link href="#precios" className="text-muted-foreground hover:text-primary">
                  Precios
                </Link>
              </li>
              <li>
                <Link href="/demo" className="text-muted-foreground hover:text-primary">
                  Demo
                </Link>
              </li>
              <li>
                <Link href="/integraciones" className="text-muted-foreground hover:text-primary">
                  Integraciones
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Recursos</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/blog" className="text-muted-foreground hover:text-primary">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/guias" className="text-muted-foreground hover:text-primary">
                  Guías
                </Link>
              </li>
              <li>
                <Link href="/casos-de-uso" className="text-muted-foreground hover:text-primary">
                  Casos de uso
                </Link>
              </li>
              <li>
                <Link href="/estado" className="text-muted-foreground hover:text-primary">
                  Estado del servicio
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Soporte</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/contacto" className="text-muted-foreground hover:text-primary">
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="/ayuda" className="text-muted-foreground hover:text-primary">
                  Centro de ayuda
                </Link>
              </li>
              <li>
                <Link href="/api" className="text-muted-foreground hover:text-primary">
                  Documentación API
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">© 2024 QRSurvey. Todos los derechos reservados.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/terminos" className="text-muted-foreground hover:text-primary text-sm">
              Términos de servicio
            </Link>
            <Link href="/privacidad" className="text-muted-foreground hover:text-primary text-sm">
              Política de privacidad
            </Link>
            <Link href="/seguridad" className="text-muted-foreground hover:text-primary text-sm">
              Seguridad
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
