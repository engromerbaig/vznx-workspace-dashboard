'use client';

import Image from 'next/image';
import LoginForm from '@/components/LoginForm';
import Heading from '@/components/Heading'; // Your new Heading component
import { companyInfo } from '@/data/companyInfo';

export default function LoginPage() {
  return (
    <main className="min-h-screen flex bg-background">
      {/* Left Section - Brand/Message */}
      <div className="hidden lg:flex lg:flex-1 items-center justify-center p-12 bg-secondary">
        <div className="max-w-md text-center">
          <Heading 
            title="Cut the chaos build the future"
            titleColor="text-black"
            titleSize="text-5xl"
            titleWeight="font-bold"
            titleAlign="text-left"
            titleLineHeight="1.1"
            className="mb-8"
          />
          {/* You can add a BodyText component here later if needed */}
          <p className="text-black/80 text-lg text-left leading-relaxed">
            Streamline your operations and focus on what matters most - building the future of your business.
          </p>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-foreground">
        <div className="w-full max-w-md">
          {/* Logo and Welcome */}
          <div className="flex flex-col items-center gap-y-6 mb-8">
            <Image
              src="/logo2.png"
              alt={companyInfo.name}
              width={220}
              height={80}
              className="object-contain"
              priority
            />
            <div className="text-center">
              <Heading 
                title={`Welcome to ${process.env.NEXT_PUBLIC_APP_NAME}`}
                titleColor="text-white"
                titleSize="text-2xl"
                titleWeight="font-bold"
                titleAlign="text-center"
                className="mb-2"
              />
              <p className="text-gray-300">Sign in to your account to continue</p>
            </div>
          </div>

          {/* Login Form */}
          <LoginForm />
        </div>
      </div>
    </main>
  );
}