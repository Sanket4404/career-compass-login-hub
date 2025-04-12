
import { supabase, UserProfile } from '@/lib/supabase';

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
      
      // Track login activity and update last_login
      if (data.user) {
        await this.trackLoginActivity(data.user.id);
        await this.updateLastLogin(data.user.id);
      }
      
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

  // Get all user profiles (for admin dashboard)
  async getAllUserProfiles() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Error getting all user profiles:', error);
      return { data: null, error };
    }
  },

  // Track login activity
  async trackLoginActivity(userId: string) {
    try {
      // Get the user's IP address (in a real app, you'd get this from the server)
      const ipAddress = await this.getUserIpAddress();
      
      const { data, error } = await supabase
        .from('login_activity')
        .insert([{ 
          user_id: userId,
          login_time: new Date().toISOString(),
          ip_address: ipAddress
        }]);

      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Error tracking login activity:', error);
      return { data: null, error };
    }
  },

  // Update last login timestamp
  async updateLastLogin(userId: string) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;
      
      return { error: null };
    } catch (error) {
      console.error('Error updating last login:', error);
      return { error };
    }
  },

  // Get a user's IP address
  async getUserIpAddress() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Error getting IP address:', error);
      return 'unknown';
    }
  },

  // Get user login activity
  async getUserLoginActivity(userId: string) {
    try {
      const { data, error } = await supabase
        .from('login_activity')
        .select('*')
        .eq('user_id', userId)
        .order('login_time', { ascending: false });

      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Error getting user login activity:', error);
      return { data: null, error };
    }
  },

  // Get all login activity (for admin dashboard)
  async getAllLoginActivity() {
    try {
      const { data, error } = await supabase
        .from('login_activity')
        .select('*, profiles!inner(*)')
        .order('login_time', { ascending: false });

      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Error getting all login activity:', error);
      return { data: null, error };
    }
  }
};
