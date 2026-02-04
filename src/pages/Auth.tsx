import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Mail, Lock, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [validatingUsername, setValidatingUsername] = useState(false);
  
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
