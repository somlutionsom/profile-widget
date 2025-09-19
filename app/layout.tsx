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
        {/* Phase 1: HTML meta 태그 추가 */}
        <meta httpEquiv="origin-trial" content="*" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="og:type" content="website" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        
        {/* Phase 2-5: 통합 스크립트 */}
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
              }
              
              // iframe 환경 감지
              if (window.parent !== window) {
                console.log('iframe 환경이 감지되었습니다.');
                document.documentElement.classList.add('iframe-embedded');
                
                // iframe 통신 브릿지 설정
                window.iframeBridge = {
                  isActive: true,
                  parentOrigin: '*',
                  messageQueue: []
                };
                
                // 높이 자동 조정 함수
                const sendHeightUpdate = () => {
                  const height = Math.max(
                    document.body.scrollHeight,
                    document.documentElement.scrollHeight,
                    window.innerHeight
                  );
                  
                  if (window.iframeBridge && window.iframeBridge.isActive) {
                    window.parent.postMessage({
                      type: 'resize',
                      height: height,
                      source: 'profile-widget',
                      timestamp: Date.now()
                    }, '*');
                  }
                };
                
                // 초기 높이 전송
                setTimeout(sendHeightUpdate, 100);
                setTimeout(sendHeightUpdate, 500);
                setTimeout(sendHeightUpdate, 1000);
                
                // ResizeObserver 설정 (지원하는 경우)
                if (typeof ResizeObserver !== 'undefined') {
                  const resizeObserver = new ResizeObserver(sendHeightUpdate);
                  resizeObserver.observe(document.body);
                  resizeObserver.observe(document.documentElement);
                } else {
                  // 폴백: 주기적 높이 체크
                  setInterval(sendHeightUpdate, 1000);
                }
                
                // 부모로부터 메시지 수신
                window.addEventListener('message', (event) => {
                  if (event.data && event.data.source === 'notion-parent') {
                    console.log('부모 프레임으로부터 메시지 수신:', event.data);
                    
                    if (event.data.type === 'request-height') {
                      sendHeightUpdate();
                    }
                  }
                });
                
                // 로드 완료 메시지 전송
                setTimeout(() => {
                  window.parent.postMessage({
                    type: 'loaded',
                    height: document.body.scrollHeight,
                    source: 'profile-widget',
                    timestamp: Date.now()
                  }, '*');
                }, 1000);
              }
              
              // Phase 4: 점진적 렌더링 전략
              if (isNotionMobile) {
                console.log('Phase 4: 점진적 렌더링 전략을 시작합니다.');
                
                // 1단계: 최소 HTML + 인라인 critical CSS만 로드
                document.body.style.visibility = 'hidden';
                window.progressiveLoadingStage2 = false;
                window.progressiveLoadingStage3 = false;
                
                // 2단계: 1초 후 주요 콘텐츠 렌더링
                setTimeout(() => {
                  console.log('Phase 4 - Stage 2: 주요 콘텐츠 렌더링');
                  window.progressiveLoadingStage2 = true;
                  document.body.style.visibility = 'visible';
                }, 1000);
                
                // 3단계: 2초 후 나머지 리소스 로드
                setTimeout(() => {
                  console.log('Phase 4 - Stage 3: 나머지 리소스 로드');
                  window.progressiveLoadingStage3 = true;
                  
                  // 무거운 리소스 로딩 트리거
                  if (typeof window.triggerHeavyResourceLoading === 'function') {
                    window.triggerHeavyResourceLoading();
                  }
                }, 2000);
              }
              
              // Phase 5: 에러 추적 시스템 비활성화 (프로덕션 환경)
              console.log('Phase 5: 에러 추적 시스템이 비활성화되었습니다.');
              
              // 에러 추적 시스템 비활성화 - 콘솔 로그만 유지
              if (window.location.hostname === 'localhost') {
                // 개발 환경에서만 기본 에러 로깅
                window.onerror = (msg, source, lineno, colno, error) => {
                  console.error('JavaScript 오류 감지:', { msg, source, lineno, colno, error });
                };
                
                window.addEventListener('unhandledrejection', (event) => {
                  console.error('Unhandled Promise Rejection:', event.reason);
                });
              } else {
                // 프로덕션 환경에서는 에러 추적 완전 비활성화
                window.onerror = null;
                window.removeEventListener('unhandledrejection', () => {});
              }
              
              // 디버그 정보 표시 함수 (개발 환경에서만)
              if (window.location.hostname === 'localhost') {
                window.showDebugInfo = () => {
                  const debugInfo = {
                    userAgent: navigator.userAgent,
                    isNotionMobile: window.isNotionMobile,
                    progressiveStage2: window.progressiveLoadingStage2,
                    progressiveStage3: window.progressiveLoadingStage3,
                    iframeBridge: window.iframeBridge ? window.iframeBridge.isActive : false,
                    isInIframe: window.parent !== window,
                    documentReadyState: document.readyState,
                    bodyChildren: document.body.children.length,
                    timestamp: new Date().toISOString()
                  };
                  
                  console.log('디버그 정보:', debugInfo);
                };
                
                console.log('개발 환경: 디버그 모드가 활성화되었습니다. window.showDebugInfo()로 디버그 정보를 확인할 수 있습니다.');
              }
              
              console.log('모든 Phase 초기화가 완료되었습니다.');
            })();
          `
        }} />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} ${pressStart2P.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}