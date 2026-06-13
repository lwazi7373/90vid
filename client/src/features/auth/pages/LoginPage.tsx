import { useState } from 'react';
import { Eye, EyeOff, User, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoginPending } = useAuth();

  const [userName, setUserName] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);

  const successMessage = location.state?.message ?? null;

  const handleSubmit = async () => {
    setInlineError(null);
    try {
      await login({ userName, userPassword });
      navigate('/rooms');
    } catch (error: any) {
      setInlineError(error.userMessage ?? 'Login failed. Please try again.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="min-h-screen bg-[#0d0e13] flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#4F8EF7]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-[#1A1B21] rounded-2xl border border-[#424753]/20 shadow-[0_32px_64px_rgba(0,0,0,0.6)] p-8">

          {/* Header */}
          <div className="mb-10 text-center">
            <h1 className="font-['Manrope'] text-3xl font-extrabold tracking-tight text-[#e3e1e9] mb-2">
              The Vault
            </h1>
            <p className="text-sm text-[#9497a1]">
              Sign in to access your archive
            </p>
          </div>

          {/* Success message */}
          {successMessage && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm font-medium text-emerald-400 text-center">
              {successMessage}
            </div>
          )}

          {/* Error message */}
          {inlineError && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-[#ffb4ab]/10 border border-[#ffb4ab]/20 text-sm font-medium text-[#ffb4ab] text-center">
              {inlineError}
            </div>
          )}

          <div className="space-y-4">
            {/* Username */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#4F8EF7]">
                Username
              </label>
              <div className="relative">
                <User
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9497a1] pointer-events-none"
                />
                <input
                  type="text"
                  placeholder="e.g. TonyStart"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoginPending}
                  className="w-full bg-[#0d0e13] border border-[#424753]/30 rounded-xl px-4 py-3 pl-9 text-sm text-[#e3e1e9] placeholder:text-[#9497a1]/50 focus:outline-none focus:border-[#4F8EF7]/50 focus:ring-1 focus:ring-[#4F8EF7]/20 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#4F8EF7]">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9497a1] pointer-events-none"
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoginPending}
                  className="w-full bg-[#0d0e13] border border-[#424753]/30 rounded-xl px-4 py-3 pl-9 pr-10 text-sm text-[#e3e1e9] placeholder:text-[#9497a1]/50 focus:outline-none focus:border-[#4F8EF7]/50 focus:ring-1 focus:ring-[#4F8EF7]/20 transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9497a1] hover:text-[#e3e1e9] transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoginPending || !userName.trim() || !userPassword.trim()}
              className="w-full mt-4 py-3 rounded-xl font-bold text-sm bg-[#4F8EF7] text-white hover:bg-[#6ba3f9] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isLoginPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>

          {/* Register link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-[#9497a1]">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-semibold text-[#acc7ff] hover:text-[#4F8EF7] transition-colors"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom label */}
        <p className="text-center text-[10px] uppercase tracking-[0.2em] text-[#424753] font-bold mt-6">
          Digital Curator · Encrypted Archive
        </p>
      </div>
    </div>
  );
};

export default LoginPage;