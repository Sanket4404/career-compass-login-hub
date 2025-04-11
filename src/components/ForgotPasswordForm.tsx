
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, Mail, KeyRound, Eye, EyeOff } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { authService } from '@/services/authService';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

enum ResetStage {
  EnterEmail,
  EnterOTP,
  NewPassword,
  Success
}

const ForgotPasswordForm = ({ onBack }: { onBack: () => void }) => {
  const { toast } = useToast();
  const [stage, setStage] = useState<ResetStage>(ResetStage.EnterEmail);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [errors, setErrors] = useState({
    email: '',
    otp: '',
    password: '',
    confirmPassword: ''
  });

  const validateEmail = () => {
    if (!email.trim()) {
      setErrors(prev => ({ ...prev, email: 'Email is required' }));
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors(prev => ({ ...prev, email: 'Email is invalid' }));
      return false;
    }
    setErrors(prev => ({ ...prev, email: '' }));
    return true;
  };

  const validateOTP = () => {
    if (!otp || otp.length !== 6) {
      setErrors(prev => ({ ...prev, otp: 'Please enter a valid 6-digit OTP code' }));
      return false;
    }
    setErrors(prev => ({ ...prev, otp: '' }));
    return true;
  };

  const validatePasswords = () => {
    let valid = true;
    
    if (!password) {
      setErrors(prev => ({ ...prev, password: 'Password is required' }));
      valid = false;
    } else if (password.length < 6) {
      setErrors(prev => ({ ...prev, password: 'Password must be at least 6 characters' }));
      valid = false;
    } else {
      setErrors(prev => ({ ...prev, password: '' }));
    }
    
    if (password !== confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      valid = false;
    } else {
      setErrors(prev => ({ ...prev, confirmPassword: '' }));
    }
    
    return valid;
  };

  const handleSendResetEmail = async () => {
    if (!validateEmail()) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await authService.forgotPassword(email);
      
      if (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to send reset email",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Email sent",
          description: "Check your email for the OTP code to reset your password",
        });
        setStage(ResetStage.EnterOTP);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!validateOTP()) return;
    
    // Just move to password reset screen - actual verification happens with password reset
    setStage(ResetStage.NewPassword);
  };

  const handleResetPassword = async () => {
    if (!validatePasswords()) return;
    
    setIsLoading(true);
    
    try {
      const { data, error } = await authService.verifyOTPAndResetPassword(otp, email, password);
      
      if (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to reset password",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Your password has been reset successfully",
        });
        setStage(ResetStage.Success);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white/80 dark:bg-gray-950/80 shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          {stage === ResetStage.EnterEmail && "Forgot Password"}
          {stage === ResetStage.EnterOTP && "Enter OTP Code"}
          {stage === ResetStage.NewPassword && "Reset Password"}
          {stage === ResetStage.Success && "Password Reset Complete"}
        </CardTitle>
        <CardDescription>
          {stage === ResetStage.EnterEmail && "Enter your email to receive a password reset code"}
          {stage === ResetStage.EnterOTP && "Enter the 6-digit code sent to your email"}
          {stage === ResetStage.NewPassword && "Create a new secure password"}
          {stage === ResetStage.Success && "You can now log in with your new password"}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {stage === ResetStage.EnterEmail && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Enter your email" 
                  className={`pl-10 ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            <Button 
              type="button" 
              className="w-full" 
              onClick={handleSendResetEmail}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Send Reset Code
                  <ChevronRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </div>
        )}

        {stage === ResetStage.EnterOTP && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">OTP Code</Label>
              <div className="flex justify-center my-4">
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              {errors.otp && <p className="text-sm text-red-500 text-center">{errors.otp}</p>}
            </div>

            <Button 
              type="button" 
              className="w-full" 
              onClick={handleVerifyOTP}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Verify Code
                  <ChevronRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </div>
        )}

        {stage === ResetStage.NewPassword && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Enter new password" 
                  className={`pl-10 ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button"
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="confirmPassword" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Confirm new password" 
                  className={`pl-10 ${errors.confirmPassword ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
            </div>

            <Button 
              type="button" 
              className="w-full" 
              onClick={handleResetPassword}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Resetting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Reset Password
                  <ChevronRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </div>
        )}

        {stage === ResetStage.Success && (
          <div className="flex flex-col items-center justify-center py-4">
            <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-3 mb-4">
              <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <p className="text-center text-muted-foreground mb-6">
              Your password has been successfully reset. You can now sign in with your new password.
            </p>
            <Button type="button" onClick={onBack}>
              Return to Sign In
            </Button>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        {stage !== ResetStage.Success && (
          <Button 
            variant="ghost" 
            type="button" 
            onClick={() => {
              if (stage === ResetStage.EnterEmail) {
                onBack();
              } else {
                setStage(prev => prev - 1);
              }
            }}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            {stage === ResetStage.EnterEmail ? "Back to Sign In" : "Back"}
          </Button>
        )}
        {(stage === ResetStage.EnterEmail || stage === ResetStage.EnterOTP) && (
          <Button 
            variant="link" 
            type="button" 
            className="ml-auto"
            onClick={handleSendResetEmail}
            disabled={isLoading}
          >
            Resend code
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ForgotPasswordForm;
