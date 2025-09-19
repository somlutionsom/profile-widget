-- 프로젝트명 접두사가 붙은 사용자 프로필 테이블 생성
CREATE TABLE IF NOT EXISTS profile_widget_user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  app_name TEXT DEFAULT 'profile-widget' NOT NULL,
  profile_name TEXT DEFAULT '♡⸝⸝',
  button_color TEXT DEFAULT '#FFD0D8',
  avatar_image TEXT,
  banner_image TEXT,
  saved_url TEXT,
  first_text TEXT DEFAULT '문구를 입력해 주세요 ♡',
  second_text TEXT DEFAULT '문구를 입력해 주세요 ♡',
  text TEXT,
  hyperlink TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, app_name)
);

-- RLS (Row Level Security) 정책 설정
ALTER TABLE profile_widget_user_profiles ENABLE ROW LEVEL SECURITY;

-- 앱별 데이터 격리를 위한 RLS 정책 설정
CREATE POLICY "Users can view own profile in profile-widget app" ON profile_widget_user_profiles
  FOR SELECT USING (
    auth.uid() = user_id AND 
    app_name = 'profile-widget'
  );

CREATE POLICY "Users can insert own profile in profile-widget app" ON profile_widget_user_profiles
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    app_name = 'profile-widget'
  );

CREATE POLICY "Users can update own profile in profile-widget app" ON profile_widget_user_profiles
  FOR UPDATE USING (
    auth.uid() = user_id AND 
    app_name = 'profile-widget'
  );

CREATE POLICY "Users can delete own profile in profile-widget app" ON profile_widget_user_profiles
  FOR DELETE USING (
    auth.uid() = user_id AND 
    app_name = 'profile-widget'
  );

-- 성능 최적화를 위한 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_profile_widget_user_profiles_user_id 
  ON profile_widget_user_profiles(user_id);

CREATE INDEX IF NOT EXISTS idx_profile_widget_user_profiles_app_name 
  ON profile_widget_user_profiles(app_name);

CREATE INDEX IF NOT EXISTS idx_profile_widget_user_profiles_user_app 
  ON profile_widget_user_profiles(user_id, app_name);

CREATE INDEX IF NOT EXISTS idx_profile_widget_user_profiles_created_at 
  ON profile_widget_user_profiles(created_at DESC);

-- 기존 테이블이 있다면 마이그레이션 (선택사항)
-- INSERT INTO profile_widget_user_profiles (user_id, app_name, profile_name, button_color, avatar_image, banner_image, saved_url, first_text, second_text, created_at, updated_at)
-- SELECT user_id, 'profile-widget', '♡⸝⸝', button_color, avatar_image, banner_image, saved_url, first_text, second_text, created_at, updated_at
-- FROM user_profiles
-- WHERE NOT EXISTS (SELECT 1 FROM profile_widget_user_profiles WHERE user_id = user_profiles.user_id AND app_name = 'profile-widget');

-- updated_at 자동 업데이트를 위한 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_at 트리거 생성
CREATE TRIGGER update_profile_widget_user_profiles_updated_at
  BEFORE UPDATE ON profile_widget_user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();




