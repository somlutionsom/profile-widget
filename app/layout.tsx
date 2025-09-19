import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const pressStart2P = Press_Start_2P({
  variable: "--font-press-start-2p",
  subsets: ["latin"],
  weight: "400",
});

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
        <script dangerouslySetInnerHTML={{
          __html: `
            // 노션 모바일 감지 및 iframe 통신 브릿지 (최상단 실행)
            (function() {
              const isNotionMobile = /Notion|Mobile/i.test(navigator.userAgent) && window.innerWidth < 768;
              
              if (isNotionMobile) {
                console.log('노션 모바일 환경이 감지되었습니다. 최적화 모드를 적용합니다.');
                
                // 노션 모바일 환경 플래그 설정
                window.isNotionMobile = true;
                
                // CSS 최적화 적용
                document.documentElement.classList.add('notion-mobile-optimized');
                
                // 성능 최적화를 위한 기본 설정
                document.documentElement.style.setProperty('--animation-duration', '0.1s');
                document.documentElement.style.setProperty('--transition-duration', '0.1s');
              } else {
                window.isNotionMobile = false;
              }

              // Phase 3: iframe 통신 브릿지
              (function() {
                console.log('iframe 통신 브릿지를 초기화합니다.');
                
                // iframe 환경 감지
                const isInIframe = window.parent !== window;
                
                if (isInIframe) {
                  console.log('iframe 환경이 감지되었습니다. 부모 프레임과 통신을 시작합니다.');
                  
                  // iframe 통신 상태 플래그
                  window.iframeBridge = {
                    isActive: true,
                    parentOrigin: '*',
                    messageQueue: []
                  };

                  // 초기 로드 완료 메시지 전송
                  const sendLoadedMessage = () => {
                    const height = Math.max(
                      document.body.scrollHeight,
                      document.documentElement.scrollHeight,
                      document.body.offsetHeight,
                      document.documentElement.offsetHeight,
                      document.body.clientHeight,
                      document.documentElement.clientHeight
                    );
                    
                    const message = {
                      type: 'loaded',
                      height: height,
                      source: 'profile-widget',
                      timestamp: Date.now()
                    };
                    
                    window.parent.postMessage(message, '*');
                    console.log('로드 완료 메시지 전송:', message);
                  };

                  // 높이 변경 감지 및 자동 조정
                  const setupResizeObserver = () => {
                    if (typeof ResizeObserver !== 'undefined') {
                      const resizeObserver = new ResizeObserver(() => {
                        const height = Math.max(
                          document.body.scrollHeight,
                          document.documentElement.scrollHeight,
                          document.body.offsetHeight,
                          document.documentElement.offsetHeight,
                          document.body.clientHeight,
                          document.documentElement.clientHeight
                        );
                        
                        const message = {
                          type: 'resize',
                          height: height,
                          source: 'profile-widget',
                          timestamp: Date.now()
                        };
                        
                        window.parent.postMessage(message, '*');
                        console.log('크기 변경 메시지 전송:', message);
                      });
                      
                      resizeObserver.observe(document.body);
                      resizeObserver.observe(document.documentElement);
                      
                      console.log('ResizeObserver가 설정되었습니다.');
                    } else {
                      console.warn('ResizeObserver를 사용할 수 없습니다. 폴백 모드로 전환합니다.');
                      
                      // ResizeObserver 폴백: 주기적 높이 체크
                      setInterval(() => {
                        const currentHeight = Math.max(
                          document.body.scrollHeight,
                          document.documentElement.scrollHeight
                        );
                        
                        if (window.iframeBridge.lastHeight !== currentHeight) {
                          window.iframeBridge.lastHeight = currentHeight;
                          
                          const message = {
                            type: 'resize',
                            height: currentHeight,
                            source: 'profile-widget',
                            timestamp: Date.now()
                          };
                          
                          window.parent.postMessage(message, '*');
                          console.log('폴백 크기 변경 메시지 전송:', message);
                        }
                      }, 500);
                    }
                  };

                  // 부모로부터 메시지 수신
                  const handleParentMessage = (event) => {
                    if (event.data && event.data.source === 'notion') {
                      console.log('부모 프레임으로부터 메시지 수신:', event.data);
                      
                      switch (event.data.type) {
                        case 'ping':
                          // 핑 메시지에 대한 응답
                          window.parent.postMessage({
                            type: 'pong',
                            source: 'profile-widget',
                            timestamp: Date.now()
                          }, '*');
                          break;
                          
                        case 'requestHeight':
                          // 높이 요청에 대한 응답
                          const height = Math.max(
                            document.body.scrollHeight,
                            document.documentElement.scrollHeight
                          );
                          
                          window.parent.postMessage({
                            type: 'heightResponse',
                            height: height,
                            source: 'profile-widget',
                            timestamp: Date.now()
                          }, '*');
                          break;
                      }
                    }
                  };

                  // 이벤트 리스너 등록
                  window.addEventListener('message', handleParentMessage);
                  
                  // DOM이 준비되면 초기화
                  if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', () => {
                      sendLoadedMessage();
                      setupResizeObserver();
                    });
                  } else {
                    sendLoadedMessage();
                    setupResizeObserver();
                  }
                  
                  // 윈도우 리사이즈 이벤트도 감지
                  window.addEventListener('resize', () => {
                    setTimeout(() => {
                      const height = Math.max(
                        document.body.scrollHeight,
                        document.documentElement.scrollHeight
                      );
                      
                      const message = {
                        type: 'resize',
                        height: height,
                        source: 'profile-widget',
                        timestamp: Date.now()
                      };
                      
                      window.parent.postMessage(message, '*');
                      console.log('윈도우 리사이즈 메시지 전송:', message);
                    }, 100);
                  });
                  
                } else {
                  console.log('일반 브라우저 환경입니다. iframe 통신을 비활성화합니다.');
                  window.iframeBridge = { isActive: false };
                }
              })();
            })();
          `
        }} />
        <meta httpEquiv="origin-trial" content="*" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="og:type" content="website" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover" />
        <meta name="theme-color" content="#FFD0D8" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Profile Widget" />
        <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <style dangerouslySetInnerHTML={{
          __html: `
            /* 위젯 환경을 위한 기본 스타일 */
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              width: 100% !important;
              height: auto !important;
              min-height: 100vh !important;
              overflow-x: hidden !important;
              -webkit-overflow-scrolling: touch !important;
              -webkit-font-smoothing: antialiased !important;
              -moz-osx-font-smoothing: grayscale !important;
            }
            
            /* iOS Safari 및 위젯 환경 대응 */
            * {
              -webkit-tap-highlight-color: transparent !important;
              -webkit-touch-callout: none !important;
              -webkit-user-select: none !important;
              user-select: none !important;
            }
            
            /* 텍스트 선택 허용 */
            input, textarea {
              -webkit-user-select: text !important;
              user-select: text !important;
            }
          `
        }} />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} ${pressStart2P.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
