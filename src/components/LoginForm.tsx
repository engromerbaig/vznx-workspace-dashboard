'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaSignInAlt, FaUserClock } from 'react-icons/fa';
import { useUser } from '@/context/UserContext';
import InputField from '@/components/InputField';
import PrimaryButton from '@/components/PrimaryButton';
import { AUTH_CONFIG } from '@/lib/auth-config';
import { toast } from '@/components/ToastProvider';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { setUser } = useUser();

  // Load remember me preference on component mount
  useEffect(() => {
    const rememberMeCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${AUTH_CONFIG.REMEMBER_ME.COOKIE_NAME}=`));
    
    if (rememberMeCookie) {
      const value = rememberMeCookie.split('=')[1];
      setRememberMe(value === 'true');
    }
  }, []);

// Update the success handler in your LoginForm component
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (isSubmitting) return;
  
  setIsSubmitting(true);

  if (!email || !password) {
    toast.error('Email and password are required');
    setIsSubmitting(false);
    return;
  }

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email: email.trim(), 
        password, 
        rememberMe 
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.message || `Login failed: ${res.status}`);
      setIsSubmitting(false);
      return;
    }

    if (data.status !== 'success') {
      toast.error(data.message || 'Login failed');
      setIsSubmitting(false);
      return;
    }

    // Set user context
    setUser(data.user);
    
    // Show appropriate message based on session takeover
    if (data.sessionTakeover) {
      toast.success('Login successful! Previous session has been terminated for security.');
    } else {
      toast.success(`Login successful! ${rememberMe ? 'You will stay logged in for 7 days.' : 'Session expires after 30 minutes of inactivity.'}`);
    }

    // Redirect based on role
    setTimeout(() => {
      if (data.user.role === 'superadmin') {
        router.push('/superadmin');
      } else {
        router.push('/dashboard');
      }
    }, 100);

  } catch (error) {
    console.error('Login network error:', error);
    toast.error('Network error. Please check your connection and try again.');
    setIsSubmitting(false);
  }
};

  return (
    <div className={`w-full max-w-md space-y-6 ${isSubmitting ? 'pointer-events-none opacity-50' : ''}`}>
      <form onSubmit={handleLogin} className="space-y-5">
        <InputField
          label="Email or Username"
          type="text"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email or username"
          disabled={isSubmitting}
        />

        <InputField
          label="Password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          disabled={isSubmitting}
          isPassword
        />

        {/* Remember Me Checkbox */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            disabled={isSubmitting}
            className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
          />
          <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
            Remember me for 7 days
          </label>
        </div>

        {/* Session Info */}
        <div className="text-xs text-gray-500 text-center p-3 bg-gray-50 rounded-lg">
          {rememberMe ? (
            <div className="flex items-center justify-center gap-2">
              <FaUserClock className="text-green-600" />
              <span>You will stay logged in for 7 days on this device</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <FaUserClock className="text-blue-600" />
              <span>Session expires after {AUTH_CONFIG.INACTIVITY_TIMEOUT} minutes of inactivity</span>
            </div>
          )}
        </div>

        <PrimaryButton
          type="submit"
          disabled={isSubmitting}
          isLoading={isSubmitting}
          loadingText="Signing in..."
          className="w-full"
          showIcon={!isSubmitting}
          icon={FaSignInAlt}
          iconPosition="left"
        >
          Sign In
        </PrimaryButton>
      </form>
    </div>
  );
}