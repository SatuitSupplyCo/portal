import type { Metadata } from "next"
import { SessionProvider } from "next-auth/react"
import { auth } from "@repo/auth"
import "./globals.css"

export const metadata: Metadata = {
  title: "Satuit Supply Portal",
  description: "Operational portal for Satuit Supply",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        <SessionProvider session={session}>{children}</SessionProvider>
      </body>
    </html>
  )
}
