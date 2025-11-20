import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "GenomeScan - DNA Analysis Platform",
  description: "Advanced DNA sequence analysis and therapeutic insights platform",
  generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Add a matching server-side HTML class and color-scheme style to avoid
  // hydration mismatches when the client-side theme provider updates the
  // <html> element (next-themes injects a class like "light" or "dark").
  // We use the same defaultTheme="light" value here so the server HTML
  // matches the initial client render.
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
