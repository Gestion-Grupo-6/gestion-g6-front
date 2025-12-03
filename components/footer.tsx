import Link from "next/link"
import { Facebook, Twitter, Instagram } from "lucide-react"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center mb-4">
              <Image src="/tango-logo.png" alt="TanGo" width={120} height={40} className="h-10 w-auto" priority />
            </Link>
            <p className="text-sm text-muted-foreground">
              Tu compañero de viaje para descubrir los mejores destinos del mundo.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Descubre</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/hotels" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Hoteles
                </Link>
              </li>
              <li>
                <Link
                  href="/restaurants"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Restaurantes
                </Link>
              </li>
              <li>
                <Link
                  href="/activities"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Actividades
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-4">Tu cuenta</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/mis-publicaciones" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Mis Publicaciones
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Mi perfil
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} TanGo. Todos los derechos reservados. / V.1.0.2
          </p>
        </div>
      </div>
    </footer>
  )
}
