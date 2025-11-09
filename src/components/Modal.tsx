'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { IoIosCloseCircleOutline } from 'react-icons/io';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null);

  // Handle ESC key close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Lock scroll when modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose(); // ✅ close on outside click
      }}
    >
      <div
        className="relative bg-neutral-900 text-white rounded-xl shadow-2xl p-6 w-full max-w-2xl border border-neutral-700"
        onClick={(e) => e.stopPropagation()} // prevent close when clicking inside modal
      >
        {/* Close Button (Top-Right) */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white hover:text-white/80 cursor-pointer transition-transform duration-200 text-3xl"
          aria-label="Close modal"
        >
          <IoIosCloseCircleOutline />
        </button>

        {children}
      </div>
    </div>
  );
}
