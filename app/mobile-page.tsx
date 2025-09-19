'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase-lite';

// Simplified mobile-optimized component
export default function MobileProfileWidget() {
  // Core state only
  const [profileData, setProfileData] = useState({
    name: '♡⸝⸝',
    color: '#FFD0D8',
    avatarUrl: '',
    bannerUrl: '',
    firstText: '문구를 입력해 주세요 ♡',
    secondText: '문구를 입력해 주세요 ♡',
    savedUrl: '',
    text: '',
    hyperlink: ''
  });
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  // Load user session
  useEffect(() => {
    const loadSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUser(user);
          await loadProfile(user.id);
        }
      } catch (error) {
        console.error('Session error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSession();
  }, []);

  // Simple profile loader
  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profile_widget_user_profiles')
        .select('*')
        .eq('user_id', userId)
        .eq('app_name', 'profile-widget')
        .single();
      
      if (data) {
        setProfileData({
          name: data.profile_name || '♡⸝⸝',
          color: data.button_color || '#FFD0D8',
          avatarUrl: data.avatar_image || '',
          bannerUrl: data.banner_image || '',
          firstText: data.first_text || '문구를 입력해 주세요 ♡',
          secondText: data.second_text || '문구를 입력해 주세요 ♡',
          savedUrl: data.saved_url || '',
          text: data.text || '',
          hyperlink: data.hyperlink || ''
        });
      }
    } catch (error) {
      console.error('Load error:', error);
    }
  };

  // Simple save function
  const saveProfile = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      await supabase
        .from('profile_widget_user_profiles')
        .upsert({
          user_id: currentUser.id,
          app_name: 'profile-widget',
          profile_name: profileData.name,
          button_color: profileData.color,
          avatar_image: profileData.avatarUrl,
          banner_image: profileData.bannerUrl,
          first_text: profileData.firstText,
          second_text: profileData.secondText,
          saved_url: profileData.savedUrl,
          text: profileData.text,
          hyperlink: profileData.hyperlink,
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Save error:', error);
    }
  }, [currentUser, profileData]);

  // Debounced save
  useEffect(() => {
    if (!currentUser) return;
    const timer = setTimeout(saveProfile, 1000);
    return () => clearTimeout(timer);
  }, [profileData, currentUser, saveProfile]);

  // Simple login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password
      });
      
      if (data.user) {
        setCurrentUser(data.user);
        setShowLogin(false);
        await loadProfile(data.user.id);
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setProfileData({
      name: '♡⸝⸝',
      color: '#FFD0D8',
      avatarUrl: '',
      bannerUrl: '',
      firstText: '문구를 입력해 주세요 ♡',
      secondText: '문구를 입력해 주세요 ♡',
      savedUrl: '',
      text: '',
      hyperlink: ''
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div style={{ 
        width: '100%', 
        height: '450px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f5f5f5'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  // Main render
  return (
    <div style={{
      width: '100%',
      maxWidth: '380px',
      margin: '0 auto',
      backgroundColor: '#f5f5f5',
      minHeight: '450px'
    }}>
      <div style={{
        width: '340px',
        height: '450px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '20px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Banner */}
        <div style={{
          height: '160px',
          background: profileData.bannerUrl 
            ? `url(${profileData.bannerUrl}) center/cover`
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          position: 'relative'
        }}/>
        
        {/* Avatar */}
        <div style={{
          width: '110px',
          height: '110px',
          borderRadius: '50%',
          border: '4px solid white',
          position: 'absolute',
          top: '105px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: profileData.avatarUrl
            ? `url(${profileData.avatarUrl}) center/cover`
            : '#e0e0e0'
        }}/>
        
        {/* Profile Name */}
        <div style={{
          marginTop: '60px',
          textAlign: 'center',
          fontSize: '23px',
          fontWeight: 'bold',
          color: '#484747'
        }}>
          {currentUser ? (
            <input
              type="text"
              value={profileData.name}
              onChange={(e) => setProfileData({...profileData, name: e.target.value})}
              style={{
                border: 'none',
                background: 'transparent',
                textAlign: 'center',
                width: '100%',
                outline: 'none'
              }}
            />
          ) : (
            profileData.name
          )}
        </div>
        
        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          marginTop: '20px'
        }}>
          <button style={{
            padding: '8px 20px',
            borderRadius: '20px',
            border: 'none',
            backgroundColor: profileData.color,
            color: 'white',
            fontSize: '14px',
            cursor: 'pointer'
          }}>
            {profileData.savedUrl ? 'Open' : 'Button'}
          </button>
          
          {currentUser && (
            <button 
              onClick={saveProfile}
              style={{
                padding: '8px 20px',
                borderRadius: '20px',
                border: '1px solid #ddd',
                backgroundColor: 'white',
                color: '#666',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Save
            </button>
          )}
        </div>
        
        {/* Text Fields */}
        <div style={{
          padding: '20px',
          textAlign: 'center'
        }}>
          {currentUser ? (
            <>
              <input
                type="text"
                value={profileData.firstText}
                onChange={(e) => setProfileData({...profileData, firstText: e.target.value})}
                style={{
                  width: '100%',
                  border: 'none',
                  borderBottom: '1px solid #eee',
                  padding: '5px',
                  marginBottom: '10px',
                  textAlign: 'center',
                  outline: 'none'
                }}
              />
              <input
                type="text"
                value={profileData.secondText}
                onChange={(e) => setProfileData({...profileData, secondText: e.target.value})}
                style={{
                  width: '100%',
                  border: 'none',
                  borderBottom: '1px solid #eee',
                  padding: '5px',
                  textAlign: 'center',
                  outline: 'none'
                }}
              />
            </>
          ) : (
            <>
              <div style={{ marginBottom: '10px', color: '#666' }}>
                {profileData.firstText}
              </div>
              <div style={{ color: '#666' }}>
                {profileData.secondText}
              </div>
            </>
          )}
        </div>
        
        {/* Login/Logout */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)'
        }}>
          {currentUser ? (
            <span 
              onClick={handleLogout}
              style={{ 
                fontSize: '12px', 
                color: '#666', 
                cursor: 'pointer' 
              }}
            >
              logout
            </span>
          ) : (
            <span 
              onClick={() => setShowLogin(true)}
              style={{ 
                fontSize: '12px', 
                color: '#666', 
                cursor: 'pointer' 
              }}
            >
              login
            </span>
          )}
        </div>
      </div>
      
      {/* Simple Login Modal */}
      {showLogin && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <form onSubmit={handleLogin} style={{
            background: 'white',
            padding: '20px',
            borderRadius: '10px',
            width: '300px'
          }}>
            <h3 style={{ marginBottom: '20px' }}>Login</h3>
            <input
              type="email"
              placeholder="Email"
              value={loginData.email}
              onChange={(e) => setLoginData({...loginData, email: e.target.value})}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px'
              }}
            />
            <input
              type="password"
              placeholder="Password"
              value={loginData.password}
              onChange={(e) => setLoginData({...loginData, password: e.target.value})}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '20px',
                border: '1px solid #ddd',
                borderRadius: '5px'
              }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" style={{
                flex: 1,
                padding: '10px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}>
                Login
              </button>
              <button 
                type="button"
                onClick={() => setShowLogin(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
