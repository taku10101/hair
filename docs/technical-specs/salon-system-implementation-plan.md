# 美容師連携・予約システム 詳細実装計画書

## プロジェクト概要

### 基本情報
- **プロジェクト名**: 美容師連携・予約システム
- **実装期間**: 5-6週間
- **チーム構成**: フルスタックエンジニア 2名 + フロントエンドエンジニア 1名
- **GitHub Issue**: #6

### 主要機能
1. 美容室・美容師管理システム
2. 3Dモデル共有・施術難易度自動算出
3. リアルタイムチャット (Supabase Realtime + WebSocket)
4. 予約システム・カレンダー表示
5. 美容師向けダッシュボード・顧客管理
6. 通知システム (Web Push API + メール)

---

## 技術スタック

### フロントエンド
- **Framework**: Next.js 14 (App Router)
- **UI Library**: Tailwind CSS + shadcn/ui
- **3D Rendering**: Three.js / React Three Fiber
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod
- **Real-time**: Socket.IO Client / Supabase Realtime Client

### バックエンド
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime + Socket.IO
- **File Storage**: Supabase Storage (3Dモデル用)
- **API**: Next.js API Routes + tRPC
- **Push Notifications**: Web Push API
- **Email**: Resend / SendGrid

### インフラ
- **Hosting**: Vercel
- **Database**: Supabase
- **CDN**: Vercel Edge Network
- **Monitoring**: Vercel Analytics + Sentry

---

## データベース設計

### ERD概要

```sql
-- ユーザー関連
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  avatar_url TEXT,
  phone VARCHAR,
  role user_role NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 美容室関連
CREATE TABLE salons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  phone VARCHAR,
  email VARCHAR,
  business_hours JSONB, -- 営業時間
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 美容師関連
CREATE TABLE stylists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
  specialties TEXT[], -- 得意分野
  experience_years INTEGER,
  rating DECIMAL(3,2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 3Dモデル関連
CREATE TABLE hair_models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  model_url TEXT NOT NULL, -- Supabase Storage URL
  thumbnail_url TEXT,
  hair_length hair_length_type,
  hair_type hair_type_enum,
  face_shape face_shape_enum,
  difficulty_score INTEGER, -- 1-10の施術難易度
  metadata JSONB, -- 追加のモデル情報
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 予約関連
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stylist_id UUID REFERENCES stylists(id) ON DELETE CASCADE,
  salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
  hair_model_id UUID REFERENCES hair_models(id),
  service_type VARCHAR NOT NULL,
  scheduled_at TIMESTAMP NOT NULL,
  duration_minutes INTEGER DEFAULT 120,
  status booking_status DEFAULT 'pending',
  notes TEXT,
  total_price DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- チャット関連
CREATE TABLE chat_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES users(id),
  stylist_id UUID REFERENCES stylists(id),
  last_message_at TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type message_type_enum DEFAULT 'text',
  attachment_url TEXT,
  is_read BOOLEAN DEFAULT false,
  sent_at TIMESTAMP DEFAULT now()
);

-- 通知関連
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  message TEXT NOT NULL,
  type notification_type NOT NULL,
  is_read BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT now()
);

-- レビュー関連
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stylist_id UUID REFERENCES stylists(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT now()
);
```

### ENUMタイプ定義

```sql
-- ユーザー役割
CREATE TYPE user_role AS ENUM ('customer', 'stylist', 'salon_admin');

-- 予約ステータス
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled');

-- 髪の長さ
CREATE TYPE hair_length_type AS ENUM ('short', 'medium', 'long');

-- 髪質
CREATE TYPE hair_type_enum AS ENUM ('straight', 'wavy', 'curly', 'coily');

-- 顔型
CREATE TYPE face_shape_enum AS ENUM ('oval', 'round', 'square', 'heart', 'diamond');

-- メッセージタイプ
CREATE TYPE message_type_enum AS ENUM ('text', 'image', 'hair_model');

-- 通知タイプ
CREATE TYPE notification_type AS ENUM ('booking_confirmation', 'booking_reminder', 'chat_message', 'review_request');
```

