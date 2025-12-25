import type { Metadata } from 'next'
import './globals.css'
import { ParticlesBackground } from '@/components/ParticlesBackground'

export const metadata: Metadata = {
  title: 'FortisArena - Join Tournament',
  description: 'Join the official FortisArena tournament. Complete the steps to register and compete.',
  keywords: ['tournament', 'esports', 'gaming', 'FortisArena', 'competition'],
  icons: {
    icon: '/iconb.svg',
    shortcut: '/iconb.svg',
    apple: '/iconb.svg',
  },
  openGraph: {
    title: 'FortisArena - Join Tournament',
    description: 'Join the official FortisArena tournament',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ParticlesBackground />
        <main className="relative z-10 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}
