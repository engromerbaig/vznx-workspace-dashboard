// src/app/unauthorized/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import PrimaryButton from '@/components/PrimaryButton';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-xl w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <span className="text-2xl">🚫</span>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Access Denied
        </h1>
        
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page. 
          Please contact your administrator if you believe this is an error.
        </p>

        <div className="flex gap-3">
          <PrimaryButton
            onClick={() => router.back()}
            bgColor="bg-gray-100"
            textColor="text-gray-700"
            hoverColor="bg-gray-200"
            className="flex-1"
          >
            Go Back
          </PrimaryButton>
          <PrimaryButton
            onClick={() => router.push('/dashboard')}
            bgColor="bg-primary"
            hoverColor="bg-primary/90"
            className="flex-1"
          >
            Go to Dashboard
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}