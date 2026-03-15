import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'

export const metadata: Metadata = {
  title: 'DICT M&E Dashboard | Department of Information Communication & Technology',
  description:
    'Monitoring and Evaluation Dashboard for the Department of Information Communication & Technology, Government of Papua New Guinea.',
  keywords: ['DICT', 'Papua New Guinea', 'ICT', 'Monitoring', 'Evaluation', 'Dashboard'],
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
