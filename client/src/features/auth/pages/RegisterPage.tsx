import { useState } from 'react';
import { Eye, EyeOff, User, Lock, Mail, Phone } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isRegisterPending } = useAuth();

  const [userName, setUserName] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [contactNo, setContactNo] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [inlineError, setInlineError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setInlineError(null);
    try {
      await register({ userName, userPassword, emailAddress, contactNo });
      navigate('/login', {
        state: { message: 'Account created successfully. Please sign in.' }
      });
    } catch (error: any) {
      setInlineError(error.userMessage ?? 'Registration failed. Please try again.');
    }
  };

  const colors = {
    phantom: '#ebebef',
    eclipse: '#d3d2d0',
    umbra: '#606260',
    midnight: '#2c2d2d',
  };

  const neumorphicShadow = {
    light: '#ffffff',
    dark: '#a3a3a3',
  };

  const inputClass = `w-full bg-transparent outline-none text-sm font-medium transition-colors duration-300`;

  const getContainerStyle = (fieldName: string) => ({
    backgroundColor: colors.phantom,
    boxShadow: focusedField === fieldName
      ? `inset 8px 8px 16px ${neumorphicShadow.dark}, inset -8px -8px 16px ${neumorphicShadow.light}`
      : `8px 8px 16px ${neumorphicShadow.dark}, -8px -8px 16px ${neumorphicShadow.light}`,
  });

  const containerClass = `flex items-center px-6 py-4 rounded-2xl transition-all duration-300`;

  const fields = [
    {
      name: 'username',
      icon: <User size={20} style={{ color: colors.umbra, marginRight: '12px' }} />,
      type: 'text',
      placeholder: 'Username',
      value: userName,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setUserName(e.target.value),
    },
    {
      name: 'email',
      icon: <Mail size={20} style={{ color: colors.umbra, marginRight: '12px' }} />,
      type: 'email',
      placeholder: 'Email Address',
      value: emailAddress,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setEmailAddress(e.target.value),
    },
    {
      name: 'contact',
      icon: <Phone size={20} style={{ color: colors.umbra, marginRight: '12px' }} />,
      type: 'tel',
      placeholder: 'Contact Number',
      value: contactNo,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setContactNo(e.target.value),
    },
  ];

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
            Create Account
          </h1>
          <p className="text-sm" style={{ color: colors.umbra }}>
            Register your details below
          </p>
        </div>

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

        <div className="space-y-6">
          {/* Text Fields */}
          {fields.map((field) => (
            <div key={field.name} className="relative">
              <div
                className={containerClass}
                style={getContainerStyle(field.name)}
              >
                {field.icon}
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={field.value}
                  onChange={field.onChange}
                  onFocus={() => setFocusedField(field.name)}
                  onBlur={() => setFocusedField(null)}
                  className={inputClass}
                  style={{ color: colors.midnight }}
                  disabled={isRegisterPending}
                />
              </div>
            </div>
          ))}

          {/* Password Field */}
          <div className="relative">
            <div
              className={containerClass}
              style={getContainerStyle('password')}
            >
              <Lock size={20} style={{ color: colors.umbra, marginRight: '12px' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                className={inputClass}
                style={{ color: colors.midnight }}
                disabled={isRegisterPending}
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
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isRegisterPending}
            className="w-full py-4 rounded-2xl font-semibold text-sm tracking-wide transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] mt-8 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{
              backgroundColor: colors.phantom,
              color: colors.midnight,
              boxShadow: `6px 6px 12px ${neumorphicShadow.dark}, -6px -6px 12px ${neumorphicShadow.light}`,
            }}
            onMouseDown={(e) => {
              if (!isRegisterPending)
                e.currentTarget.style.boxShadow = `inset 6px 6px 12px ${neumorphicShadow.dark}, inset -6px -6px 12px ${neumorphicShadow.light}`;
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.boxShadow = `6px 6px 12px ${neumorphicShadow.dark}, -6px -6px 12px ${neumorphicShadow.light}`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = `6px 6px 12px ${neumorphicShadow.dark}, -6px -6px 12px ${neumorphicShadow.light}`;
            }}
          >
            {isRegisterPending ? 'Creating Account...' : 'Register Account'}
          </button>
        </div>

        {/* Login Link */}
        <div className="mt-8 text-center">
          <p className="text-sm" style={{ color: colors.umbra }}>
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold hover:underline transition-all"
              style={{ color: colors.midnight }}
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;