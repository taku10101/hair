# 髪型デザインアプリ - バックエンド・データベース設計仕様書

## プロジェクト概要

**期間**: 4-5週間  
**担当**: バックエンドエンジニア 2名  
**技術スタック**: Supabase + PostgreSQL  
**GitHub Issue**: #3「バックエンド・データベース設計」

## 1. システムアーキテクチャ

### 1.1 全体構成
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   フロントエンド    │    │    Supabase      │    │   外部サービス      │
│   (Next.js)      │◄──►│   (PostgreSQL)   │◄──►│   (3Dモデル処理)   │
│                 │    │   + Realtime     │    │   (AI髪型生成)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 1.2 主要機能モジュール
- **認証・ユーザー管理**: Supabase Auth + profiles
- **3Dモデル管理**: user_models + hair_templates
- **髪型デザイン**: hair_designs + AI生成
- **美容室・スタイリスト**: salons + stylists
- **予約システム**: appointments
- **リアルタイムチャット**: chat_messages + Realtime

## 2. データベース設計

### 2.1 ERD概要
```
profiles ──┬─── user_models
           ├─── hair_designs
           ├─── appointments
           └─── chat_messages

hair_templates ──── hair_designs

salons ──┬─── stylists
         └─── appointments

stylists ──┬─── appointments
           └─── chat_messages
```

### 2.2 テーブル詳細設計

#### 2.2.1 profiles (ユーザープロファイル)
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(100),
  avatar_url TEXT,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  date_of_birth DATE,
  gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
  preference_style JSONB, -- 好みの髪型スタイル
  hair_characteristics JSONB, -- 髪質・髪量などの特徴
  is_verified BOOLEAN DEFAULT FALSE,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_last_active ON profiles(last_active);

-- トリガー (updated_atの自動更新)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE
  ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
