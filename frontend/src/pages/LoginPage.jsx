import { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  RiEyeLine,
  RiEyeOffLine,
  RiLockPasswordLine,
  RiUser3Line,
  RiInformationLine,
  RiShieldCheckLine
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
    <div className="relative flex min-h-screen w-full items-center justify-center bg-[#070b14] p-4 sm:p-6 overflow-hidden select-none font-sans">
      {/* Background Ambient Radial Glow & Mesh Gradients */}
      <div className="absolute -top-40 -left-40 size-[500px] rounded-full bg-blue-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 size-[500px] rounded-full bg-indigo-600/15 blur-[120px] pointer-events-none" />

      {/* Subtle Geometric Background Grid Lines */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.4) 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}
      />

      <div className="relative z-10 w-full max-w-sm">
        {/* Header Branding with Prominent Official NCHADS Logo */}
        <div className="mb-6 flex flex-col items-center text-center">
          <img
            src="/logo.png"
            alt="NCHADS ART Reporting Portal Logo"
            className="h-24 sm:h-28 w-auto object-contain mb-3"
          />
          <h1 className="text-2xl font-black tracking-tight text-white font-khmer">ART Reporting Portal</h1>
          <p className="mt-1 text-xs font-medium text-slate-400">
            Sign in to access national clinical HIV/ART dashboard
          </p>
        </div>

        {/* Clean Glassmorphic Form Card (Zero Shadows) */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/90 p-6 backdrop-blur-xl">
          <form className="space-y-4" onSubmit={handleLogin}>
            {/* Username Field */}
            <div className="space-y-1.5">
              <label htmlFor="login-username" className="block text-xs font-bold text-slate-300">
                Username
              </label>
              <div className="relative">
                <RiUser3Line className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="login-username"
                  autoFocus={!username}
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  autoComplete="username"
                  required
                  className="h-10 w-full rounded-lg border border-slate-700/80 bg-slate-800/80 pl-10 pr-3.5 text-sm text-white placeholder:text-slate-500 transition-all focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label htmlFor="login-password" className="block text-xs font-bold text-slate-300">
                Password
              </label>
              <div className="relative">
                <RiLockPasswordLine className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={checkCapsLock}
                  onKeyUp={checkCapsLock}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  required
                  className="h-10 w-full rounded-lg border border-slate-700/80 bg-slate-800/80 pl-10 pr-10 text-sm text-white placeholder:text-slate-500 transition-all focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                />
                <button
                  type="button"
                  className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <RiEyeOffLine className="size-4" /> : <RiEyeLine className="size-4" />}
                </button>
              </div>

              {/* CapsLock Warning */}
              {isCapsLock && (
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400 pt-0.5">
                  <RiInformationLine className="size-3.5 shrink-0" />
                  <span>Caps Lock is active</span>
                </div>
              )}
            </div>

            {/* Remember Username */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="size-4 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-1 focus:ring-blue-500/50"
                />
                <span>Remember username</span>
              </label>
            </div>

            {/* Clean Submit Button (Zero Shadow & Zero Icon on Loading) */}
            <Button
              type="submit"
              disabled={loading}
              className="h-10 w-full rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition-all cursor-pointer flex items-center justify-center mt-2"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
        </div>

        {/* Footer Subtext */}
        <div className="mt-6 flex flex-col items-center gap-1.5 text-center text-[11px] text-slate-500 font-medium">
          <div className="flex items-center gap-1 text-slate-400">
            <RiShieldCheckLine className="size-3.5 text-blue-500" />
            <span>NCHADS National Health Information System</span>
          </div>
          <p>Contact IT helpdesk for access reset</p>
        </div>
      </div>
    </div>
  );
}
