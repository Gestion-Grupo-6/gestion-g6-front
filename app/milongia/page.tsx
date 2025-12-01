"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Image from "next/image"
import { useAuth } from "@/contexts/AuthContext"
import ChatTabs from "@/app/milongia/chatTabs"
import { Button } from "@/components/ui/button"
import { LogIn } from "lucide-react"
import Link from "next/link"

export default function MilongiIA() {
  const { isAuthenticated, isLoading } = useAuth()

  return (
    <div className="min-h-screen w-full flex flex-col">
      <Header />
      <main className="flex-1 w-full">
        <div className="container mx-auto px-4 py-8 w-full">
          <div className="max-w-4xl mx-auto w-full">
            {/* Header Section */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Image src="/milongia-logo.png" alt="MilongIA" width={48} height={48} className="rounded-full" />
              </div>
              <h1 className="text-4xl font-bold text-foreground mb-2">MilongIA</h1>
              <p className="text-muted-foreground text-lg">Descubre lugares increíbles personalizados para ti</p>
            </div>

            {/* Content Section - Show login message or chat tabs */}
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Cargando...</p>
              </div>
            ) : !isAuthenticated ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="bg-muted/50 rounded-lg p-8 max-w-md text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2">
                    <LogIn className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-semibold text-foreground">Inicia sesión para continuar</h2>
                  <p className="text-muted-foreground">
                    Para usar MilongIA y obtener recomendaciones personalizadas, necesitas iniciar sesión con tu cuenta.
                  </p>
                  <Link href="/login">
                    <Button size="lg" className="mt-4">
                      <LogIn className="w-4 h-4 mr-2" />
                      Iniciar Sesión
                    </Button>
                  </Link>
                  <p className="text-sm text-muted-foreground mt-4">
                    ¿No tienes cuenta?{" "}
                    <Link href="/register" className="text-primary hover:underline">
                      Regístrate aquí
                    </Link>
                  </p>
                </div>
              </div>
            ) : (
              <ChatTabs />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
