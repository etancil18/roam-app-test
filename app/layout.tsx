import './globals.css'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { SupabaseProvider } from '../components/SupabaseProvider'
import Link from 'next/link'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Roam App',
  description: 'Itinerary generator and map for ATL',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`min-h-screen bg-white text-black antialiased ${geistSans.variable} ${geistMono.variable}`}
      >
        <SupabaseProvider>
          <nav className="bg-black text-white px-6 py-4 flex gap-6">
            <Link href="/">Map</Link>
            <Link href="/favorites">Favorites</Link>
          </nav>
          {children}
        </SupabaseProvider>
      </body>
    </html>
  )
}