---

## システムアーキテクチャ

### 全体構成図

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Customer      │    │   Stylist       │    │  Salon Admin    │
│   Web App       │    │   Web App       │    │   Dashboard     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                        │                        │
        └────────────────────────┼────────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Next.js App   │
                    │   (Frontend)    │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │   API Layer     │
                    │   (tRPC + REST) │
                    └─────────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Supabase      │    │   Socket.IO     │    │   3D Engine     │
│   (Database +   │    │   (Real-time    │    │   (Three.js)    │
│    Auth)        │    │    Chat)        │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                        │                        │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Supabase      │    │   Web Push API  │    │   Email Service │
│   Storage       │    │   (Notifications│    │   (Resend)      │
│   (3D Models)   │    │    Service)     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 詳細機能設計

### 1. 3Dモデル共有・施術難易度自動算出

#### 3Dモデル処理フロー
```javascript
// 3Dモデルアップロード処理
async function upload3DModel(file: File, userId: string) {
  // 1. ファイル検証
  const validFormats = ['.obj', '.fbx', '.gltf', '.glb'];
  const isValid = validFormats.some(format => 
    file.name.toLowerCase().endsWith(format)
  );
  
  if (!isValid) {
    throw new Error('サポートされていないファイル形式です');
  }

  // 2. Supabase Storageにアップロード
  const { data: uploadData, error } = await supabase.storage
    .from('hair-models')
    .upload(`${userId}/${Date.now()}_${file.name}`, file);

  if (error) throw error;

  // 3. 3Dモデル解析・難易度算出
  const analysisResult = await analyze3DModel(uploadData.path);
  
  // 4. データベースに保存
  const { data, error: dbError } = await supabase
    .from('hair_models')
    .insert({
      user_id: userId,
      name: file.name,
      model_url: uploadData.path,
      difficulty_score: analysisResult.difficultyScore,
      metadata: analysisResult.metadata
    });

  return data;
}

// 施術難易度自動算出アルゴリズム
function calculateDifficultyScore(modelData: ModelData): number {
  let score = 0;
  
  // 髪の長さによる難易度 (1-3点)
  const lengthScore = {
    'short': 1,
    'medium': 2,
    'long': 3
  }[modelData.hairLength] || 1;
  
  // 髪質による難易度 (1-3点)
  const typeScore = {
    'straight': 1,
    'wavy': 2,
    'curly': 3,
    'coily': 3
  }[modelData.hairType] || 1;
  
  // 複雑さによる難易度 (1-4点)
  const complexityScore = Math.min(4, Math.ceil(modelData.vertexCount / 10000));
  
  return Math.min(10, lengthScore + typeScore + complexityScore);
}
```

#### 3Dビューアコンポーネント
```typescript
// components/HairModelViewer.tsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';

interface HairModelViewerProps {
  modelUrl: string;
  interactive?: boolean;
}

export function HairModelViewer({ modelUrl, interactive = true }: HairModelViewerProps) {
  const { scene } = useGLTF(modelUrl);
  
  return (
    <div className="h-96 w-full">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <primitive object={scene} />
        {interactive && <OrbitControls />}
      </Canvas>
    </div>
  );
}
```

### 2. リアルタイムチャットシステム

