// Database types generated from Supabase
// Run `pnpm supabase:types` to regenerate

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          full_name: string | null;
          avatar_url: string | null;
          email: string;
          phone: string | null;
          date_of_birth: string | null;
          gender: 'male' | 'female' | 'other' | null;
          preference_style: any | null;
          hair_characteristics: any | null;
          is_verified: boolean;
          last_active: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          full_name?: string | null;
          avatar_url?: string | null;
          email: string;
          phone?: string | null;
          date_of_birth?: string | null;
          gender?: 'male' | 'female' | 'other' | null;
          preference_style?: any | null;
          hair_characteristics?: any | null;
          is_verified?: boolean;
          last_active?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          email?: string;
          phone?: string | null;
          date_of_birth?: string | null;
          gender?: 'male' | 'female' | 'other' | null;
          preference_style?: any | null;
          hair_characteristics?: any | null;
          is_verified?: boolean;
          last_active?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      hair_templates: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          category: string;
          style_tags: string[] | null;
          gender_target: 'male' | 'female' | 'unisex' | null;
          difficulty_level: number | null;
          model_data: any;
          preview_images: string[] | null;
          metadata: any | null;
          is_popular: boolean;
          usage_count: number;
          rating: number;
          created_by: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          category: string;
          style_tags?: string[] | null;
          gender_target?: 'male' | 'female' | 'unisex' | null;
          difficulty_level?: number | null;
          model_data: any;
          preview_images?: string[] | null;
          metadata?: any | null;
          is_popular?: boolean;
          usage_count?: number;
          rating?: number;
          created_by?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          category?: string;
          style_tags?: string[] | null;
          gender_target?: 'male' | 'female' | 'unisex' | null;
          difficulty_level?: number | null;
          model_data?: any;
          preview_images?: string[] | null;
          metadata?: any | null;
          is_popular?: boolean;
          usage_count?: number;
          rating?: number;
          created_by?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      // Add other tables as needed...
      [key: string]: any;
    };
    Views: {
      [key: string]: any;
    };
    Functions: {
      [key: string]: any;
    };
    Enums: {
      [key: string]: any;
    };
  };
}