// src/components/InactivityModal.tsx
'use client';

import { useEffect } from 'react';
import { getWarningCountdown } from '@/lib/auth-config';
import PrimaryButton from '@/components/PrimaryButton';
import { useLogout } from '@/context/LogoutContext'; // Add this import

interface InactivityModalProps {
  isOpen: boolean;
  countdown: number;
  onExtend: () => void;
}

export default function InactivityModal({
  isOpen,
  countdown,
  onExtend,
}: InactivityModalProps) {
  const { handleGlobalLogout } = useLogout(); // Use global logout

  // Auto logout when countdown reaches 0
  useEffect(() => {
    if (countdown === 0 && isOpen) {
      handleGlobalLogout(); // Use global logout handler
    }
  }, [countdown, isOpen, handleGlobalLogout]);

  if (!isOpen) return null;

  const warningCountdown = getWarningCountdown();
  const progress = (countdown / warningCountdown) * 100;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  // For clockwise animation starting from top
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-gray-100">
        <div className="text-center">
          {/* Circular Timer with clockwise animation */}
          <div className="relative w-32 h-32 mx-auto mb-6">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              {/* Background circle - thinner stroke */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="#f3f4f6"
                strokeWidth="4"
                fill="none"
              />
              {/* Progress circle - clockwise animation with thinner stroke */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="url(#blueGradient)"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-out"
                transform="rotate(-90 50 50)" // Start from top position
              />
              {/* Blue color gradient definition */}
              <defs>
                <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#04A8F6" />
                  <stop offset="50%" stopColor="#04A8F6" />
                  <stop offset="100%" stopColor="#0284C7" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Countdown text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-gray-900">
                {countdown}
              </span>
              <span className="text-sm text-gray-500 mt-1">seconds</span>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Session About to Expire
          </h2>
          
          <p className="text-gray-600 mb-8 text-lg">
            You&apos;ve been inactive for a while. Would you like to continue your session?
          </p>

          {/* Helper text */}
          <div className="mb-8 p-3 bg-primary/10 rounded-lg border border-primary">
            <p className="text-sm text-primary/90 flex items-center justify-center gap-2">
              <span className="text-primary">💡</span>
              Press any key or click anywhere to stay signed in
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <PrimaryButton
              onClick={handleGlobalLogout} // Use global logout handler
              bgColor="bg-gray-100"
              textColor="text-gray-700"
              hoverColor="bg-gray-200"
              hoverTextColor="text-gray-800"
              border={true}
              borderColor="border-gray-300"
              hoverBorderColor="border-gray-400"
              rounded="rounded-xl"
              shadow={true}
              className="flex-1 py-3"
            >
              Log Out
            </PrimaryButton>
            <PrimaryButton
              onClick={onExtend}
              bgColor="bg-primary"
              hoverColor="bg-primary/90"
              rounded="rounded-xl"
              shadow={true}
              className="flex-1 py-3"
              showIcon={true}
              iconPosition="right"
            >
              Stay Signed In
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}