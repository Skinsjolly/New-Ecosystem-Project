import type { Metadata } from 'next'
import './globals.css'
import FirebaseInit from '@/components/FirebaseInit'

export const metadata: Metadata = {
  title: 'Smart Thinker Sheets',
  description: 'Spreadsheet editor powered by Smart Thinker',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js" />
        <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js" />
      </head>
      <body>
        <FirebaseInit />
        {children}
      </body>
    </html>
  )
}
