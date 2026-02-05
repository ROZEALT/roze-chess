import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Mail, Lock, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
 import { lovable } from '@/integrations/lovable';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [validatingUsername, setValidatingUsername] = useState(false);
   const [googleLoading, setGoogleLoading] = useState(false);
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const validateUsername = async (name: string): Promise<{ valid: boolean; reason?: string }> => {
    try {
      const { data, error } = await supabase.functions.invoke('moderate-username', {
        body: { username: name }
      });
      
      if (error) {
        console.error('Moderation error:', error);
        return { valid: true }; // Allow if moderation fails
      }
      
      return { 
        valid: data.isAppropriate === true,
        reason: data.reason
      };
    } catch (err) {
      console.error('Failed to validate username:', err);
      return { valid: true }; // Allow if request fails
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast({ title: 'Welcome back!', description: 'You have successfully logged in.' });
      } else {
        if (!username.trim()) {
          throw new Error('Username is required');
        }
        
        // Validate username for inappropriate content
        setValidatingUsername(true);
        const validation = await validateUsername(username.trim());
        setValidatingUsername(false);
        
        if (!validation.valid) {
          throw new Error(validation.reason || 'This username is not allowed. Please choose a different one.');
        }
        
        const { error } = await signUp(email, password, username);
        if (error) throw error;
        toast({ title: 'Account created!', description: 'Welcome to Vault Chess.' });
      }
      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      setValidatingUsername(false);
    }
  };

   const handleGoogleSignIn = async () => {
     setGoogleLoading(true);
     try {
       const { error } = await lovable.auth.signInWithOAuth('google', {
         redirect_uri: window.location.origin,
       });
       if (error) throw error;
     } catch (error: any) {
       toast({
         title: 'Error',
         description: error.message || 'Failed to sign in with Google',
         variant: 'destructive'
       });
       setGoogleLoading(false);
     }
   };
 
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="chess-card p-8">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg">
              <Crown className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-2xl text-foreground">Vault Chess</h1>
              <p className="text-xs text-muted-foreground">Play • Learn • Compete</p>
            </div>
          </div>

          <h2 className="font-heading font-semibold text-xl text-center mb-6">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  required={!isLogin}
                />
              </div>
            )}
            
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
                minLength={6}
              />
            </div>

            <Button type="submit" variant="glow" className="w-full" disabled={loading || validatingUsername}>
              {validatingUsername ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Checking username...
                </>
              ) : loading ? (
                'Loading...'
              ) : isLogin ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

           <div className="relative my-6">
             <div className="absolute inset-0 flex items-center">
               <span className="w-full border-t border-border" />
             </div>
             <div className="relative flex justify-center text-xs uppercase">
               <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
             </div>
           </div>
 
           <Button
             type="button"
             variant="outline"
             className="w-full"
             onClick={handleGoogleSignIn}
             disabled={googleLoading || loading}
           >
             {googleLoading ? (
               <Loader2 className="w-4 h-4 mr-2 animate-spin" />
             ) : (
               <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                 <path
                   fill="currentColor"
                   d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                 />
                 <path
                   fill="currentColor"
                   d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                 />
                 <path
                   fill="currentColor"
                   d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                 />
                 <path
                   fill="currentColor"
                   d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                 />
               </svg>
             )}
             Continue with Google
           </Button>
 
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-1 text-primary hover:underline font-medium"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
