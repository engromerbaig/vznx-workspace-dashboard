'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaSignInAlt } from 'react-icons/fa';
import { useUser } from '@/context/UserContext';
import InputField from '@/components/InputField';
import PrimaryButton from '@/components/PrimaryButton';
import { AUTH_CONFIG } from '@/lib/auth-config';
import { toast } from '@/components/ToastProvider';
import { theme } from '@/theme';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { setUser } = useUser();


  // Load remember me + dev auto-fill
  useEffect(() => {
    const rememberMeCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${AUTH_CONFIG.REMEMBER_ME.COOKIE_NAME}=`));
    
    if (rememberMeCookie) {
      const value = rememberMeCookie.split('=')[1];
      setRememberMe(value === 'true');
    }

    if (process.env.NODE_ENV === 'development') {
      setEmail('admin');
      setPassword('admin');
    }
   }, []);

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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: email.trim(), 
        password, 
        rememberMe 
      }),
    });

    const data = await res.json();

    if (!res.ok || data.status !== 'success') {
      toast.error(data.message || 'Login failed');
      setIsSubmitting(false);
      return;
    }

    // Set user in context
    setUser(data.user);

    // 🔥 Save user to localStorage to avoid flicker before /me loads
    localStorage.setItem("vz_user", JSON.stringify(data.user));

    // Same toast messages as before
    if (data.sessionTakeover) {
      toast.success('Login successful! Previous session has been terminated for security.');
    } else {
      toast.success(`Login successful! ${rememberMe ? 'You will stay logged in for 7 days.' : 'Session expires after 30 minutes of inactivity.'}`);
    }

    // Role-based redirect
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

        <PrimaryButton
          type="submit"
          disabled={isSubmitting}
          isLoading={isSubmitting}
          loadingText="Signing in..."
          className="w-full"
          showIcon={!isSubmitting}
          icon={FaSignInAlt}
          iconPosition="left"
          bgColor={theme.gradients.hero}
        >
          Sign In
        </PrimaryButton>
      </form>
    </div>
  );
}