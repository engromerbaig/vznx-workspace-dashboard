// src/components/ui/AuthLoader.tsx
'use client';

export default function AuthLoader() {
  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="w-15 h-5 relative">
        <div className="absolute inset-0 flex space-x-1">
          <div className="w-1/3 h-full bg-black rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-1/3 h-full bg-black rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-1/3 h-full bg-black rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
}