import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Profile Widget',
  description: 'Mobile optimized profile widget',
  viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
  robots: 'noindex,nofollow',
}

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        <style dangerouslySetInnerHTML={{
          __html: `
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
              -webkit-tap-highlight-color: transparent;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
              background: #f5f5f5;
              overflow-x: hidden;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }
            input, button, textarea {
              font-family: inherit;
            }
          `
        }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