```

#### 2.2.2 hair_templates (髪型テンプレート)
```sql
CREATE TABLE hair_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL, -- ショート、ミディアム、ロング等
  style_tags VARCHAR(50)[], -- ['カジュアル', 'フォーマル', 'トレンド']
  gender_target VARCHAR(10) CHECK (gender_target IN ('male', 'female', 'unisex')),
  difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
  model_data JSONB NOT NULL, -- 3Dモデルデータ（座標、テクスチャ等）
  preview_images TEXT[], -- プレビュー画像URL配列
  metadata JSONB, -- その他のメタデータ
  is_popular BOOLEAN DEFAULT FALSE,
  usage_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  created_by UUID REFERENCES profiles(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_hair_templates_category ON hair_templates(category);
CREATE INDEX idx_hair_templates_style_tags ON hair_templates USING gin(style_tags);
CREATE INDEX idx_hair_templates_gender_target ON hair_templates(gender_target);
CREATE INDEX idx_hair_templates_popular ON hair_templates(is_popular);
CREATE INDEX idx_hair_templates_rating ON hair_templates(rating DESC);

-- updated_atトリガー
CREATE TRIGGER update_hair_templates_updated_at BEFORE UPDATE
  ON hair_templates FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
```

#### 2.2.3 user_models (ユーザー3Dモデル)
```sql
CREATE TABLE user_models (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  name VARCHAR(100) NOT NULL,
  face_model_data JSONB NOT NULL, -- 顔の3Dモデルデータ
  head_measurements JSONB, -- 頭部の寸法データ
  hair_texture VARCHAR(50), -- 髪質（straight, wavy, curly, coily）
  hair_density VARCHAR(50), -- 髪密度（thin, normal, thick）
  hair_color VARCHAR(7) DEFAULT '#000000', -- HEXカラー
  model_images TEXT[], -- モデル参照画像
  is_primary BOOLEAN DEFAULT FALSE, -- メインモデルかどうか
  processing_status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
  model_quality INTEGER CHECK (model_quality BETWEEN 1 AND 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_user_models_user_id ON user_models(user_id);
CREATE INDEX idx_user_models_primary ON user_models(is_primary) WHERE is_primary = TRUE;
CREATE INDEX idx_user_models_status ON user_models(processing_status);

-- 制約：各ユーザーはプライマリモデルを1つまで
CREATE UNIQUE INDEX idx_user_models_primary_unique 
  ON user_models(user_id) WHERE is_primary = TRUE;

-- updated_atトリガー
CREATE TRIGGER update_user_models_updated_at BEFORE UPDATE
  ON user_models FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
```

#### 2.2.4 hair_designs (髪型デザイン)
```sql
CREATE TABLE hair_designs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  user_model_id UUID REFERENCES user_models(id) NOT NULL,
  template_id UUID REFERENCES hair_templates(id),
  title VARCHAR(150) NOT NULL,
  description TEXT,
  design_data JSONB NOT NULL, -- カスタマイズされた3Dデザインデータ
  customizations JSONB, -- テンプレートからの変更内容
  color_scheme VARCHAR(7)[], -- 使用カラーパレット
  render_images TEXT[], -- レンダリング画像URL
  is_ai_generated BOOLEAN DEFAULT FALSE,
  ai_prompt TEXT, -- AI生成時のプロンプト
  generation_parameters JSONB, -- AI生成パラメータ
  is_favorite BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'draft', -- draft, completed, shared, archived
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_hair_designs_user_id ON hair_designs(user_id);
CREATE INDEX idx_hair_designs_user_model_id ON hair_designs(user_model_id);
CREATE INDEX idx_hair_designs_template_id ON hair_designs(template_id);
CREATE INDEX idx_hair_designs_public ON hair_designs(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_hair_designs_favorite ON hair_designs(user_id, is_favorite) WHERE is_favorite = TRUE;
CREATE INDEX idx_hair_designs_status ON hair_designs(status);
CREATE INDEX idx_hair_designs_ai_generated ON hair_designs(is_ai_generated);

-- updated_atトリガー
CREATE TRIGGER update_hair_designs_updated_at BEFORE UPDATE
  ON hair_designs FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
```

#### 2.2.5 salons (美容室)
```sql
CREATE TABLE salons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES profiles(id),
  address JSONB NOT NULL, -- 住所情報
  coordinates POINT, -- 緯度経度
  phone VARCHAR(20),
  email VARCHAR(255),
  website_url TEXT,
  business_hours JSONB, -- 営業時間
  services JSONB[], -- 提供サービス詳細
  price_range VARCHAR(20), -- budget, mid_range, luxury
  amenities VARCHAR(50)[], -- 設備・サービス
  images TEXT[], -- 店舗画像
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  booking_settings JSONB, -- 予約設定
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_salons_coordinates ON salons USING gist(coordinates);
CREATE INDEX idx_salons_owner_id ON salons(owner_id);
CREATE INDEX idx_salons_rating ON salons(rating DESC);
CREATE INDEX idx_salons_price_range ON salons(price_range);
CREATE INDEX idx_salons_active ON salons(is_active) WHERE is_active = TRUE;

-- updated_atトリガー
CREATE TRIGGER update_salons_updated_at BEFORE UPDATE
  ON salons FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
```

#### 2.2.6 stylists (スタイリスト)
```sql
CREATE TABLE stylists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  salon_id UUID REFERENCES salons(id) NOT NULL,
  license_number VARCHAR(50),
  specializations VARCHAR(50)[], -- 専門分野
  experience_years INTEGER,
  bio TEXT,
  portfolio_images TEXT[],
  certifications JSONB[], -- 資格情報
  working_hours JSONB, -- 勤務時間
  hourly_rate DECIMAL(10,2),
  booking_buffer_minutes INTEGER DEFAULT 15,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_stylists_user_id ON stylists(user_id);
CREATE INDEX idx_stylists_salon_id ON stylists(salon_id);
CREATE INDEX idx_stylists_specializations ON stylists USING gin(specializations);
CREATE INDEX idx_stylists_rating ON stylists(rating DESC);
CREATE INDEX idx_stylists_available ON stylists(is_available) WHERE is_available = TRUE;

-- updated_atトリガー
CREATE TRIGGER update_stylists_updated_at BEFORE UPDATE
  ON stylists FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
```

#### 2.2.7 appointments (予約)
```sql
CREATE TABLE appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES profiles(id) NOT NULL,
  stylist_id UUID REFERENCES stylists(id) NOT NULL,
  salon_id UUID REFERENCES salons(id) NOT NULL,
  hair_design_id UUID REFERENCES hair_designs(id),
  appointment_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  end_datetime TIMESTAMP WITH TIME ZONE GENERATED ALWAYS AS 
    (appointment_datetime + (duration_minutes || ' minutes')::interval) STORED,
  service_types VARCHAR(50)[] NOT NULL,
  estimated_price DECIMAL(10,2),
  actual_price DECIMAL(10,2),
  special_requests TEXT,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, in_progress, completed, cancelled, no_show
  cancellation_reason TEXT,
  reminder_sent BOOLEAN DEFAULT FALSE,
  payment_status VARCHAR(20) DEFAULT 'pending', -- pending, paid, refunded
  payment_method VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_appointments_client_id ON appointments(client_id);
CREATE INDEX idx_appointments_stylist_id ON appointments(stylist_id);
CREATE INDEX idx_appointments_salon_id ON appointments(salon_id);
CREATE INDEX idx_appointments_datetime ON appointments(appointment_datetime);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_end_datetime ON appointments(end_datetime);

-- 時間重複チェック制約
CREATE UNIQUE INDEX idx_appointments_stylist_time_conflict
  ON appointments(stylist_id, appointment_datetime, end_datetime)
  WHERE status NOT IN ('cancelled', 'no_show');

-- updated_atトリガー
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE
  ON appointments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
```

#### 2.2.8 chat_messages (チャットメッセージ)
```sql
CREATE TABLE chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL, -- 会話セッション識別子
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  recipient_id UUID REFERENCES profiles(id),
  appointment_id UUID REFERENCES appointments(id),
  message_type VARCHAR(20) DEFAULT 'text', -- text, image, design_share, appointment_update
  content TEXT NOT NULL,
  attachments JSONB[], -- 添付ファイル情報
  shared_design_id UUID REFERENCES hair_designs(id),
  metadata JSONB, -- その他のメタデータ
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  edited_at TIMESTAMP WITH TIME ZONE,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX idx_chat_messages_recipient_id ON chat_messages(recipient_id);
CREATE INDEX idx_chat_messages_appointment_id ON chat_messages(appointment_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX idx_chat_messages_unread ON chat_messages(recipient_id, is_read) 
  WHERE is_read = FALSE AND is_deleted = FALSE;

-- 会話相手のインデックス
CREATE INDEX idx_chat_messages_participants ON chat_messages(
  LEAST(sender_id, recipient_id), 
  GREATEST(sender_id, recipient_id),
  created_at DESC
) WHERE recipient_id IS NOT NULL;
```

## 3. Row Level Security (RLS) ポリシー設計

### 3.1 基本方針
- 全テーブルでRLSを有効化
- ユーザーは自分のデータのみアクセス可能
- 美容室・スタイリストは適切な権限範囲内でアクセス
- 公開データは認証ユーザーが閲覧可能

### 3.2 RLS ポリシー詳細

#### 3.2.1 profiles テーブル
```sql
-- RLS有効化
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ポリシー: ユーザーは自分のプロファイルのみ参照・更新可能
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- ポリシー: 認証済みユーザーは他のプロファイル基本情報を参照可能
CREATE POLICY "Authenticated users can view public profile data" ON profiles
  FOR SELECT USING (
    auth.role() = 'authenticated' AND 
    current_setting('request.jwt.claims', true)::json->>'role' = 'authenticated'
  );
```

#### 3.2.2 hair_templates テーブル
```sql
ALTER TABLE hair_templates ENABLE ROW LEVEL SECURITY;

-- ポリシー: アクティブなテンプレートは全認証ユーザーが参照可能
CREATE POLICY "Authenticated users can view active templates" ON hair_templates
  FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);

-- ポリシー: 作成者は自分のテンプレートを更新可能
CREATE POLICY "Template creators can update own templates" ON hair_templates
  FOR UPDATE USING (auth.uid() = created_by);

-- ポリシー: 認証ユーザーは新規テンプレート作成可能
CREATE POLICY "Authenticated users can create templates" ON hair_templates
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

#### 3.2.3 user_models テーブル
```sql
ALTER TABLE user_models ENABLE ROW LEVEL SECURITY;

-- ポリシー: ユーザーは自分のモデルのみアクセス可能
CREATE POLICY "Users can manage own models" ON user_models
  FOR ALL USING (auth.uid() = user_id);
```

#### 3.2.4 hair_designs テーブル
```sql
ALTER TABLE hair_designs ENABLE ROW LEVEL SECURITY;

-- ポリシー: ユーザーは自分のデザインを完全管理
CREATE POLICY "Users can manage own designs" ON hair_designs
  FOR ALL USING (auth.uid() = user_id);

-- ポリシー: 公開デザインは全認証ユーザーが参照可能
CREATE POLICY "Authenticated users can view public designs" ON hair_designs
  FOR SELECT USING (
    auth.role() = 'authenticated' AND 
    is_public = true
  );
```

#### 3.2.5 salons テーブル
```sql
ALTER TABLE salons ENABLE ROW LEVEL SECURITY;

-- ポリシー: アクティブな美容室は全認証ユーザーが参照可能
CREATE POLICY "Authenticated users can view active salons" ON salons
  FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);

-- ポリシー: オーナーは自分の美容室を管理可能
CREATE POLICY "Salon owners can manage own salons" ON salons
  FOR ALL USING (auth.uid() = owner_id);
```

#### 3.2.6 stylists テーブル
```sql
ALTER TABLE stylists ENABLE ROW LEVEL SECURITY;

-- ポリシー: 認証ユーザーはスタイリスト情報を参照可能
CREATE POLICY "Authenticated users can view stylists" ON stylists
  FOR SELECT USING (auth.role() = 'authenticated');

-- ポリシー: スタイリスト本人は自分の情報を管理可能
CREATE POLICY "Stylists can manage own profile" ON stylists
  FOR ALL USING (auth.uid() = user_id);

-- ポリシー: 美容室オーナーは所属スタイリストを管理可能
CREATE POLICY "Salon owners can manage stylists" ON stylists
  FOR ALL USING (
    auth.uid() IN (
      SELECT owner_id FROM salons WHERE id = stylists.salon_id
    )
  );
```

#### 3.2.7 appointments テーブル
```sql
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- ポリシー: クライアントは自分の予約を管理可能
CREATE POLICY "Clients can manage own appointments" ON appointments
  FOR ALL USING (auth.uid() = client_id);

-- ポリシー: スタイリストは自分の予約を参照・更新可能
CREATE POLICY "Stylists can manage assigned appointments" ON appointments
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM stylists WHERE id = appointments.stylist_id
    )
  );

CREATE POLICY "Stylists can update assigned appointments" ON appointments
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM stylists WHERE id = appointments.stylist_id
    )
  );
```

#### 3.2.8 chat_messages テーブル
```sql
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- ポリシー: 送信者と受信者のみメッセージにアクセス可能
CREATE POLICY "Message participants can access messages" ON chat_messages
  FOR ALL USING (
    auth.uid() = sender_id OR 
    auth.uid() = recipient_id
  );
```

## 4. API設計

### 4.1 API構成概要
```
/api/
├── auth/                 # 認証関連
├── users/                # ユーザー管理
├── models/               # 3Dモデル管理
├── designs/              # 髪型デザイン
├── ai/                   # AI生成機能
├── salons/               # 美容室管理
├── stylists/             # スタイリスト管理
├── appointments/         # 予約管理
├── chat/                 # チャット機能
└── uploads/              # ファイルアップロード
```

### 4.2 認証API

#### POST /api/auth/signup
```typescript
interface SignupRequest {
  email: string;
  password: string;
  full_name: string;
  username: string;
}

interface SignupResponse {
  user: User;
  session: Session;
}
```

#### POST /api/auth/login
```typescript
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  user: User;
  session: Session;
}
```

### 4.3 ユーザー管理API

#### GET /api/users/profile
```typescript
interface ProfileResponse {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  hair_characteristics?: HairCharacteristics;
  preference_style?: PreferenceStyle;
}
```

#### PATCH /api/users/profile
```typescript
interface UpdateProfileRequest {
  full_name?: string;
  avatar_url?: string;
  hair_characteristics?: HairCharacteristics;
  preference_style?: PreferenceStyle;
}
```

### 4.4 3Dモデル管理API

#### POST /api/models
```typescript
interface CreateModelRequest {
  name: string;
  face_images: string[]; // Base64 encoded images
  hair_texture: string;
  hair_density: string;
  hair_color: string;
}

interface CreateModelResponse {
  model_id: string;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  estimated_completion_time: string;
}
```

#### GET /api/models/{model_id}
```typescript
interface ModelResponse {
  id: string;
  name: string;
  face_model_data: any;
  head_measurements: any;
  processing_status: string;
  model_quality: number;
  created_at: string;
}
```

### 4.5 髪型デザインAPI

#### GET /api/designs
```typescript
interface GetDesignsRequest {
  user_id?: string;
  is_public?: boolean;
  template_id?: string;
  page?: number;
  limit?: number;
  sort?: 'created_at' | 'like_count' | 'view_count';
}

interface GetDesignsResponse {
  designs: HairDesign[];
  total: number;
  page: number;
  limit: number;
}
```

#### POST /api/designs
```typescript
interface CreateDesignRequest {
  user_model_id: string;
  template_id?: string;
  title: string;
  description?: string;
  design_data: any;
  customizations?: any;
  color_scheme?: string[];
  is_public?: boolean;
}
```

### 4.6 AI生成API

#### POST /api/ai/generate-design
```typescript
interface AIGenerateRequest {
  user_model_id: string;
  prompt: string;
  style_preferences?: string[];
  face_shape_consideration?: boolean;
  hair_texture_consideration?: boolean;
  occasion?: string;
  length_preference?: 'short' | 'medium' | 'long';
}

interface AIGenerateResponse {
  task_id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  estimated_completion_time: string;
}
```

#### GET /api/ai/generate-status/{task_id}
```typescript
interface AIGenerateStatusResponse {
  task_id: string;
  status: string;
  progress_percentage: number;
  result?: {
    design_id: string;
    preview_images: string[];
    confidence_score: number;
  };
  error_message?: string;
}
```

### 4.7 美容室・予約API

#### GET /api/salons
```typescript
interface GetSalonsRequest {
  latitude?: number;
  longitude?: number;
  radius_km?: number;
  services?: string[];
  price_range?: string;
  rating_min?: number;
  page?: number;
  limit?: number;
}

interface SalonResponse {
  id: string;
  name: string;
  description: string;
  address: Address;
  distance_km?: number;
  rating: number;
  review_count: number;
  price_range: string;
  amenities: string[];
  images: string[];
}
```

#### POST /api/appointments
```typescript
interface CreateAppointmentRequest {
  stylist_id: string;
  appointment_datetime: string;
  duration_minutes: number;
  service_types: string[];
  hair_design_id?: string;
  special_requests?: string;
}

interface CreateAppointmentResponse {
  appointment_id: string;
  confirmation_code: string;
  estimated_price: number;
  payment_required: boolean;
}
```

### 4.8 チャット機能API

#### GET /api/chat/conversations
```typescript
interface ConversationsResponse {
  conversations: {
    conversation_id: string;
    participant: UserProfile;
    last_message: ChatMessage;
    unread_count: number;
    updated_at: string;
  }[];
}
```

#### POST /api/chat/messages
```typescript
interface SendMessageRequest {
  conversation_id?: string; // 新規の場合はnull
  recipient_id?: string;    // 新規の場合は必須
  appointment_id?: string;
  message_type: 'text' | 'image' | 'design_share';
  content: string;
  shared_design_id?: string;
  attachments?: FileUpload[];
}
```

## 5. Supabase Realtime設定

### 5.1 Realtimeチャンネル設定

```typescript
// チャットメッセージのリアルタイム更新
const chatChannel = supabase
  .channel(`chat:${conversationId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'chat_messages',
    filter: `conversation_id=eq.${conversationId}`
  }, handleNewMessage)
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public', 
    table: 'chat_messages',
    filter: `conversation_id=eq.${conversationId}`
  }, handleMessageUpdate)
  .subscribe();

// 予約状態の更新通知
const appointmentChannel = supabase
  .channel(`appointments:${userId}`)
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'appointments',
    filter: `client_id=eq.${userId}`
  }, handleAppointmentUpdate)
  .subscribe();

