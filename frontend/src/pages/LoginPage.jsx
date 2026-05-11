import { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { RiEyeLine, RiEyeOffLine, RiLockPasswordLine, RiUser3Line } from '@remixicon/react';
import { useAuth } from '../contexts/AuthContext';

const labelClass = 'text-xs leading-tight text-muted-foreground';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen bg-background flex flex-col justify-center px-3 py-6 sm:px-4">
      <div className="mx-auto w-full max-w-sm overflow-hidden border border-border bg-card">
        <div className="border-b border-border bg-muted px-3 py-2.5 text-center sm:px-4">
          <h1 className="text-base font-bold tracking-tight text-foreground sm:text-lg">ចូលប្រើប្រាស់</h1>
          <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">Sign in · report portal</p>
        </div>

        <form className="grid gap-3 p-3 sm:p-4" onSubmit={handleLogin}>
          <div className="grid gap-1.5">
            <span className={labelClass}>Username</span>
            <div className="relative">
              <RiUser3Line className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                id="login-username"
                autoFocus
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                autoComplete="username"
                required
                className="h-9 w-full rounded-none border border-input bg-background pl-9 pr-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <span className={labelClass}>Password</span>
            <div className="relative">
              <RiLockPasswordLine className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete="current-password"
                required
                className="h-9 w-full rounded-none border border-input bg-background py-0 pl-9 pr-9 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
              />
              <button
                type="button"
                className="absolute right-0 top-0 flex h-9 w-9 items-center justify-center text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
              >
                {showPassword ? <RiEyeOffLine className="size-4" /> : <RiEyeLine className="size-4" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-border bg-muted/20 -mx-3 -mb-3 mt-1 px-3 py-3 sm:-mx-4 sm:-mb-4 sm:px-4">
            <Button
              type="submit"
              disabled={loading}
              className="h-9 min-h-9 w-full rounded-none bg-primary text-sm font-semibold text-primary-foreground hover:opacity-90 active:translate-y-0"
            >
              {loading ? 'Signing in…' : 'Continue'}
            </Button>
            <p className="text-center text-[11px] leading-snug text-muted-foreground">
              Admin-provided account. Sign out on shared devices.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
