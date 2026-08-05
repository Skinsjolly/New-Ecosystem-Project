import type { Metadata } from 'next'
import './globals.css'
import FirebaseInit from '@/components/FirebaseInit'
import { ThemeProvider } from '@/lib/ThemeContext'

export const metadata: Metadata = {
  title: 'Smart Thinker',
  description: 'AI-Powered Search Engine Ecosystem',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js" />
        <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js" />
      </head>
      <body>
        <ThemeProvider>
          <FirebaseInit />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}