#### Socket.IO + Supabase Realtime実装
```typescript
// lib/chat.ts
import { io, Socket } from 'socket.io-client';
import { supabase } from './supabase';

class ChatService {
  private socket: Socket | null = null;
  
  constructor() {
    this.initializeSocket();
    this.setupSupabaseRealtime();
  }
  
  private initializeSocket() {
    this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      auth: {
        token: supabase.auth.session()?.access_token
      }
    });
  }
  
  private setupSupabaseRealtime() {
    // チャットメッセージのリアルタイム監視
    supabase
      .channel('chat_messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages'
      }, (payload) => {
        this.handleNewMessage(payload.new);
      })
      .subscribe();
  }
  
  async sendMessage(roomId: string, content: string, type: 'text' | 'image' | 'hair_model' = 'text') {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        room_id: roomId,
        sender_id: supabase.auth.user()?.id,
        content,
        message_type: type
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Socket.IOでリアルタイム送信
    this.socket?.emit('message_sent', data);
    
    return data;
  }
  
  private handleNewMessage(message: ChatMessage) {
    // UI更新用のカスタムイベント発火
    window.dispatchEvent(new CustomEvent('new_chat_message', {
      detail: message
    }));
  }
}

export const chatService = new ChatService();
```

#### チャットコンポーネント
```typescript
// components/ChatRoom.tsx
import { useState, useEffect, useRef } from 'react';
import { chatService } from '@/lib/chat';

interface ChatRoomProps {
  roomId: string;
  currentUserId: string;
}

export function ChatRoom({ roomId, currentUserId }: ChatRoomProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // 既存メッセージの取得
    loadMessages();
    
    // リアルタイムメッセージの監視
    const handleNewMessage = (event: CustomEvent) => {
      const message = event.detail as ChatMessage;
      if (message.room_id === roomId) {
        setMessages(prev => [...prev, message]);
      }
    };
    
    window.addEventListener('new_chat_message', handleNewMessage as EventListener);
    
    return () => {
      window.removeEventListener('new_chat_message', handleNewMessage as EventListener);
    };
  }, [roomId]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const loadMessages = async () => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*, sender:users(*)')
      .eq('room_id', roomId)
      .order('sent_at', { ascending: true });
    
    if (data) {
      setMessages(data);
    }
  };
  
  const sendMessage = async () => {
    if (!inputValue.trim()) return;
    
    try {
      await chatService.sendMessage(roomId, inputValue);
      setInputValue('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender_id === currentUserId ? 'justify-end' : 'justify-start'
            }`}
          >
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              message.sender_id === currentUserId
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-900'
            }`}>
              {message.message_type === 'hair_model' ? (
                <HairModelViewer modelUrl={message.content} interactive={false} />
              ) : (
                <p>{message.content}</p>
              )}
              <p className="text-xs mt-1 opacity-70">
                {new Date(message.sent_at).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1 border rounded-lg px-3 py-2"
            placeholder="メッセージを入力..."
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            送信
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 3. 予約システム・カレンダー表示

#### 予約管理システム
```typescript
// lib/booking.ts
export class BookingService {
  static async createBooking(bookingData: CreateBookingData): Promise<Booking> {
    // 1. スケジュール重複チェック
    const conflictCheck = await this.checkScheduleConflict(
      bookingData.stylist_id,
      bookingData.scheduled_at,
      bookingData.duration_minutes
    );
    
    if (conflictCheck.hasConflict) {
      throw new Error('選択した時間は既に予約が入っています');
    }
    
    // 2. 美容師の営業時間チェック
    const isWithinBusinessHours = await this.validateBusinessHours(
      bookingData.salon_id,
      bookingData.scheduled_at,
      bookingData.duration_minutes
    );
    
    if (!isWithinBusinessHours) {
      throw new Error('営業時間外です');
    }
    
    // 3. 予約作成
    const { data, error } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select('*, customer:users(*), stylist:stylists(*)')
      .single();
    
    if (error) throw error;
    
    // 4. チャットルーム作成
    await this.createChatRoom(data.id, data.customer_id, data.stylist_id);
    
    // 5. 通知送信
    await this.sendBookingNotifications(data);
    
    return data;
  }
  
