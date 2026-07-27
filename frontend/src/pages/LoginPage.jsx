import { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  RiEyeLine,
  RiEyeOffLine,
  RiLockPasswordLine,
  RiUser3Line,
  RiPulseLine,
  RiInformationLine,
} from '@remixicon/react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState(() => localStorage.getItem('art_remembered_user') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem('art_remembered_user'));
  const [loading, setLoading] = useState(false);
  const [isCapsLock, setIsCapsLock] = useState(false);

  const checkCapsLock = (e) => {
    if (e.getModifierState) {
      setIsCapsLock(e.getModifierState('CapsLock'));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      toast.error('Please enter both username and password');
      return;
    }
    setLoading(true);
    try {
      await login({ username, password });
      if (rememberMe) {
        localStorage.setItem('art_remembered_user', username);
      } else {
        localStorage.removeItem('art_remembered_user');
      }
      toast.success('Welcome back!');
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative flex min-h-screen w-full items-center justify-center bg-background p-4 sm:p-6 bg-repeat"
      style={{
        backgroundImage: 'url(/khmer_pattern.png)',
        backgroundSize: '420px',
      }}
    >
      {/* Soft overlay tint for contrast & readability */}
      <div className="absolute inset-0 bg-background/85 backdrop-blur-[1px]" />

      <div className="relative z-10 w-full max-w-sm">
        {/* Header Branding */}
        <div className="mb-6 flex flex-col items-center text-center">
          <img
            src="/logo.png"
            alt="ART Reporting Portal Logo"
            className="mb-4 h-20 sm:h-24 w-auto rounded-none object-contain drop-shadow-xs"
          />
          <h1 className="text-xl font-bold tracking-tight text-foreground">ART Reporting Portal</h1>
          <p className="mt-1 text-xs font-medium text-muted-foreground">Sign in to access your clinical dashboard</p>
        </div>

        {/* Form Card */}
        <div className="rounded-xl border border-border/80 bg-card/95 p-6 shadow-md backdrop-blur-md">
          <form className="space-y-4" onSubmit={handleLogin}>
            {/* Username Field */}
            <div className="space-y-1.5">
              <label htmlFor="login-username" className="block text-xs font-medium text-foreground">
                Username
              </label>
              <div className="relative">
                <RiUser3Line className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
                <input
                  id="login-username"
                  autoFocus={!username}
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  autoComplete="username"
                  required
                  className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm text-foreground shadow-xs placeholder:text-muted-foreground/50 transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label htmlFor="login-password" className="block text-xs font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <RiLockPasswordLine className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={checkCapsLock}
                  onKeyUp={checkCapsLock}
                  placeholder="Password"
                  autoComplete="current-password"
                  required
                  className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-9 text-sm text-foreground shadow-xs placeholder:text-muted-foreground/50 transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <button
                  type="button"
                  className="absolute right-0 top-0 flex h-9 w-9 items-center justify-center text-muted-foreground/70 hover:text-foreground"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <RiEyeOffLine className="size-4" /> : <RiEyeLine className="size-4" />}
                </button>
              </div>

              {/* CapsLock Warning */}
              {isCapsLock && (
                <div className="flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                  <RiInformationLine className="size-3.5" />
                  <span>Caps Lock is active</span>
                </div>
              )}
            </div>

            {/* Remember Username */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="size-3.5 rounded border-input bg-background text-primary focus:ring-1 focus:ring-primary/50"
                />
                <span>Remember username</span>
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="h-9 w-full rounded-md bg-primary text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="size-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </div>

        {/* Footer Note */}
        <p className="mt-4 text-center text-[11px] text-muted-foreground/70">
          Admin-provided account • Contact IT helpdesk for access reset
        </p>
      </div>
    </div>
  );
}


