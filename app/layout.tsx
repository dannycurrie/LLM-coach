import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Coach App',
  description: 'A minimal Next.js app with TypeScript and Zod',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

