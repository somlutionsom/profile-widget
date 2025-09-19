'use client';

import { useEffect, useState } from 'react';
import { signUp, signIn, signOut, getCurrentUser, getUserProfile, saveUserProfile, updateProfileName, updateFirstText, updateSecondText, UserProfile, supabase } from '../lib/supabase';

export default function Home() {
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
  const [isLogin, setIsLogin] = useState(true); // true: 로그인, false: 회원가입
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

  // Phase 3: iframe 통신 함수들
  const sendHeightUpdate = () => {
    if (isInIframe && (window as any).iframeBridge?.isActive) {
      const height = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight
      );
      
      const message = {
        type: 'resize',
        height: height,
        source: 'profile-widget',
        timestamp: Date.now(),
        trigger: 'user-interaction'
      };
      
      window.parent.postMessage(message, '*');
      setIframeHeight(height);
      console.log('사용자 인터랙션으로 인한 높이 업데이트:', message);
    }
  };

  // Phase 2: 사용자 인터랙션 감지 및 무거운 리소스 로딩
  const handleUserInteraction = () => {
    if (!userInteracted) {
      setUserInteracted(true);
      console.log('사용자 인터랙션 감지됨.');
      
      // 즉시 무거운 리소스 로딩 완료로 설정 (성능 향상)
      setHeavyResourcesLoaded(true);
    }
    
    // Phase 4: 점진적 로딩 중이면 3단계로 강제 진행
    if (isProgressiveLoading && progressiveStage < 3) {
      console.log('사용자 인터랙션으로 인해 점진적 로딩을 가속화합니다.');
      setProgressiveStage(3);
      setIsProgressiveLoading(false);
      
      // 강제로 완료 이벤트 발생
      window.dispatchEvent(new CustomEvent('progressive-loading-complete'));
    }
    
    // Phase 3: 사용자 인터랙션 후 높이 업데이트 (즉시 실행)
    sendHeightUpdate();
  };

  const handleEdit = (key: 'first' | 'second') => {
    handleUserInteraction(); // 사용자 인터랙션 감지
    setEditing(prev => ({ ...prev, [key]: true }));
    setEditValues(prev => ({ ...prev, [key]: texts[key] }));
  };

  const handleSave = async (key: 'first' | 'second') => {
    console.log(`${key} 텍스트 저장 시작:`, editValues[key]);
    setTexts(prev => ({ ...prev, [key]: editValues[key] }));
    setEditing(prev => ({ ...prev, [key]: false }));
    
    // 텍스트 저장
    try {
      if (key === 'first') {
        console.log('saveFirstText 호출 중...');
        await saveFirstText();
        console.log('첫번째 텍스트 저장 성공!');
      } else {
        console.log('saveSecondText 호출 중...');
        await saveSecondText();
        console.log('두번째 텍스트 저장 성공!');
      }
    } catch (error) {
      console.error(`${key} 텍스트 저장 실패:`, error);
    }
  };

  const handleCancel = (key: 'first' | 'second') => {
    setEditing(prev => ({ ...prev, [key]: false }));
    setEditValues(prev => ({ ...prev, [key]: texts[key] }));
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
    handleUserInteraction(); // 사용자 인터랙션 감지
    document.getElementById('avatar-input')?.click();
  };

  const handleBannerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBannerImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerClick = () => {
    handleUserInteraction(); // 사용자 인터랙션 감지
    document.getElementById('banner-input')?.click();
  };

  const handleNameEdit = () => {
    handleUserInteraction(); // 사용자 인터랙션 감지
    setEditingName(true);
    setEditNameValue(profileName);
  };

  const handleNameSave = async () => {
    console.log('닉네임 저장 시작:', editNameValue);
    setProfileName(editNameValue);
    setEditingName(false);
    
    // 닉네임 저장
    try {
      console.log('saveProfileName 호출 중...');
      await saveProfileName();
      console.log('닉네임 저장 성공!');
    } catch (error) {
      console.error('닉네임 저장 실패:', error);
    }
  };

  const handleNameCancel = () => {
    setEditingName(false);
    setEditNameValue(profileName);
  };

  const handleButtonClick = () => {
    handleUserInteraction(); // 사용자 인터랙션 감지
    setShowColorPalette(!showColorPalette);
  };

  const handleColorSelect = (color: string) => {
    setButtonColor(color);
    setShowColorPalette(false);
  };

  const handleUrlEdit = () => {
    setEditingUrl(true);
    setEditUrlValue(savedUrl);
  };

  const handleUrlSave = () => {
    setSavedUrl(editUrlValue);
    setEditingUrl(false);
  };

  const handleUrlCancel = () => {
    setEditingUrl(false);
    setEditUrlValue(savedUrl);
  };

  const handleUrlClick = () => {
    if (savedUrl) {
      // URL이 http:// 또는 https://로 시작하지 않으면 https:// 추가
      const url = savedUrl.startsWith('http://') || savedUrl.startsWith('https://') 
        ? savedUrl 
        : `https://${savedUrl}`;
      window.open(url, '_blank');
    } else {
      handleUrlEdit();
    }
  };

  // 하이퍼링크 버튼 길게 누르기 시작
  const handleUrlMouseDown = () => {
    if (savedUrl) {
      setIsLongPressing(true);
      const timer = setTimeout(() => {
        handleUrlEdit();
        setIsLongPressing(false);
      }, 800); // 0.8초 후 편집 모드로 전환
      setLongPressTimer(timer);
    }
  };

  // 하이퍼링크 버튼 길게 누르기 종료
  const handleUrlMouseUp = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    setIsLongPressing(false);
  };

  // 하이퍼링크 버튼 마우스가 버튼을 벗어날 때
  const handleUrlMouseLeave = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    setIsLongPressing(false);
  };

  const colorPalette = [
    '#FFE3ED', // (1,1) - 요청 색상
    '#FFC1DA', // (1,2) - 요청 색상
    '#DC143C', // (1,3) - 요청 색상
    '#D0E7FF', // 연한 파랑
    '#9FB3DF', // (1,5) - 요청 색상
    '#9EC6F3', // (2,1) - 요청 색상
    '#2C2C2E', // 검은색
    '#8E8E93', // 중간 회색
    '#C7C7CC', // 옅은 회색
    '#FFF2E0', // (2,5) - 요청 색상
    '#E4EFE7', // (3,1) - 요청 색상
    '#064420', // (3,2) - 요청 색상
    '#EBD6FB', // (3,4) - 요청 색상
    '#D0B4FF', // 보라
    '#090040', // (3,5) - 요청 색상
  ];

  // 로그인 관련 함수들
  const handleLoginPopupOpen = () => {
    setShowLoginPopup(true);
    setLoginError('');
  };

  const handleLoginPopupClose = () => {
    setShowLoginPopup(false);
    setLoginEmail('');
    setLoginPassword('');
    setLoginError('');
    setIsLogin(true);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setLoginError('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setLoginError('');

    try {
      const result = isLogin 
        ? await signIn(loginEmail, loginPassword)
        : await signUp(loginEmail, loginPassword);

      if (result.success) {
        // 로그인/회원가입 성공
        const userResult = await getCurrentUser();
        if (userResult.success && userResult.user) {
          setCurrentUser(userResult.user);
          // 사용자 데이터 불러오기
          await loadProfileData(userResult.user.id);
        }
        handleLoginPopupClose();
      } else {
        setLoginError(result.error || '오류가 발생했습니다.');
      }
    } catch (error) {
      setLoginError('네트워크 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    console.log('로그아웃 시작');
    try {
      // 먼저 로컬 상태 초기화
      setTexts({
        first: '문구를 입력해 주세요 ♡',
        second: '문구를 입력해 주세요 ♡'
      });
      setProfileName('♡⸝⸝');
      setButtonColor('#FFD0D8');
      setSavedUrl('');
      setAvatarImage(null);
      setBannerImage(null);
      setText('');
      setHyperlink('');
      setCurrentUser(null);
      
      // Supabase 로그아웃
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase 로그아웃 오류:', error);
      }
      
      console.log('로그아웃 완료');
    } catch (error) {
      console.error('로그아웃 중 오류:', error);
    }
  };

  // 닉네임만 저장하는 함수
  const saveProfileName = async () => {
    console.log('saveProfileName 함수 시작, currentUser:', currentUser);
    if (!currentUser) {
      console.log('사용자가 로그인되지 않음, 저장 건너뜀');
      return;
    }
    
    console.log('닉네임 저장할 데이터:', profileName);
    
    try {
      const result = await updateProfileName(profileName);
      console.log('updateProfileName 결과:', result);
      if (!result.success) {
        throw new Error(result.error);
      }
      console.log('닉네임 저장 완료!');
    } catch (error) {
      console.error('닉네임 저장 실패:', error);
      throw error;
    }
  };

  // 첫번째 문구만 저장하는 함수
  const saveFirstText = async () => {
    if (!currentUser) {
      console.log('사용자가 로그인되지 않음, 저장 건너뜀');
      return;
    }
    
    console.log('첫번째 텍스트 저장할 데이터:', texts.first);
    
    try {
      const result = await updateFirstText(texts.first);
      console.log('updateFirstText 결과:', result);
      if (!result.success) {
        throw new Error(result.error);
      }
      console.log('첫번째 텍스트 저장 완료!');
    } catch (error) {
      console.error('첫번째 문구 저장 실패:', error);
      throw error;
    }
  };

  // 두번째 문구만 저장하는 함수
  const saveSecondText = async () => {
    if (!currentUser) {
      console.log('사용자가 로그인되지 않음, 저장 건너뜀');
      return;
    }
    
    console.log('두번째 텍스트 저장할 데이터:', texts.second);
    
    try {
      const result = await updateSecondText(texts.second);
      console.log('updateSecondText 결과:', result);
      if (!result.success) {
        throw new Error(result.error);
      }
      console.log('두번째 텍스트 저장 완료!');
    } catch (error) {
      console.error('두번째 문구 저장 실패:', error);
      throw error;
    }
  };

  // 사용자 프로필 데이터 저장 함수 (재시도 로직 포함 - 요일 버튼용)
  const saveProfileData = async (retryCount = 0) => {
    if (!currentUser) {
      console.log('사용자가 로그인되지 않음, 저장 건너뜀');
      return;
    }
    
    const profileData = {
      profile_name: profileName,
      button_color: buttonColor,
      avatar_image: avatarImage || undefined,
      banner_image: bannerImage || undefined,
      saved_url: savedUrl || undefined,
      first_text: texts.first,
      second_text: texts.second,
      text: text,
      hyperlink: hyperlink
    };
    
    try {
      console.log('프로필 저장 시작...', profileData);
      
      // 타임아웃을 10초로 늘림
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('저장 시간 초과')), 10000);
      });
      
      const savePromise = saveUserProfile(profileData);
      const result = await Promise.race([savePromise, timeoutPromise]) as any;
      
      if (!result.success) {
        throw new Error(result.error || '저장 실패');
      }
      
      console.log('프로필 저장 성공:', result);
    } catch (error) {
      console.error(`프로필 저장 실패 (시도 ${retryCount + 1}):`, error);
      
      // 재시도 로직 개선 (최대 2회)
      if (retryCount < 2) {
        console.log('재시도 중...');
        await new Promise(resolve => setTimeout(resolve, 1000)); // 재시도 간격 1초
        return saveProfileData(retryCount + 1);
      }
      
      throw error; // 오류를 상위로 전파하여 UI에서 처리
    }
  };

  // 사용자 프로필 데이터 불러오기 함수 (최적화됨)
  const loadProfileData = async (userId: string) => {
    try {
      const result = await getUserProfile(userId);
      if (result.success && result.data) {
        const profile = result.data;
        
        // 배치로 상태 업데이트 (리렌더링 최소화)
        setProfileName(profile.profile_name || '♡⸝⸝');
        setButtonColor(profile.button_color || '#FFD0D8');
        setAvatarImage(profile.avatar_image || null);
        setBannerImage(profile.banner_image || null);
        setSavedUrl(profile.saved_url || '');
        setTexts({
          first: profile.first_text || '문구를 입력해 주세요 ♡',
          second: profile.second_text || '문구를 입력해 주세요 ♡'
        });
        setText(profile.text || '');
        setHyperlink(profile.hyperlink || '');
      }
    } catch (error) {
      console.error('프로필 데이터 불러오기 중 예외 발생:', error);
    } finally {
      setIsProfileLoading(false);
    }
  };

  useEffect(() => {
    // Phase 2: 노션 모바일 환경 감지
    const checkNotionMobile = () => {
      const isNotionMobileEnv = (window as any).isNotionMobile || 
                               (/Notion|Mobile/i.test(navigator.userAgent) && window.innerWidth < 768);
      
      setIsNotionMobile(isNotionMobileEnv);
      
      if (isNotionMobileEnv) {
        console.log('노션 모바일 환경이 감지되었습니다. 최적화 모드를 적용합니다.');
        
        // 노션 모바일 환경에서는 즉시 무거운 리소스 로딩 (iframe 환경에서는 사용자 인터랙션을 기다리지 않음)
        setHeavyResourcesLoaded(true);
      }
    };

    // Phase 3: iframe 환경 감지 및 통신 설정
    const checkIframeEnvironment = () => {
      const inIframe = window.parent !== window || 
                      document.referrer.includes('notion') ||
                      window.location !== window.parent.location ||
                      window.frameElement !== null;
      
      setIsInIframe(inIframe);
      
      if (inIframe) {
        console.log('iframe 환경이 감지되었습니다. iframe 통신을 활성화합니다.');
        
        // iframe 환경에서는 초기 높이 측정 및 전송
        setTimeout(() => {
          sendHeightUpdate();
        }, 500);
      }
    };

    // 오늘 날짜를 가져와서 버튼에 표시
    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear().toString().slice(-2);
    
    const newDateString = `♥ ${year}. ${month}. ${day} ♥`;
    setDateString(newDateString);

    // 요일을 영어 3글자로 표시
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const dayOfWeek = dayNames[today.getDay()];
    setDayString(dayOfWeek);

    // 위젯 환경 감지 및 최적화
    const isWidget = window.parent !== window || 
                    document.referrer.includes('notion') ||
                    window.location !== window.parent.location ||
                    window.frameElement !== null;
    
    if (isWidget) {
      console.log('위젯 환경이 감지되었습니다. 모바일 최적화를 적용합니다.');
      // 위젯 환경에서 추가 최적화
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    }

    // 노션 모바일 환경 체크
    checkNotionMobile();

    // Phase 3: iframe 환경 체크
    checkIframeEnvironment();

    // Phase 4: 점진적 로딩 비활성화 (성능 향상)
    const setupProgressiveLoading = () => {
      // 모든 환경에서 즉시 완료로 설정
      setProgressiveStage(3);
      setIsProgressiveLoading(false);
      console.log('점진적 로딩 비활성화 - 즉시 완료');
    };

    setupProgressiveLoading();

    // Phase 5: 로딩 오버레이 및 디버깅 설정 (완전 비활성화)
    const setupDebuggingAndOverlay = () => {
      // 로딩 오버레이 비활성화
      setShowLoadingOverlay(false);
      
      // 디버그 정보 수집 완전 비활성화
      setDebugInfo(null);
      console.log('디버그 시스템 완전 비활성화');
    };

    setupDebuggingAndOverlay();

    // 사용자 로그인 상태 확인 및 데이터 불러오기 (최적화됨)
    const checkUserAndLoadData = async () => {
      try {
        const userResult = await getCurrentUser();
        if (userResult.success && userResult.user) {
          setCurrentUser(userResult.user);
          // 프로필 데이터 로딩을 병렬로 처리하지 않고 바로 시작
          loadProfileData(userResult.user.id);
        } else {
          setIsProfileLoading(false);
        }
      } catch (error) {
        console.error('사용자 확인 중 오류:', error);
        setIsProfileLoading(false);
      }
    };

    checkUserAndLoadData();

    // Supabase 세션 변경 감지 (로그인 상태 유지)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session?.user) {
        setCurrentUser(session.user);
        await loadProfileData(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        // 로그아웃 시에는 setCurrentUser만 호출 (상태 초기화는 handleLogout에서 처리)
        setCurrentUser(null);
        setIsProfileLoading(false);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        setCurrentUser(session.user);
        // 토큰 갱신 시에도 사용자 데이터 유지
      }
    });

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
    };
  }, [longPressTimer]);

  // Phase 3: 상태 변경 시 iframe 높이 업데이트
  useEffect(() => {
    if (isInIframe) {
      // 텍스트 변경, 이미지 변경, 팝업 상태 변경 등으로 인한 높이 변화 감지
      const timeoutId = setTimeout(() => {
        sendHeightUpdate();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [
    texts, profileName, buttonColor, savedUrl, 
    showColorPalette, editingName, editingUrl, 
    showLoginPopup, avatarImage, bannerImage,
    editing, editValues, isInIframe
  ]);

  // 수동 저장 함수 (최적화됨 - 빠른 저장)
  const handleManualSave = async () => {
    if (!currentUser) {
      handleLoginPopupOpen();
      return;
    }
    
    if (isSaving) return; // 중복 저장 방지
    
    setIsSaving(true);
    const button = document.querySelector('.secondary-button') as HTMLElement;
    const originalText = button?.textContent || '';
    
    try {
      if (button) {
        button.textContent = '저장중';
        button.style.backgroundColor = '#ffa726';
      }
      
      // 저장 실행 (타임아웃 10초로 늘림)
      await saveProfileData();
      
      if (button) {
        button.textContent = '✓';
        button.style.backgroundColor = '#4CAF50';
      }
    } catch (error) {
      console.error('저장 중 오류:', error);
      if (button) {
        button.textContent = '✗';
        button.style.backgroundColor = '#f44336';
      }
    } finally {
      setIsSaving(false);
      setTimeout(() => {
        if (button) {
          button.textContent = originalText;
          button.style.backgroundColor = '';
        }
      }, 800); // 피드백 시간 늘림
    }
  };

  return (
    <div 
      className={`main-container ${isNotionMobile ? 'notion-mobile-optimized' : ''} ${isInIframe ? 'iframe-embedded' : ''} ${isProgressiveLoading ? 'progressive-loading' : ''}`}
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
        // 노션 모바일 환경에서 추가 최적화
        ...(isNotionMobile && {
          transform: 'translateZ(0)', // GPU 가속 활성화
          backfaceVisibility: 'hidden', // 렌더링 최적화
          perspective: '1000px' // 3D 컨텍스트 생성
        }),
        // Phase 3: iframe 환경에서 추가 최적화
        ...(isInIframe && {
          overflow: 'visible', // iframe에서 콘텐츠가 잘리지 않도록
          position: 'static', // iframe 내에서 정적 위치
          transform: 'translateZ(0)', // GPU 가속
          willChange: 'transform' // 성능 최적화
        }),
        // Phase 4: 점진적 로딩 중일 때 추가 스타일
        ...(isProgressiveLoading && {
          opacity: progressiveStage >= 2 ? 1 : 0.3,
          transition: 'opacity 0.5s ease-in-out'
        })
      }}
    >
      {/* Outer Container */}
      <div className="outer-container">
        {/* Profile Card Container */}
        <div className="profile-card">
        
        {/* Header Banner */}
        <div 
          className="header-banner" 
          onClick={handleBannerClick}
          style={{ backgroundColor: buttonColor }}
        >
          {bannerImage ? (
            <img 
              src={bannerImage} 
              alt="Banner" 
              className="banner-image"
            />
          ) : (
            <div className="banner-placeholder" style={{ backgroundColor: buttonColor }}>
            </div>
          )}
        </div>
        <input
          id="banner-input"
          type="file"
          accept="image/*"
          onChange={handleBannerChange}
          style={{ display: 'none' }}
        />
        
        {/* Profile Avatar - Overlapping */}
        <div className="avatar-container">
          <div className="profile-avatar" onClick={handleAvatarClick}>
            {avatarImage ? (
              <img 
                src={avatarImage} 
                alt="Profile" 
                className="avatar-image"
              />
            ) : (
              <div className="avatar-placeholder">
              </div>
            )}
          </div>
          <input
            id="avatar-input"
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            style={{ display: 'none' }}
          />
        </div>
        
        {/* Profile Content */}
        <div className="profile-content">
          
          {/* Name/Handle */}
          <div className="profile-name">
            {editingName ? (
              <div className="name-edit-container">
                <input
                  type="text"
                  value={editNameValue}
                  onChange={(e) => setEditNameValue(e.target.value)}
                  className="name-edit-input"
                  style={{ borderColor: buttonColor }}
                  autoFocus
                />
                <button 
                  onClick={handleNameSave}
                  className="name-save-button"
                  style={{ backgroundColor: buttonColor }}
                >
                  ✓
                </button>
                <button 
                  onClick={handleNameCancel}
                  className="name-cancel-button"
                >
                  ✕
                </button>
              </div>
            ) : (
              <h1 
                className="clickable-name"
                onClick={handleNameEdit}
              >
                {profileName}
              </h1>
            )}
          </div>
          
          {/* Action Buttons Row */}
          <div className="action-buttons">
            <div className="button-with-palette">
              <button 
                className="primary-button" 
                onClick={handleButtonClick}
                style={{ backgroundColor: buttonColor }}
              >
                {dateString}
              </button>
              {showColorPalette && (
                <div 
                  className="color-palette"
                  style={{
                    // 노션 모바일 환경에서 애니메이션 최적화
                    transition: isNotionMobile ? 'none' : 'all 0.3s ease',
                    animation: isNotionMobile ? 'none' : undefined
                  }}
                >
                  {colorPalette.map((color, index) => (
                    <button
                      key={index}
                      className="color-option"
                      style={{ 
                        backgroundColor: color,
                        // 노션 모바일 환경에서 애니메이션 최적화
                        transition: isNotionMobile ? 'none' : 'all 0.2s ease',
                        transform: isNotionMobile ? 'none' : undefined
                      }}
                      onClick={() => handleColorSelect(color)}
                    />
                  ))}
                </div>
              )}
            </div>
            <button 
              className="secondary-button" 
              onClick={handleManualSave}
              title="저장하기"
              disabled={isSaving}
              style={{ 
                opacity: isSaving ? 0.7 : 1,
                cursor: isSaving ? 'not-allowed' : 'pointer'
              }}
            >
              {isSaving ? '저장중...' : dayString}
            </button>
            <button 
              className="icon-button"
              style={{ 
                backgroundColor: isLongPressing ? '#FF9FA8' : buttonColor,
                transform: isLongPressing && !isNotionMobile ? 'scale(0.95)' : 'scale(1)',
                transition: isNotionMobile ? 'none' : 'all 0.1s ease'
              }}
              onClick={handleUrlClick}
              onMouseDown={handleUrlMouseDown}
              onMouseUp={handleUrlMouseUp}
              onMouseLeave={handleUrlMouseLeave}
              title={savedUrl ? `링크: ${savedUrl} (길게 누르면 수정)` : 'URL 설정'}
            >
              🔗
            </button>
          </div>
          
          
          {/* Interaction Icons */}
          <div className="interaction-icons">
            <div className="icon-item">
              <span className="icon">♡⸝⸝</span>
              {editing.first ? (
                <div className="edit-container">
                <input
                  type="text"
                  value={editValues.first}
                  onChange={(e) => setEditValues(prev => ({ ...prev, first: e.target.value }))}
                  className="edit-input"
                  style={{ borderColor: buttonColor }}
                  autoFocus
                />
                  <button 
                    onClick={() => handleSave('first')}
                    className="save-button"
                    style={{ backgroundColor: buttonColor }}
                  >
                    ✓
                  </button>
                  <button 
                    onClick={() => handleCancel('first')}
                    className="cancel-button"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <span 
                  className="text clickable-text"
                  onClick={() => handleEdit('first')}
                >
                  {texts.first}
                </span>
              )}
            </div>
            <div className="icon-item">
              <span className="icon">˚୨୧*˚</span>
              {editing.second ? (
                <div className="edit-container">
                  <input
                    type="text"
                    value={editValues.second}
                    onChange={(e) => setEditValues(prev => ({ ...prev, second: e.target.value }))}
                    className="edit-input"
                    style={{ borderColor: buttonColor }}
                    autoFocus
                  />
                  <button 
                    onClick={() => handleSave('second')}
                    className="save-button"
                    style={{ backgroundColor: buttonColor }}
                  >
                    ✓
                  </button>
                  <button 
                    onClick={() => handleCancel('second')}
                    className="cancel-button"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <span 
                  className="text clickable-text"
                  onClick={() => handleEdit('second')}
                >
                  {texts.second}
                </span>
              )}
            </div>
          </div>
          
          {/* Login/Logout Text */}
          <div style={{
            marginTop: '20px', 
            paddingBottom: '20px', 
            display: 'flex', 
            justifyContent: 'center', 
            position: 'relative', 
            zIndex: 1000
          }}>
            <span 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('로그아웃 버튼 클릭됨, currentUser:', currentUser);
                if (currentUser) {
                  handleLogout();
                } else {
                  handleLoginPopupOpen();
                }
              }}
              title={currentUser ? "로그아웃" : "로그인"}
              style={{
                fontSize: '12px', 
                color: '#666', 
                cursor: 'pointer', 
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
                fontWeight: '300',
                transition: 'color 0.2s ease'
              }}
            >
              {currentUser ? "logout" : "login"}
            </span>
          </div>
          
        </div>
        
        </div>
      </div>
      
      {/* URL Edit Popup */}
      {editingUrl && (
        <div className="url-popup-overlay" onClick={handleUrlCancel}>
          <div className="url-popup" onClick={(e) => e.stopPropagation()}>
            <div className="url-popup-header">
              <span className="url-popup-title">URL 입력</span>
              <button 
                className="url-popup-close"
                onClick={handleUrlCancel}
              >
                ✕
              </button>
            </div>
            <div className="url-popup-content">
              <input
                type="url"
                value={editUrlValue}
                onChange={(e) => setEditUrlValue(e.target.value)}
                className="url-popup-input"
                style={{
                  borderColor: buttonColor,
                  border: `2px solid ${buttonColor}`
                } as React.CSSProperties}
                placeholder="https://example.com"
                autoFocus
              />
              <div className="url-popup-buttons">
                <button 
                  onClick={handleUrlCancel}
                  className="url-popup-cancel"
                >
                  취소
                </button>
                <button 
                  onClick={handleUrlSave}
                  className="url-popup-save"
                  style={{ backgroundColor: buttonColor }}
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Login Popup */}
      {showLoginPopup && (
        <div className="login-popup-overlay" onClick={handleLoginPopupClose}>
          <div className="login-popup" onClick={(e) => e.stopPropagation()}>
            <div className="login-popup-header">
              <span className="login-popup-title">
                {isLogin ? '로그인' : '회원가입'}
              </span>
              <button 
                className="login-popup-close"
                onClick={handleLoginPopupClose}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleLoginSubmit} className="login-popup-content">
              <div className="login-input-group">
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="login-input"
                  placeholder="이메일"
                  required
                />
              </div>
              <div className="login-input-group">
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="login-input"
                  placeholder="비밀번호"
                  required
                />
              </div>
              {loginError && (
                <div className="login-error">{loginError}</div>
              )}
              <div className="login-buttons">
                <button 
                  type="submit"
                  className="login-submit-button"
                  style={{ backgroundColor: buttonColor }}
                  disabled={isLoading}
                >
                  {isLoading ? '처리중...' : (isLogin ? '로그인' : '회원가입')}
                </button>
              </div>
              <div className="login-switch">
                <span>
                  {isLogin ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}
                </span>
                <button 
                  type="button"
                  className="login-switch-button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setLoginError('');
                  }}
                >
                  {isLogin ? '회원가입' : '로그인'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Phase 5: 로딩 오버레이 */}
      {showLoadingOverlay && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255, 255, 255, 0.95)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
          }}
        >
          <div style={{
            textAlign: 'center',
            padding: '20px',
            borderRadius: '12px',
            background: 'white',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            maxWidth: '300px'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #FFD0D8',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }}></div>
            <div style={{
              fontSize: '16px',
              fontWeight: '500',
              color: '#333',
              marginBottom: '8px'
            }}>프로필 위젯 로딩 중...</div>
            <div style={{
              fontSize: '12px',
              color: '#666',
              marginBottom: '16px'
            }}>노션 모바일 최적화 적용</div>
            <div style={{
              fontSize: '10px',
              color: '#999',
              fontFamily: 'monospace'
            }}>
              Phase 1-4 완료 • iframe 통신 활성화
            </div>
          </div>
        </div>
      )}


    {/* Phase 5: 에러 상태 표시 제거됨 (프로덕션 환경) */}
    </div>
  );
}