// 3Dモデル処理状況の更新
const modelProcessingChannel = supabase
  .channel(`models:${userId}`)
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'user_models',
    filter: `user_id=eq.${userId}`
  }, handleModelProcessingUpdate)
  .subscribe();
```

### 5.2 Presence機能 (オンライン状態)

```typescript
// スタイリストのオンライン状態管理
const presenceChannel = supabase.channel('stylists-online')
  .on('presence', { event: 'sync' }, () => {
    const newState = presenceChannel.presenceState();
    // オンラインスタイリスト一覧を更新
    setOnlineStylists(newState);
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await presenceChannel.track({
        user_id: currentUser.id,
        user_type: 'stylist',
        salon_id: stylistData.salon_id,
        online_at: new Date().toISOString(),
      });
    }
  });
```

## 6. セキュリティ設計

### 6.1 JWT認証設定

```sql
-- JWT カスタムクレーム設定
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'full_name',
    NEW.email
  );
  RETURN NEW;
END;
$$ language plpgsql security definer;

-- トリガー設定
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

### 6.2 Rate Limiting設計

```typescript
// API Rate Limiting設定
const rateLimitConfig = {
  // 一般API
  standard: {
    windowMs: 15 * 60 * 1000, // 15分
    max: 100, // リクエスト数
    message: 'Too many requests from this IP'
  },
  // AI生成API (重い処理)
  ai_generation: {
    windowMs: 60 * 60 * 1000, // 1時間
    max: 10, // リクエスト数
    keyGenerator: (req) => req.user.id, // ユーザー単位
  },
  // ファイルアップロード
  file_upload: {
    windowMs: 60 * 1000, // 1分
    max: 5,
    skip: (req) => req.user?.is_premium, // プレミアムユーザーはスキップ
  },
  // 認証API
  auth: {
    windowMs: 15 * 60 * 1000,
    max: 5, // ログイン試行
    skipSuccessfulRequests: true,
  }
};
```

