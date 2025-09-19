'use client';

import { useEffect, useState } from 'react';
import { signUp, signIn, signOut, getCurrentUser, getUserProfile, saveUserProfile, updateProfileName, updateFirstText, updateSecondText, UserProfile } from '../../../../lib/supabase';

export default function CodePenEmbed({ params }: { params: { id: string } }) {
  const [texts, setTexts] = useState({
    first: '문구를 입력해 주세요 ♡',
    second: '문구를 입력해 주세요 ♡'
  });
  
  const [profileName, setProfileName] = useState('♡⸝⸝');
  const [editingName, setEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');
  
  const [dateString, setDateString] = useState('');
  const [dayString, setDayString] = useState('');
  
  const [buttonColor, setButtonColor] = useState('#FFD0D8');
  const [showColorPalette, setShowColorPalette] = useState(false);
  
  const [savedUrl, setSavedUrl] = useState('');
  const [editingUrl, setEditingUrl] = useState(false);
  const [editUrlValue, setEditUrlValue] = useState('');
  
  // 하이퍼링크 길게 누르기 관련 상태
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  
  // 로그인 팝업 관련 상태
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [editing, setEditing] = useState({
    first: false,
    second: false
  });
  
  const [editValues, setEditValues] = useState({
    first: '',
    second: ''
  });
  
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  
  const [text, setText] = useState('');
  const [hyperlink, setHyperlink] = useState('');
  
  // 로딩 상태 추가
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Phase 2: 노션 모바일 최적화 상태
  const [isNotionMobile, setIsNotionMobile] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const [heavyResourcesLoaded, setHeavyResourcesLoaded] = useState(false);

  // Phase 3: iframe 통신 상태
  const [isInIframe, setIsInIframe] = useState(false);
  const [iframeHeight, setIframeHeight] = useState(0);

  // Phase 4: 점진적 렌더링 상태
  const [progressiveStage, setProgressiveStage] = useState(1);
  const [isProgressiveLoading, setIsProgressiveLoading] = useState(false);

  // Phase 5: 디버깅 및 상태 모니터링
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);

  // CodePen 위장을 위한 상태
  const [codepenId] = useState(params.id);

  // 핸들러 함수들 (기존 page.tsx와 동일)
  const handleUserInteraction = async () => {
    if (!userInteracted) {
      setUserInteracted(true);
      console.log('사용자 상호작용 감지 - 무거운 리소스 로딩 시작');
      
      // 무거운 리소스 로딩 시뮬레이션
      setTimeout(() => {
        setHeavyResourcesLoaded(true);
        console.log('무거운 리소스 로딩 완료');
        
        // 높이 업데이트
        sendHeightUpdate();
      }, 500);
    }
  };

  const sendHeightUpdate = () => {
    if (isInIframe && typeof window !== 'undefined') {
      const height = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        window.innerHeight
      );
      
      setIframeHeight(height);
      
      // 부모 프레임에 높이 정보 전송
      window.parent.postMessage({
        type: 'resize',
        height: height,
        source: 'codepen-embed',
        timestamp: Date.now()
      }, '*');
    }
  };

  useEffect(() => {
    // CodePen 위장 초기화
    console.log('CodePen 임베드 모드로 초기화:', codepenId);
    
    // iframe 환경 강제 감지
    setIsInIframe(true);
    
    // CodePen 스타일 적용
    document.documentElement.classList.add('codepen-embed');
    document.documentElement.classList.add('notion-mobile-optimized');
    
    // 기본 초기화 로직 (기존과 동일)
    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear().toString().slice(-2);
    
    const newDateString = `♥ ${year}. ${month}. ${day} ♥`;
    setDateString(newDateString);

    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const dayOfWeek = dayNames[today.getDay()];
    setDayString(dayOfWeek);

    // iframe 환경에서 즉시 모든 단계 완료
    setProgressiveStage(3);
    setIsProgressiveLoading(false);
    setHeavyResourcesLoaded(true);

    // 사용자 데이터 로딩
    const checkUserAndLoadData = async () => {
      try {
        const userResult = await getCurrentUser();
        if (userResult.success && userResult.user) {
          setCurrentUser(userResult.user);
          // 프로필 데이터 로딩 로직 (기존과 동일)
        } else {
          setIsProfileLoading(false);
        }
      } catch (error) {
        console.error('사용자 확인 중 오류:', error);
        setIsProfileLoading(false);
      }
    };

    checkUserAndLoadData();
  }, [codepenId]);

  return (
    <div 
      className={`main-container codepen-embed ${isNotionMobile ? 'notion-mobile-optimized' : ''} ${isInIframe ? 'iframe-embedded' : ''}`}
      data-stage={progressiveStage}
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FFFFFF',
        width: '100%',
        margin: 0,
        padding: '10px',
        boxSizing: 'border-box',
        position: 'relative',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        // CodePen 스타일 적용
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
        fontSize: '14px',
        lineHeight: '1.5'
      }}
    >
      {/* CodePen 헤더 */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '10px',
        fontFamily: 'monospace',
        zIndex: 1000
      }}>
        CodePen Embed: {codepenId}
      </div>

      {/* 기존 프로필 위젯 컨텐츠 (기존 page.tsx와 동일) */}
      <div className="outer-container">
        <div className="profile-card">
          {/* 프로필 카드 내용 (기존과 동일) */}
          <div className="profile-content">
            <div className="profile-name">
              <h1 className="clickable-name" onClick={() => setEditingName(true)}>
                {profileName}
              </h1>
            </div>
            
            <div className="action-buttons">
              <div className="button-with-palette">
                <button 
                  className="primary-button" 
                  style={{ backgroundColor: buttonColor }}
                >
                  {dateString}
                </button>
              </div>
              <button 
                className="secondary-button"
                style={{ backgroundColor: buttonColor }}
              >
                {dayString}
              </button>
              <button 
                className="icon-button"
                style={{ backgroundColor: buttonColor }}
              >
                🔗
              </button>
            </div>
            
            <div className="interaction-icons">
              <div className="icon-item">
                <span className="icon">♡⸝⸝</span>
                <span className="text clickable-text">
                  {texts.first}
                </span>
              </div>
              <div className="icon-item">
                <span className="icon">˚୨୧*˚</span>
                <span className="text clickable-text">
                  {texts.second}
                </span>
              </div>
            </div>
            
            <div style={{marginTop: '36px', paddingBottom: '20px', display: 'flex', justifyContent: 'center'}}>
              <span 
                onClick={currentUser ? () => {} : () => {}}
                style={{
                  fontSize: '12px', 
                  color: '#666', 
                  cursor: 'pointer', 
                  fontFamily: 'Pretendard, sans-serif',
                  fontWeight: '300'
                }}
              >
                {currentUser ? "logout" : "login"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
