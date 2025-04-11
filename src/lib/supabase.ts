
import { createClient } from '@supabase/supabase-js';

// These environment variables need to be set in your Supabase project
// For local development, we'll use placeholder values if not defined
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

// Log warning instead of error to prevent app crashing
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Missing Supabase environment variables. Using placeholder values for development. Some features will not work until you set up proper Supabase credentials.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
