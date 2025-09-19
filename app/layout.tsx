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
              
              // Phase 5: 에러 추적 및 디버깅 시스템
              console.log('Phase 5: 에러 추적 및 디버깅 시스템을 초기화합니다.');
              
              // 에러 추적 시스템
              window.onerror = (msg, source, lineno, colno, error) => {
                console.error('JavaScript 오류 감지:', { msg, source, lineno, colno, error });
                
                // 디버그 정보 표시
                const debugDiv = document.createElement('div');
                debugDiv.id = 'debug-error-display';
                debugDiv.style.cssText = 'position:fixed;bottom:0;left:0;background:rgba(255,0,0,0.9);color:white;padding:8px 12px;z-index:99999;font-size:12px;font-family:monospace;border-radius:0 8px 0 0;max-width:300px;word-wrap:break-word;box-shadow:0 -2px 10px rgba(0,0,0,0.3);';
                debugDiv.innerHTML = '<div style="font-weight:bold;margin-bottom:4px;">🚨 오류 발생</div><div>Message: ' + (msg || 'Unknown') + '</div><div>Line: ' + (lineno || 'Unknown') + '</div><div style="font-size:10px;margin-top:4px;opacity:0.8;">노션 모바일 디버그 모드</div>';
                
                // 기존 디버그 디스플레이 제거
                const existingDebug = document.getElementById('debug-error-display');
                if (existingDebug) {
                  existingDebug.remove();
                }
                
                document.body.appendChild(debugDiv);
                
                // 10초 후 자동 제거
                setTimeout(() => {
                  if (debugDiv.parentNode) {
                    debugDiv.remove();
                  }
                }, 10000);
                
                // 에러 정보를 부모 프레임에 전송 (iframe 환경에서)
                if (window.parent !== window) {
                  window.parent.postMessage({
                    type: 'error',
                    error: {
                      message: msg,
                      source: source,
                      line: lineno,
                      column: colno,
                      stack: error ? error.stack : null
                    },
                    source: 'profile-widget',
                    timestamp: Date.now()
                  }, '*');
                }
              };
              
              // Promise rejection 추적
              window.addEventListener('unhandledrejection', (event) => {
                console.error('Unhandled Promise Rejection:', event.reason);
                
                const debugDiv = document.createElement('div');
                debugDiv.id = 'debug-promise-error';
                debugDiv.style.cssText = 'position:fixed;bottom:0;right:0;background:rgba(255,165,0,0.9);color:white;padding:8px 12px;z-index:99999;font-size:12px;font-family:monospace;border-radius:8px 0 0 0;max-width:300px;word-wrap:break-word;box-shadow:0 -2px 10px rgba(0,0,0,0.3);';
                debugDiv.innerHTML = '<div style="font-weight:bold;margin-bottom:4px;">⚠️ Promise 오류</div><div>' + (event.reason ? event.reason.toString().substring(0, 100) : 'Unknown') + '</div><div style="font-size:10px;margin-top:4px;opacity:0.8;">노션 모바일 디버그 모드</div>';
                
                const existingDebug = document.getElementById('debug-promise-error');
                if (existingDebug) {
                  existingDebug.remove();
                }
                
                document.body.appendChild(debugDiv);
                
                setTimeout(() => {
                  if (debugDiv.parentNode) {
                    debugDiv.remove();
                  }
                }, 8000);
              });
              
              // 디버그 정보 표시 함수
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
                
                const debugDiv = document.createElement('div');
                debugDiv.id = 'debug-info-display';
                debugDiv.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.95);color:white;padding:20px;z-index:99999;font-size:11px;font-family:monospace;border-radius:8px;max-width:400px;max-height:300px;overflow-y:auto;box-shadow:0 4px 20px rgba(0,0,0,0.5);';
                
                let debugHtml = '<div style="font-weight:bold;margin-bottom:10px;color:#00ff00;">🔍 디버그 정보</div>';
                for (const [key, value] of Object.entries(debugInfo)) {
                  debugHtml += '<div style="margin:2px 0;"><span style="color:#00bfff;">' + key + ':</span> ' + JSON.stringify(value) + '</div>';
                }
                debugHtml += '<div style="margin-top:10px;text-align:center;"><button onclick="document.getElementById(\'debug-info-display\').remove()" style="background:#333;color:white;border:none;padding:5px 10px;border-radius:4px;cursor:pointer;">닫기</button></div>';
                
                debugDiv.innerHTML = debugHtml;
                
                const existingDebug = document.getElementById('debug-info-display');
                if (existingDebug) {
                  existingDebug.remove();
                }
                
                document.body.appendChild(debugDiv);
              };
              
              // 디버그 모드 활성화 (개발 환경에서만)
              if (window.location.hostname === 'localhost' || window.location.hostname.includes('vercel.app')) {
                console.log('디버그 모드가 활성화되었습니다. window.showDebugInfo()로 디버그 정보를 확인할 수 있습니다.');
                
                // 3초 후 자동으로 디버그 정보 표시
                setTimeout(() => {
                  if (window.isNotionMobile && !window.progressiveLoadingStage3) {
                    window.showDebugInfo();
                  }
                }, 3000);
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