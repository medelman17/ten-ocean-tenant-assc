import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "10 Ocean Tenant Association",
  description: "Bringing our community together for a better living experience.",
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/icon.png", type: "image/png" }],
    apple: { url: "/apple-icon.png", type: "image/png" },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
