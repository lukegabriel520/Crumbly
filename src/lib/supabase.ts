import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a fallback client that won't crash if env vars are missing
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          username: string;
          bio: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          username: string;
          bio?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string;
          bio?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      recipes: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          image_url: string | null;
          ingredients: any;
          steps: any;
          status: 'draft' | 'published' | 'archived';
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title: string;
          image_url?: string | null;
          ingredients?: any;
          steps?: any;
          status?: 'draft' | 'published' | 'archived';
          created_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          title?: string;
          image_url?: string | null;
          ingredients?: any;
          steps?: any;
          status?: 'draft' | 'published' | 'archived';
          created_at?: string;
        };
      };
      interactions: {
        Row: {
          id: string;
          recipe_id: string;
          user_id: string;
          type: 'upvote' | 'downvote';
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          recipe_id: string;
          user_id: string;
          type: 'upvote' | 'downvote';
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          recipe_id?: string;
          user_id?: string;
          type?: 'upvote' | 'downvote';
          comment?: string | null;
          created_at?: string;
        };
      };
      ingredients: {
        Row: {
          id: string;
          name: string;
          category: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          description?: string | null;
          created_at?: string;
        };
      };
    };
  };
};