import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Registro de Pagos - Billeteras Virtuales',
  description: 'Aplicación para registrar y gestionar pagos desde billeteras virtuales',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          <header className="border-b">
            <div className="container mx-auto px-4 py-4">
              <h1 className="text-2xl font-bold text-foreground">
                💳 Registro de Pagos
              </h1>
              <p className="text-muted-foreground">
                Gestiona tus pagos desde billeteras virtuales
              </p>
            </div>
          </header>
          <main className="container mx-auto px-4 py-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
