'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'max-w-lg',
  size,
}: ModalProps) {
  const resolvedMaxWidth = size
    ? size === 'sm'
      ? 'max-w-md'
      : size === 'md'
      ? 'max-w-lg'
      : size === 'lg'
      ? 'max-w-2xl'
      : 'max-w-4xl'
    : maxWidth;
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-none animate-fadeIn">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative w-full ${resolvedMaxWidth} bg-[#141414] border border-[#282828] rounded-2xl shadow-2xl p-5 sm:p-6 z-10 max-h-[90vh] flex flex-col`}
      >
        <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-[#202020]">
          <div>
            {title && (
              <h2 className="font-heading font-bold text-base sm:text-lg text-[#FFFFFF]">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-xs text-[#AAAAAA] mt-0.5">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-[#777777] hover:text-[#FFFFFF] p-1.5 rounded-lg hover:bg-[#1A1A1A] transition-colors"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 pr-1">{children}</div>
      </div>
    </div>
  );
}