  private static async checkScheduleConflict(
    stylistId: string,
    scheduledAt: string,
    durationMinutes: number
  ): Promise<{ hasConflict: boolean; conflictingBookings?: Booking[] }> {
    const startTime = new Date(scheduledAt);
    const endTime = new Date(startTime.getTime() + durationMinutes * 60000);
    
    const { data: conflictingBookings } = await supabase
      .from('bookings')
      .select('*')
      .eq('stylist_id', stylistId)
      .in('status', ['pending', 'confirmed', 'in_progress'])
      .gte('scheduled_at', startTime.toISOString())
      .lt('scheduled_at', endTime.toISOString());
    
    return {
      hasConflict: (conflictingBookings?.length || 0) > 0,
      conflictingBookings: conflictingBookings || []
    };
  }
  
  private static async createChatRoom(
    bookingId: string,
    customerId: string,
    stylistId: string
  ): Promise<void> {
    await supabase
      .from('chat_rooms')
      .insert({
        booking_id: bookingId,
        customer_id: customerId,
        stylist_id: stylistId
      });
  }
  
  private static async sendBookingNotifications(booking: Booking): Promise<void> {
    // 顧客への確認通知
    await NotificationService.sendNotification(booking.customer_id, {
      title: '予約確認',
      message: `${new Date(booking.scheduled_at).toLocaleString()}の予約を受け付けました`,
      type: 'booking_confirmation',
      metadata: { booking_id: booking.id }
    });
    
    // 美容師への通知
    await NotificationService.sendNotification(booking.stylist_id, {
      title: '新しい予約',
      message: `${booking.customer.name}様からの予約があります`,
      type: 'booking_confirmation',
      metadata: { booking_id: booking.id }
    });
  }
}
```

#### カレンダーコンポーネント
```typescript
// components/BookingCalendar.tsx
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/ja';

moment.locale('ja');
const localizer = momentLocalizer(moment);

interface BookingCalendarProps {
  stylistId?: string;
  view: 'customer' | 'stylist';
}

export function BookingCalendar({ stylistId, view }: BookingCalendarProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
  
  useEffect(() => {
    loadBookings();
  }, [stylistId]);
  
  const loadBookings = async () => {
    let query = supabase
      .from('bookings')
      .select('*, customer:users(*), stylist:stylists(*)');
    
    if (stylistId) {
      query = query.eq('stylist_id', stylistId);
    }
    
    const { data, error } = await query;
    
    if (data) {
      const calendarEvents = data.map(booking => ({
        id: booking.id,
        title: view === 'stylist' 
          ? booking.customer.name 
          : booking.stylist.name,
        start: new Date(booking.scheduled_at),
        end: new Date(new Date(booking.scheduled_at).getTime() + booking.duration_minutes * 60000),
        resource: booking
      }));
      
      setEvents(calendarEvents);
    }
  };
  
  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    if (view === 'customer') {
      setSelectedSlot(slotInfo);
      // 予約モーダルを開く
    }
  };
  
  const handleSelectEvent = (event: CalendarEvent) => {
    // 予約詳細モーダルを開く
  };
  
  return (
    <div className="h-96">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        selectable={view === 'customer'}
        views={['month', 'week', 'day']}
        defaultView="week"
        step={30}
        timeslots={2}
        messages={{
          next: '次',
          previous: '前',
          today: '今日',
          month: '月',
          week: '週',
          day: '日'
        }}
        min={new Date(0, 0, 0, 9, 0, 0)} // 9:00 AM
        max={new Date(0, 0, 0, 21, 0, 0)} // 9:00 PM
      />
    </div>
  );
}
```

### 4. 通知システム

#### Web Push API実装
```typescript
// lib/notifications.ts
export class NotificationService {
  private static vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
  
