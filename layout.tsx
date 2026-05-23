import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans, Inter, Cormorant_Garamond, Jost, DM_Sans, Space_Grotesk, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

// Load all fonts needed for different niches
const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-plus-jakarta" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cormorantGaramond = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-cormorant" });
const jost = Jost({ subsets: ["latin"], variable: "--font-jost" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });
const playfairDisplay = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#FFFBF5',
}

export const metadata: Metadata = {
  title: 'WhatsApp E-Flyer Generator',
  description: 'Create stunning WhatsApp-ready e-flyers for your business',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${inter.variable} ${cormorantGaramond.variable} ${jost.variable} ${dmSans.variable} ${spaceGrotesk.variable} ${playfairDisplay.variable}`}>
      <body className="font-sans antialiased bg-background">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
