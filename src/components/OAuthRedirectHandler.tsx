
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import { Loader2 } from 'lucide-react';

const OAuthRedirectHandler = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleOAuthRedirect = async () => {
      try {
        // Handle the OAuth session (create profile if needed)
        const { error } = await authService.handleOAuthSession();
        
        if (error) {
          setError(error.message);
          setTimeout(() => navigate('/'), 3000);
          return;
        }
        
        // Get user profile to determine redirect path
        const { data: profile } = await authService.getCurrentUserProfile();
        
        if (profile?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } catch (err) {
        console.error('Error handling OAuth redirect:', err);
        setError('An unexpected error occurred');
        setTimeout(() => navigate('/'), 3000);
      }
    };

    handleOAuthRedirect();
  }, [navigate]);

  return (
    <div className="h-screen flex flex-col items-center justify-center p-4">
      {error ? (
        <div className="text-center">
          <p className="text-destructive text-lg font-medium mb-2">Authentication Error</p>
          <p className="text-muted-foreground mb-4">{error}</p>
          <p className="text-sm">Redirecting to login page...</p>
        </div>
      ) : (
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg font-medium mb-1">Completing authentication...</p>
          <p className="text-muted-foreground">Please wait while we set up your account</p>
        </div>
      )}
    </div>
  );
};

export default OAuthRedirectHandler;
