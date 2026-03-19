import { useState } from 'react';
import { Eye, EyeOff, User, Lock, ArrowRight } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoginPending } = useAuth();

  const [userName, setUserName] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState<'username' | 'password' | null>(null);
  const [inlineError, setInlineError] = useState<string | null>(null);

  // Picks up the success message passed from RegisterPage on navigation
  const successMessage = location.state?.message ?? null;

  const handleSubmit = async () => {
    setInlineError(null);
    try {
      await login({ userName, userPassword });
      navigate('/dashboard');
    } catch (error: any) {
      setInlineError(error.userMessage ?? 'Login failed. Please try again.');
    }
  };

  const colors = {
    phantom: '#ebebef',
    umbra: '#606260',
    midnight: '#2c2d2d',
  };

  const neumorphicShadow = {
    light: '#ffffff',
    dark: '#a3a3a3',
  };

  const getFieldStyle = (fieldName: 'username' | 'password') => ({
    backgroundColor: colors.phantom,
    boxShadow: isFocused === fieldName
      ? `inset 8px 8px 16px ${neumorphicShadow.dark}, inset -8px -8px 16px ${neumorphicShadow.light}`
      : `8px 8px 16px ${neumorphicShadow.dark}, -8px -8px 16px ${neumorphicShadow.light}`,
  });

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: colors.phantom }}
    >
      <div
        className="w-full max-w-md p-8 rounded-3xl"
        style={{
          backgroundColor: colors.phantom,
          boxShadow: `20px 20px 60px ${neumorphicShadow.dark}, -20px -20px 60px ${neumorphicShadow.light}`,
        }}
      >
        {/* Header */}
        <div className="mb-10 text-center">
          <h1
            className="text-3xl font-bold mb-2 tracking-wide"
            style={{ color: colors.midnight }}
          >
            Welcome Back
          </h1>
          <p className="text-sm" style={{ color: colors.umbra }}>
            Sign in to your account
          </p>
        </div>

        {/* Success message from registration */}
        {successMessage && (
          <div
            className="mb-6 px-5 py-3 rounded-2xl text-sm font-medium text-center"
            style={{
              backgroundColor: colors.phantom,
              color: '#27ae60',
              boxShadow: `inset 4px 4px 8px ${neumorphicShadow.dark}, inset -4px -4px 8px ${neumorphicShadow.light}`,
            }}
          >
            {successMessage}
          </div>
        )}

        {/* Inline Error */}
        {inlineError && (
          <div
            className="mb-6 px-5 py-3 rounded-2xl text-sm font-medium text-center"
            style={{
              backgroundColor: colors.phantom,
              color: '#c0392b',
              boxShadow: `inset 4px 4px 8px ${neumorphicShadow.dark}, inset -4px -4px 8px ${neumorphicShadow.light}`,
            }}
          >
            {inlineError}
          </div>
        )}

        <div className="space-y-8">
          {/* Username Field */}
          <div
            className="flex items-center px-6 py-4 rounded-2xl transition-all duration-300"
            style={getFieldStyle('username')}
          >
            <User size={20} style={{ color: colors.umbra, marginRight: '12px' }} />
            <input
              type="text"
              placeholder="Username"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              onFocus={() => setIsFocused('username')}
              onBlur={() => setIsFocused(null)}
              className="w-full bg-transparent outline-none text-sm font-medium"
              style={{ color: colors.midnight }}
              disabled={isLoginPending}
            />
          </div>

          {/* Password Field */}
          <div
            className="flex items-center px-6 py-4 rounded-2xl transition-all duration-300"
            style={getFieldStyle('password')}
          >
            <Lock size={20} style={{ color: colors.umbra, marginRight: '12px' }} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={userPassword}
              onChange={(e) => setUserPassword(e.target.value)}
              onFocus={() => setIsFocused('password')}
              onBlur={() => setIsFocused(null)}
              className="w-full bg-transparent outline-none text-sm font-medium"
              style={{ color: colors.midnight }}
              disabled={isLoginPending}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="ml-2 focus:outline-none transition-transform duration-200 hover:scale-110"
              style={{ color: colors.umbra }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoginPending}
            className="w-full py-4 rounded-2xl font-semibold text-sm tracking-wide transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] mt-10 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{
              backgroundColor: colors.phantom,
              color: colors.midnight,
              boxShadow: `6px 6px 12px ${neumorphicShadow.dark}, -6px -6px 12px ${neumorphicShadow.light}`,
            }}
            onMouseDown={(e) => {
              if (!isLoginPending)
                e.currentTarget.style.boxShadow = `inset 6px 6px 12px ${neumorphicShadow.dark}, inset -6px -6px 12px ${neumorphicShadow.light}`;
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.boxShadow = `6px 6px 12px ${neumorphicShadow.dark}, -6px -6px 12px ${neumorphicShadow.light}`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = `6px 6px 12px ${neumorphicShadow.dark}, -6px -6px 12px ${neumorphicShadow.light}`;
            }}
          >
            <span className="flex items-center justify-center gap-2">
              {isLoginPending ? 'Signing In...' : (
                <>
                  Sign In
                  <ArrowRight size={18} />
                </>
              )}
            </span>
          </button>
        </div>

        {/* Register Link */}
        <div className="mt-8 text-center">
          <p className="text-sm" style={{ color: colors.umbra }}>
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold hover:underline transition-all"
              style={{ color: colors.midnight }}
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;