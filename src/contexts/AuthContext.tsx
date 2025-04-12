
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase, UserProfile } from '@/lib/supabase';
import { authService } from '@/services/authService';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

type AuthContextType = {
  user: any; // Supabase user object
  profile: UserProfile | null;
  isLoading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  signInWithLinkedIn: () => Promise<any>;
  forgotPassword: (email: string) => Promise<any>;
  verifyOTPAndResetPassword: (otp: string, email: string, newPassword: string) => Promise<any>;
  signOut: () => Promise<any>;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data } = await authService.getSession();
        setUser(data?.session?.user || null);
        
        if (data?.session?.user) {
          const profileResult = await authService.getCurrentUserProfile();
          setProfile(profileResult.data);
          
          // Set admin status based on profile role
          if (profileResult.data?.role === 'admin') {
            setIsAdmin(true);
          }
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
      console.log('Auth state changed:', event);
      setUser(session?.user || null);
      
      if (session?.user) {
        const profileResult = await authService.getCurrentUserProfile();
        setProfile(profileResult.data);
        
        // Set admin status based on profile role
        if (profileResult.data?.role === 'admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
        
        // Redirect based on role if just logged in
        if (event === 'SIGNED_IN') {
          if (profileResult.data?.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/dashboard');
          }
        }
      } else {
        setProfile(null);
        setIsAdmin(false);
        
        // Redirect to login if signed out
        if (event === 'SIGNED_OUT') {
          navigate('/');
        }
      }
      
      setIsLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

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

  const forgotPassword = async (email: string) => {
    setIsLoading(true);
    const result = await authService.forgotPassword(email);
    setIsLoading(false);
    
    if (result.error) {
      toast({
        title: "Password reset failed",
        description: result.error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Password reset email sent",
        description: "Check your email for reset instructions.",
      });
    }
    
    return result;
  };

  const verifyOTPAndResetPassword = async (otp: string, email: string, newPassword: string) => {
    setIsLoading(true);
    const result = await authService.verifyOTPAndResetPassword(otp, email, newPassword);
    setIsLoading(false);
    
    if (result.error) {
      toast({
        title: "Password reset failed",
        description: result.error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Password reset successful",
        description: "You can now sign in with your new password.",
      });
    }
    
    return result;
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
    forgotPassword,
    verifyOTPAndResetPassword,
    signOut,
    isAdmin,
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
