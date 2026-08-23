import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Gardner School | Batangas',
  description:
    "Gardner School of Multiple Intelligences is a Preschool, Elementary, Junior High, and Special Education school in San Antonio, San Pascual, Batangas.",
  // Site-wide default favicon, so the CMS/admin tabs show the crest too. The
  // public (site) layout overrides this with the favicon uploaded in Website
  // Settings; admin and auth pages inherit this static one.
  icons: {
    icon: '/images/syndesi-favicon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
      </head>
      {/* suppressHydrationWarning is scoped to this element only -- browser
          extensions (Grammarly, password managers) inject attributes onto
          <body> before React hydrates, which the app cannot prevent. Real
          hydration mismatches anywhere inside the tree still surface. */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
