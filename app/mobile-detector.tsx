'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MobileDetector({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  
  useEffect(() => {
    // Detect if running in mobile Notion
    const isMobileNotion = () => {
      const ua = navigator.userAgent.toLowerCase();
      const isNotion = ua.includes('notion') || window.location.href.includes('notion.site');
      const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
      
      // Check for iframe context
      const isInIframe = window !== window.parent;
      
      // Check viewport size
      const isSmallViewport = window.innerWidth < 768;
      
      return (isNotion && isMobile) || (isInIframe && isSmallViewport);
    };
    
    // Redirect to mobile version if detected
    if (isMobileNotion()) {
      console.log('Mobile Notion detected, redirecting to optimized version');
      router.replace('/mobile');
    }
  }, [router]);
  
  return <>{children}</>;
}
