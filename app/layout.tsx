import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Schedule AI - Assignment & Homework Reminder',
  description: 'AI-powered reminder system for tracking assignments and homework',
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