### 6.3 データ暗号化

```typescript
// 機密データの暗号化
interface EncryptionConfig {
  // プロファイル個人情報
  personal_data: {
    fields: ['phone', 'date_of_birth'],
    algorithm: 'AES-256-GCM',
    key_rotation: '90days'
  },
  // 3Dモデルデータ
  model_data: {
    fields: ['face_model_data', 'head_measurements'],
    algorithm: 'AES-256-GCM',
    compression: true
  },
  // チャットメッセージ
  chat_content: {
    fields: ['content'],
    algorithm: 'AES-256-GCM',
    end_to_end: true // クライアント側暗号化
  }
}
```

### 6.4 入力検証・サニタイゼーション

```typescript
// バリデーションスキーマ
import Joi from 'joi';

const schemas = {
  createDesign: Joi.object({
    user_model_id: Joi.string().uuid().required(),
    template_id: Joi.string().uuid().optional(),
    title: Joi.string().min(1).max(150).required(),
    description: Joi.string().max(1000).optional(),
    design_data: Joi.object().required(),
    color_scheme: Joi.array().items(Joi.string().regex(/^#[0-9A-F]{6}$/i)).max(5),
    is_public: Joi.boolean().default(false)
  }),

  chatMessage: Joi.object({
    content: Joi.string().min(1).max(2000).required(),
    message_type: Joi.string().valid('text', 'image', 'design_share').required(),
    conversation_id: Joi.string().uuid().optional(),
    recipient_id: Joi.string().uuid().optional()
  }),

  appointmentBooking: Joi.object({
    stylist_id: Joi.string().uuid().required(),
    appointment_datetime: Joi.date().min('now').required(),
    duration_minutes: Joi.number().min(30).max(480).required(),
    service_types: Joi.array().items(Joi.string()).min(1).required()
  })
};
```