  static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }
    
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  static async subscribeToPush(userId: string): Promise<PushSubscription | null> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported');
      return null;
    }
    
    const registration = await navigator.serviceWorker.register('/sw.js');
    
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
    });
    
    // サブスクリプション情報をサーバーに保存
    await this.savePushSubscription(userId, subscription);
    
    return subscription;
  }
  
  private static async savePushSubscription(
    userId: string, 
    subscription: PushSubscription
  ): Promise<void> {
    await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.toJSON().keys?.p256dh,
        auth: subscription.toJSON().keys?.auth
      });
  }
  
  static async sendNotification(
    userId: string,
    notification: NotificationData
  ): Promise<void> {
    // データベースに通知保存
    const { data: dbNotification } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        ...notification
      })
      .select()
      .single();
    
    // プッシュ通知送信
    await fetch('/api/notifications/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        notification: dbNotification
      })
    });
    
    // メール通知（重要な通知の場合）
    if (notification.type === 'booking_confirmation') {
      await this.sendEmailNotification(userId, notification);
    }
  }
  
  private static async sendEmailNotification(
    userId: string,
    notification: NotificationData
  ): Promise<void> {
    // Resend APIを使用してメール送信
    await fetch('/api/notifications/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        subject: notification.title,
        content: notification.message
      })
    });
  }
  
  private static urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}
```

#### Service Worker (public/sw.js)
```javascript
// public/sw.js
self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.message,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      actions: [
        {
          action: 'view',
          title: '詳細を見る',
          icon: '/view-icon.png'
        },
        {
          action: 'close',
          title: '閉じる'
        }
      ],
      data: data.metadata,
      requireInteraction: true
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  if (event.action === 'view') {
    // 詳細ページを開く
    const bookingId = event.notification.data?.booking_id;
    if (bookingId) {
      event.waitUntil(
        clients.openWindow(`/bookings/${bookingId}`)
      );
    }
  }
});
```

### 5. 美容師向けダッシュボード

#### ダッシュボードコンポーネント
```typescript
// components/StylistDashboard.tsx
export function StylistDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [recentChats, setRecentChats] = useState<ChatRoom[]>([]);
  
  useEffect(() => {
    loadDashboardData();
  }, []);
  
  const loadDashboardData = async () => {
    const stylistId = getCurrentStylistId();
    
    // 統計情報の取得
    const statsData = await getDashboardStats(stylistId);
    setStats(statsData);
    
    // 今日の予約情報
    const today = new Date();
    const { data: bookings } = await supabase
      .from('bookings')
      .select('*, customer:users(*)')
      .eq('stylist_id', stylistId)
      .gte('scheduled_at', today.toISOString().split('T')[0])
      .order('scheduled_at', { ascending: true })
      .limit(5);
    
    setUpcomingBookings(bookings || []);
    
    // 最新のチャット
    const { data: chats } = await supabase
      .from('chat_rooms')
      .select('*, customer:users(*), messages:chat_messages(*)')
      .eq('stylist_id', stylistId)
      .order('last_message_at', { ascending: false })
      .limit(5);
    
    setRecentChats(chats || []);
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* 統計カード */}
      <div className="col-span-full grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="今月の予約数"
          value={stats?.monthlyBookings || 0}
          icon="📅"
        />
        <StatsCard
          title="平均評価"
          value={stats?.averageRating || 0}
          icon="⭐"
          format="decimal"
        />
        <StatsCard
          title="今月の売上"
          value={stats?.monthlyRevenue || 0}
          icon="💰"
          format="currency"
        />
        <StatsCard
          title="完了率"
          value={stats?.completionRate || 0}
          icon="✅"
          format="percentage"
        />
      </div>
      
      {/* 今日の予約 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">今日の予約</h2>
        <div className="space-y-3">
          {upcomingBookings.map((booking) => (
            <div key={booking.id} className="flex items-center justify-between border-b pb-2">
              <div>
                <p className="font-medium">{booking.customer.name}</p>
                <p className="text-sm text-gray-600">
                  {new Date(booking.scheduled_at).toLocaleTimeString()}
                </p>
              </div>
              <span className={`px-2 py-1 rounded text-xs ${
                booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {booking.status}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* 最新チャット */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">最新メッセージ</h2>
        <div className="space-y-3">
          {recentChats.map((chat) => (
            <div key={chat.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                <div>
                  <p className="font-medium">{chat.customer.name}</p>
                  <p className="text-sm text-gray-600 truncate">
                    {chat.messages[0]?.content}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                {new Date(chat.last_message_at).toLocaleTimeString()}
              </p>
            </div>
          ))}
        </div>
      </div>
      
      {/* カレンダー */}
      <div className="col-span-full bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">スケジュール</h2>
        <BookingCalendar view="stylist" />
      </div>
    </div>
  );
}

