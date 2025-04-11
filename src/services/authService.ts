
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/lib/supabase';

export const authService = {
  // Sign up a new user
  async signUp(email: string, password: string, name: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) throw error;

      // Create a profile record for the new user
      if (data.user) {
        await this.createProfile({
          id: data.user.id,
          name,
          email,
          created_at: new Date().toISOString(),
        });
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error signing up:', error);
      return { data: null, error };
    }
  },

  // Sign in an existing user
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Error signing in:', error);
      return { data: null, error };
    }
  },

  // Sign in with Google (OAuth)
  async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });

      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Error signing in with Google:', error);
      return { data: null, error };
    }
  },

  // Sign in with LinkedIn (OAuth)
  async signInWithLinkedIn() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin',
      });

      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Error signing in with LinkedIn:', error);
      return { data: null, error };
    }
  },

  // Send reset password email with OTP
  async forgotPassword(email: string) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });

      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Error sending reset password email:', error);
      return { data: null, error };
    }
  },

  // Verify OTP and reset password
  async verifyOTPAndResetPassword(otp: string, email: string, newPassword: string) {
    try {
      // Verify the OTP by attempting to exchange it for a session
      const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'recovery',
      });

      if (verifyError) throw verifyError;

      // If verification successful, update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;
      
      return { data: verifyData, error: null };
    } catch (error) {
      console.error('Error verifying OTP or resetting password:', error);
      return { data: null, error };
    }
  },

  // Sign out the current user
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error signing out:', error);
      return { error };
    }
  },

  // Create a user profile in the profiles table
  async createProfile(profile: Omit<UserProfile, 'avatar_url'>) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([profile])
        .select();

      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Error creating profile:', error);
      return { data: null, error };
    }
  },

  // Get the current user session
  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error getting session:', error);
      return { data: null, error };
    }
  },

  // Get the current user profile
  async getCurrentUserProfile() {
    try {
      const { data: sessionData } = await this.getSession();
      
      if (!sessionData?.session?.user) {
        return { data: null, error: new Error('No user logged in') };
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionData.session.user.id)
        .single();

      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Error getting user profile:', error);
      return { data: null, error };
    }
  },
};
