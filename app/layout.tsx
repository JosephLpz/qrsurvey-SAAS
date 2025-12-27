import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
  title: "QRSurvey - Crea encuestas, imprime el QR y mide todo en un solo lugar",
  description: "Genera encuestas en minutos, imprime tu póster con QR y sigue resultados en tiempo real.",
  generator: "QRSurvey",
}

import { AuthProvider } from "@/providers/AuthProvider"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <AuthProvider>
          <Suspense fallback={null}>{children}</Suspense>
        </AuthProvider>
        <Analytics />
        <Toaster />
      </body>
    </html>
  )
}