function StatsCard({ 
  title, 
  value, 
  icon, 
  format = 'number' 
}: { 
  title: string; 
  value: number; 
  icon: string; 
  format?: 'number' | 'currency' | 'percentage' | 'decimal';
}) {
  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return `¥${val.toLocaleString()}`;
      case 'percentage':
        return `${val}%`;
      case 'decimal':
        return val.toFixed(1);
      default:
        return val.toString();
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold">{formatValue(value)}</p>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );
}
```

---

## 実装スケジュール (5-6週間)

### Week 1: インフラ・基盤設計
**フルスタックエンジニア A + B**
- [ ] プロジェクト初期設定（Next.js + TypeScript）
- [ ] Supabaseプロジェクト作成・データベース設計
- [ ] 認証システム実装（Supabase Auth）
- [ ] 基本的なページルーティング
- [ ] UI コンポーネントライブラリ設定（shadcn/ui）

### Week 2: 3Dモデル・ユーザー管理
**フルスタックエンジニア A** (3Dモデル)
- [ ] 3D モデルアップロード機能
- [ ] Three.js ビューア実装
- [ ] 施術難易度算出アルゴリズム
- [ ] Supabase Storage連携

**フルスタックエンジニア B** (ユーザー管理)
- [ ] ユーザー登録・プロフィール機能
- [ ] 美容室・美容師管理システム
- [ ] 権限管理（顧客/美容師/管理者）

**フロントエンドエンジニア**
- [ ] ユーザー登録・ログインUI
- [ ] プロフィール編集UI
- [ ] レスポンシブデザイン対応

### Week 3: チャット・リアルタイム機能
**フルスタックエンジニア A**
- [ ] Socket.IO サーバー設定
- [ ] Supabase Realtime連携
- [ ] チャットルーム機能
- [ ] ファイル送信（3Dモデル含む）

**フルスタックエンジニア B**
- [ ] 予約システム基盤
- [ ] カレンダー機能実装
- [ ] 予約ロジック（重複チェック等）

**フロントエンドエンジニア**
- [ ] チャットUI実装
- [ ] リアルタイムメッセージ表示
- [ ] 3D モデル共有UI

### Week 4: 予約システム・ダッシュボード
**フルスタックエンジニア A**
- [ ] 予約作成・キャンセル機能
- [ ] カレンダー表示・操作
- [ ] 営業時間・スケジュール管理

**フルスタックエンジニア B**
- [ ] 美容師ダッシュボード
- [ ] 統計・分析機能
- [ ] 顧客管理システム

**フロントエンドエンジニア**
- [ ] 予約フォームUI
- [ ] カレンダーUI（react-big-calendar）
- [ ] ダッシュボードUI

### Week 5: 通知システム・統合
**フルスタックエンジニア A**
- [ ] Web Push API実装
- [ ] Service Worker設定
- [ ] プッシュ通知ロジック

**フルスタックエンジニア B**
- [ ] メール通知システム
- [ ] 通知設定・管理
- [ ] APIの最適化・統合

**フロントエンドエンジニア**
- [ ] 通知UI・設定画面
- [ ] 全体的なUI/UX調整
- [ ] レスポンシブ対応完了

### Week 6: テスト・最終調整
**全メンバー**
- [ ] 統合テスト
- [ ] パフォーマンス最適化
- [ ] バグ修正
- [ ] ドキュメント作成
- [ ] デプロイ準備・本番環境設定

---

## API設計

### REST API エンドポイント

```typescript
// API Routes Structure
/api/
  auth/
    login POST
    logout POST
    register POST
  users/
    profile GET PUT
    [id] GET PUT DELETE
  salons/
    index GET POST
    [id] GET PUT DELETE
    [id]/stylists GET
  stylists/
    index GET POST
    [id] GET PUT DELETE
    [id]/availability GET
    [id]/bookings GET
  bookings/
    index GET POST
    [id] GET PUT DELETE
    [id]/chat GET
  hair-models/
    index GET POST
    [id] GET PUT DELETE
    upload POST
    [id]/analyze POST
  chat/
    rooms GET POST
    [roomId]/messages GET POST
  notifications/
    index GET
    [id]/read PUT
    subscribe POST
    send POST
    email POST
