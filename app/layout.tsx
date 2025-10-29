import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
// @ts-ignore: Allow importing global CSS without type declarations
import "./globals.css"
import { MilongiaButton } from "@/components/milongia-button"
import { AuthProvider } from "@/contexts/AuthContext"

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
    <html lang="es">
      <body className={`font-sans antialiased`}>
        <AuthProvider>
          {children}
          <MilongiaButton />
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  )
}