## 7. 実装計画（4-5週間）

### 第1週: 基盤構築
**担当**: バックエンドエンジニア A + B

- [ ] Supabaseプロジェクト初期設定
- [ ] データベーススキーマ作成・マイグレーション
- [ ] RLSポリシー実装
- [ ] 基本認証API実装
- [ ] 開発環境構築・CI/CD設定

**成果物**:
- データベース完全構築
- 認証システム稼働
- 開発環境準備完了

### 第2週: コアAPI開発
**担当A**: ユーザー管理・3Dモデル関連  
**担当B**: 美容室・スタイリスト・予約関連

- [ ] ユーザープロファイル管理API
- [ ] 3Dモデルアップロード・処理API
- [ ] 美容室・スタイリスト管理API
- [ ] 基本的な予約管理API
- [ ] ファイルアップロード機能

**成果物**:
- 基本CRUD API群
- ファイル処理システム

### 第3週: 高度な機能実装
**担当A**: 髪型デザイン・AI生成  
**担当B**: チャット・Realtime機能

- [ ] 髪型デザイン管理API
- [ ] AI生成機能統合
- [ ] リアルタイムチャット実装
- [ ] Supabase Realtime設定
- [ ] 通知システム基盤

**成果物**:
- 髪型デザインシステム
- リアルタイム機能
- AI統合基盤

