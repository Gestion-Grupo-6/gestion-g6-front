import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
// @ts-ignore: Allow importing global CSS without type declarations
import "./globals.css"
import { MilongiaButton } from "@/components/milongia-button"
import { AuthProvider } from "@/contexts/AuthContext"
import { NotificationProvider } from "@/contexts/NotificationContext"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"
import { LocationProvider } from "@/contexts/LocationContext"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TanGo - Descubre tu próximo destino",
  description: "Encuentra los mejores hoteles, restaurantes y actividades para tu viaje",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>
            <NotificationProvider>
              <LocationProvider>
                {children}
                <MilongiaButton />
                <Toaster richColors position="top-right" />
                <Analytics />
              </LocationProvider>
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
