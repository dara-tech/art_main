import { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RiLockPasswordLine, RiUser3Line } from '@remixicon/react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ username, password });
      toast.success('Welcome!');
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4">
      <div className="mx-auto flex min-h-screen w-full max-w-md items-center justify-center">
        <form className="grid w-full gap-4 rounded-none border border-border bg-card p-6 shadow-sm" onSubmit={handleLogin}>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Sign in</h1>
            <p className="text-sm text-muted-foreground">Use your account to access reports.</p>
          </div>

          <div className="relative">
            <RiUser3Line className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              autoComplete="username"
              className="h-11 rounded-none bg-background pl-10"
            />
          </div>

          <div className="relative">
            <RiLockPasswordLine className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="current-password"
              className="h-11 rounded-none bg-background pl-10"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="h-11 rounded-none bg-primary text-primary-foreground transition-none hover:bg-primary active:translate-y-0"
          >
            {loading ? 'Signing in...' : 'Continue'}
          </Button>
        </form>
      </div>
    </div>
  );
}