```

### tRPC Schema定義

```typescript
// server/trpc/router.ts
export const appRouter = createRouter()
  .merge('auth.', authRouter)
  .merge('booking.', bookingRouter)
  .merge('chat.', chatRouter)
  .merge('hairModel.', hairModelRouter)
  .merge('notification.', notificationRouter)
  .merge('stylist.', stylistRouter)
  .merge('salon.', salonRouter);

// Booking Router例
const bookingRouter = createRouter()
  .query('list', {
    input: z.object({
      userId: z.string().optional(),
      stylistId: z.string().optional(),
      status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).optional(),
    }),
    resolve: async ({ input, ctx }) => {
      return await getBookings(input, ctx.user);
    },
  })
  .mutation('create', {
    input: z.object({
      stylistId: z.string(),
      scheduledAt: z.date(),
      serviceType: z.string(),
      hairModelId: z.string().optional(),
      notes: z.string().optional(),
    }),
    resolve: async ({ input, ctx }) => {
      return await BookingService.createBooking(input, ctx.user.id);
    },
  })
  .mutation('cancel', {
    input: z.object({
      bookingId: z.string(),
      reason: z.string().optional(),
    }),
    resolve: async ({ input, ctx }) => {
      return await BookingService.cancelBooking(input.bookingId, ctx.user.id);
    },
  });
```

---

## セキュリティ・パフォーマンス

### セキュリティ対策
1. **Row Level Security (RLS)**: Supabaseの行レベルセキュリティを有効化
2. **API Rate Limiting**: tRPCでのレート制限実装
3. **Input Validation**: Zodを使用した厳密な入力検証
4. **File Upload Security**: ファイルタイプ・サイズ制限
5. **JWT Token Management**: 適切なトークン管理・リフレッシュ

### パフォーマンス最適化
1. **Database Indexing**: 頻繁にクエリされるカラムにインデックス作成
2. **Image Optimization**: Next.js Image最適化
3. **Lazy Loading**: 3D モデルの遅延読み込み
4. **Caching**: React Query（TanStack Query）でのデータキャッシュ
5. **Bundle Splitting**: 動的インポートによるコード分割

### 監視・ログ
1. **Error Tracking**: Sentry統合
2. **Performance Monitoring**: Vercel Analytics
3. **Database Monitoring**: Supabase監視機能
4. **Custom Metrics**: 予約率、チャット応答率など

---

## 注意事項・リスク

### 技術的リスク
1. **3D モデル処理負荷**: Three.jsのパフォーマンス最適化が重要
2. **リアルタイム通信**: Socket.IOとSupabase Realtimeの併用による複雑性
3. **ファイルアップロード**: 大容量3D モデルの処理時間
4. **プッシュ通知**: ブラウザ互換性・許可取得

### ビジネスリスク
1. **美容師の操作習熟**: 直感的なUIの重要性
2. **予約キャンセル**: 適切なキャンセルポリシーの実装
3. **3D モデル品質**: ユーザーアップロードの品質管理

### 対策
1. **段階的リリース**: MVPから機能追加
2. **ユーザーテスト**: 美容師・顧客双方でのテスト実施
3. **フィードバックループ**: 継続的な改善サイクル
4. **ドキュメント**: 操作マニュアル・FAQ充実

---

この実装計画書に基づいて、美容師連携・予約システムの開発を進めることで、要件を満たしたシステムを期間内に構築できます。定期的なレビューとアジャイル開発手法により、品質の高いシステムを提供していきます。