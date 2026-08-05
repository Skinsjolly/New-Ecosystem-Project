import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import FirebaseInit from '@/components/FirebaseInit'

export const metadata: Metadata = {
  title: 'Smart Thinker Slides',
  description: 'Create beautiful presentations with Smart Thinker Slides',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="antialiased">
        <FirebaseInit />
        {children}
      </body>
    </html>
  )
}
