// app/not-found.tsx
'use client';

import Link from 'next/link';
import { FaHome } from 'react-icons/fa';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800 font-poppins">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <h2 className="text-2xl mb-6">Page Not Found</h2>
      <p className="text-lg mb-8">Sorry, the page you are looking for does not exist.</p>
      <Link
        href="/dashboard"
        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors"
      >
        <FaHome />
        Back to Dashboard
      </Link>
    </div>
  );
}