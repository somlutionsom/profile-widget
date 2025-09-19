import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Profile Widget - 나만의 프로필 위젯",
  description: "예쁘고 개성있는 프로필 위젯을 만들어보세요. 색상, 문구, 이미지를 자유롭게 커스터마이징할 수 있습니다.",
  keywords: ["프로필", "위젯", "커스터마이징", "개인화", "프로필 카드"],
  authors: [{ name: "Profile Widget" }],
  creator: "Profile Widget",
  publisher: "Profile Widget",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://profile-widget-ttux.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Profile Widget - 나만의 프로필 위젯",
    description: "예쁘고 개성있는 프로필 위젯을 만들어보세요. 색상, 문구, 이미지를 자유롭게 커스터마이징할 수 있습니다.",
    url: 'https://profile-widget-ttux.vercel.app',
    siteName: 'Profile Widget',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Profile Widget - 나만의 프로필 위젯',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  other: {
    'notion:embed': 'true',
    'notion:widget': 'true',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Profile Widget - 나만의 프로필 위젯",
    description: "예쁘고 개성있는 프로필 위젯을 만들어보세요. 색상, 문구, 이미지를 자유롭게 커스터마이징할 수 있습니다.",
    images: ['/og-image.svg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        {/* Phase 1: HTML meta 태그 추가 */}
        <meta httpEquiv="origin-trial" content="*" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="og:type" content="website" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        
        {/* 간소화된 iframe 통신 스크립트 */}
        <script dangerouslySetInnerHTML={{
          __html: `
            // 초경량 iframe 통신
            if (window.parent !== window) {
              const sendHeight = () => {
                const height = Math.max(document.body.scrollHeight, 450);
                window.parent.postMessage({
                  type: 'resize',
                  height: height
                }, '*');
              };
              
              // 초기 높이 전송
              setTimeout(sendHeight, 100);
              setTimeout(sendHeight, 500);
              
              // 간단한 ResizeObserver
              if (typeof ResizeObserver !== 'undefined') {
                new ResizeObserver(sendHeight).observe(document.body);
              }
            }
          `
        }} />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}