### 第4週: セキュリティ・最適化
**担当A**: セキュリティ強化  
**担当B**: パフォーマンス最適化

- [ ] Rate Limiting実装
- [ ] データ暗号化機能
- [ ] セキュリティ監査対応
- [ ] データベースインデックス最適化
- [ ] API応答速度改善
- [ ] エラーハンドリング強化

**成果物**:
- セキュアなAPIシステム
- 最適化されたパフォーマンス

### 第5週: テスト・ドキュメント・デプロイ
**担当**: バックエンドエンジニア A + B

- [ ] 包括的テストスイート作成
- [ ] API ドキュメント完成
- [ ] 本番環境デプロイ準備
- [ ] 監視・ロギング設定
- [ ] 最終的な統合テスト

**成果物**:
- 完全テスト済みシステム
- 本番稼働準備完了

## 8. 監視・メンテナンス

### 8.1 監視項目
- API応答時間・エラー率
- データベースパフォーマンス
- 3Dモデル処理状況
- AI生成処理状況
- リアルタイム接続状況
- セキュリティイベント

### 8.2 アラート設定
```yaml
alerts:
  - name: "API Response Time"
    condition: "avg_response_time > 2000ms"
    action: "slack_notification"
  
  - name: "Database Connections"
    condition: "active_connections > 80% of max"
    action: "email_notification"
  
  - name: "Failed AI Generations"
    condition: "failure_rate > 10%"
    action: "pagerduty_alert"
```

---

## 次期検討事項

1. **マイクロサービス分離**: ユーザー数増加時のスケーラビリティ
2. **AI モデル更新**: 髪型トレンドに合わせたモデル改善
3. **国際化対応**: 多言語・多通貨対応
4. **モバイルアプリ対応**: 専用API最適化
5. **分析基盤**: ユーザー行動分析・ビジネスインテリジェンス

この設計書に基づき、段階的かつ確実にバックエンドシステムを構築していきます。