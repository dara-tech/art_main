import { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { RiEyeLine, RiEyeOffLine, RiLockPasswordLine, RiUser3Line } from '@remixicon/react';
import { useAuth } from '../contexts/AuthContext';

const labelClass = 'text-xs font-medium leading-tight text-foreground/80';

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
    <div className="flex min-h-screen flex-col justify-center bg-card px-3 py-6 sm:px-4">
      <div className="mx-auto w-full max-w-sm overflow-hidden border border-border/80 bg-card shadow-xl shadow-black/8">
        <div className="h-1.5 w-full bg-primary" />
        <div className="border-b border-border/80 bg-muted/70 px-4 py-4 text-center">
          <h1 className="text-lg font-bold tracking-tight text-foreground">ART Reporting Portal</h1>
          <p className="mt-1 text-xs leading-snug text-muted-foreground">Sign in to continue to the report portal</p>
        </div>

        <form className="grid gap-4 p-4 sm:p-5" onSubmit={handleLogin}>
          <div className="grid gap-2">
            <span className={labelClass}>Username</span>
            <div className="relative">
              <RiUser3Line className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground/50" />
              <input
                id="login-username"
                autoFocus
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                autoComplete="username"
                required
                className="h-10 w-full rounded-none border border-border/80 bg-background pl-10 pr-3 text-sm shadow-sm outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/30"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <span className={labelClass}>Password</span>
            <div className="relative">
              <RiLockPasswordLine className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground/50" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete="current-password"
                required
                className="h-10 w-full rounded-none border border-border/80 bg-background py-0 pl-10 pr-10 text-sm shadow-sm outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/30"
              />
              <button
                type="button"
                className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center text-muted-foreground transition hover:text-foreground"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
              >
                {showPassword ? <RiEyeOffLine className="size-4" /> : <RiEyeLine className="size-4" />}
              </button>
            </div>
          </div>

          <div className="-mx-4 -mb-4 mt-1 flex flex-col gap-2 border-t border-border/80 bg-muted/25 px-4 py-4 sm:-mx-5 sm:-mb-5 sm:px-5">
            <Button
              type="submit"
              disabled={loading}
              className="h-10 min-h-10 w-full rounded-none bg-primary text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-95 active:translate-y-0"
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
