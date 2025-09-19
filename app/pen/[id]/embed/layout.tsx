import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const codepenId = params.id;
  
  return {
    title: `CodePen - Profile Widget ${codepenId}`,
    description: "Interactive profile widget created on CodePen",
    robots: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
    },
    other: {
      'codepen:embed': 'true',
      'codepen:pen-id': codepenId,
      'codepen:user': 'anonymous',
      'codepen:title': 'Profile Widget',
    },
    // CodePen 스타일의 메타데이터
    openGraph: {
      title: `Profile Widget - CodePen`,
      description: "Interactive profile widget",
      type: 'website',
      url: `https://codepen.io/embed/${codepenId}`,
      siteName: 'CodePen',
    },
    twitter: {
      card: 'summary',
      title: `Profile Widget - CodePen`,
      description: "Interactive profile widget",
    },
  };
}

export default function CodePenEmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* CodePen 임베드 전용 스크립트 */}
        <script dangerouslySetInnerHTML={{
          __html: `
            // CodePen 임베드 환경 감지
            (function() {
              console.log('CodePen 임베드 환경이 감지되었습니다.');
              
              // CodePen 환경 플래그 설정
              window.isCodePenEmbed = true;
              window.isNotionMobile = true; // 호환성을 위해
              
              // iframe 통신 설정
              if (window.parent !== window) {
                window.iframeBridge = {
                  isActive: true,
                  parentOrigin: '*',
                  messageQueue: []
                };
                
                // CodePen 스타일의 높이 조정
                const sendHeightUpdate = () => {
                  const height = Math.max(
                    document.body.scrollHeight,
                    document.documentElement.scrollHeight
                  );
                  
                  window.parent.postMessage({
                    type: 'resize',
                    height: height,
                    source: 'codepen-embed',
                    timestamp: Date.now()
                  }, '*');
                };
                
                // 초기 높이 전송
                setTimeout(sendHeightUpdate, 100);
                
                // ResizeObserver 설정
                if (typeof ResizeObserver !== 'undefined') {
                  const resizeObserver = new ResizeObserver(sendHeightUpdate);
                  resizeObserver.observe(document.body);
                  resizeObserver.observe(document.documentElement);
                }
              }
            })();
          `
        }} />
        
        {/* CodePen 스타일의 메타 태그 */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#1e1f26" />
        <meta name="codepen-embed" content="true" />
        
        {/* CodePen 스타일의 기본 CSS */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* CodePen 임베드 기본 스타일 */
            html, body {
              margin: 0;
              padding: 0;
              background: #1e1f26;
              color: #ffffff;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
            }
            
            .codepen-embed {
              background: #1e1f26 !important;
            }
            
            .codepen-embed .profile-card {
              background: #2d2d30;
              border: 1px solid #3d3d40;
              border-radius: 8px;
              box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            }
            
            .codepen-embed .clickable-name,
            .codepen-embed .clickable-text {
              color: #ffffff;
            }
            
            .codepen-embed button {
              background: #007acc;
              color: #ffffff;
              border: none;
              border-radius: 4px;
              padding: 8px 16px;
              cursor: pointer;
              transition: background 0.2s ease;
            }
            
            .codepen-embed button:hover {
              background: #005a9e;
            }
          `
        }} />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
