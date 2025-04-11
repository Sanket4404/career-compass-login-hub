
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/lib/supabase';
import { authService } from '@/services/authService';
import { useToast } from '@/components/ui/use-toast';
import { UserProfile } from '@/lib/supabase';

type AuthContextType = {
  user: any; // Supabase user object
  profile: UserProfile | null;
  isLoading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  signInWithLinkedIn: () => Promise<any>;
  signOut: () => Promise<any>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data } = await authService.getSession();
        setUser(data?.session?.user || null);
        
        if (data?.session?.user) {
          const profileResult = await authService.getCurrentUserProfile();
          setProfile(profileResult.data);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null);
      
      if (session?.user) {
        const profileResult = await authService.getCurrentUserProfile();
        setProfile(profileResult.data);
      } else {
        setProfile(null);
      }
      
      setIsLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    const result = await authService.signUp(email, password, name);
    setIsLoading(false);
    
    if (result.error) {
      toast({
        title: "Sign up failed",
        description: result.error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sign up successful",
        description: "Please check your email to verify your account.",
      });
    }
    
    return result;
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    const result = await authService.signIn(email, password);
    setIsLoading(false);
    
    if (result.error) {
      toast({
        title: "Sign in failed",
        description: result.error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed in successfully",
        description: "Welcome back!",
      });
    }
    
    return result;
  };

  const signInWithGoogle = async () => {
    return await authService.signInWithGoogle();
  };

  const signInWithLinkedIn = async () => {
    return await authService.signInWithLinkedIn();
  };

  const signOut = async () => {
    setIsLoading(true);
    const result = await authService.signOut();
    setIsLoading(false);
    
    if (!result.error) {
      toast({
        title: "Signed out successfully",
      });
    }
    
    return result;
  };

  const value = {
    user,
    profile,
    isLoading,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithLinkedIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
