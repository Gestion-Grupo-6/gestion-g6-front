import Link from "next/link"
import { Music2, Facebook, Twitter, Instagram } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Music2 className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">TanGo</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Tu compañero de viaje para descubrir los mejores destinos del mundo.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Descubre</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/hoteles" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Hoteles
                </Link>
              </li>
              <li>
                <Link
                  href="/restaurantes"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Restaurantes
                </Link>
              </li>
              <li>
                <Link
                  href="/actividades"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Actividades
                </Link>
              </li>
              <li>
                <Link href="/destinos" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Destinos
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Compañía</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/sobre-nosotros"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Sobre nosotros
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="/terminos" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Términos y condiciones
                </Link>
              </li>
              <li>
                <Link href="/privacidad" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Política de privacidad
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Síguenos</h3>
            <div className="flex gap-3">
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} TanGo. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
