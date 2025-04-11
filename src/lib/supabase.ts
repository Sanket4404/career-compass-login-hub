
import { createClient } from '@supabase/supabase-js';

// These environment variables need to be set in your Supabase project
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Define user profile type
export type UserProfile = {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  created_at: string;
}

// Define career assessment result type
export type CareerAssessment = {
  id: string;
  user_id: string;
  assessment_date: string;
  skills_assessment: Record<string, number>;
  recommended_paths: string[];
  strengths: string[];
  areas_to_improve: string[];
}
