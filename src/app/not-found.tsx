// app/not-found.tsx
'use client';

import Link from 'next/link';
import { FaArrowLeftLong } from "react-icons/fa6";
import PrimaryButton from '@/components/PrimaryButton';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-gray-800">
      <h1 className="text-9xl font-bold mb-4">404</h1>
      <h2 className="text-2xl mb-4">Page Not Found</h2>
      <p className="text-lg mb-6">Sorry, the page you are looking for does not exist.</p>
      
      <PrimaryButton
        to="/dashboard"
        showIcon={true}
        icon={FaArrowLeftLong}
        iconPosition="left"
        className="px-6 py-3"
      >
        Back to Dashboard
      </PrimaryButton>
    </div>
  );
}