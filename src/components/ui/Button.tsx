import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost' | 'outline' | 'pill';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold transition-all focus:outline-none focus:ring-1 focus:ring-[#E50914] disabled:opacity-50 disabled:pointer-events-none select-none active:scale-[0.98]';

    const variants = {
      primary: 'bg-[#E50914] hover:bg-[#C11119] text-white shadow-none rounded-lg',
      secondary: 'bg-[#1A1A1A] hover:bg-[#242424] text-[#FFFFFF] border border-[#282828] rounded-lg',
      destructive: 'bg-[#7F1D1D] hover:bg-[#991B1B] text-white border border-[#991B1B] rounded-lg',
      ghost: 'bg-transparent hover:bg-[#1A1A1A] text-[#AAAAAA] hover:text-[#FFFFFF] rounded-lg',
      outline: 'bg-transparent border border-[#242424] hover:bg-[#141414] text-[#FFFFFF] rounded-lg',
      pill: 'bg-[#1A1A1A] hover:bg-[#242424] text-[#AAAAAA] hover:text-[#FFFFFF] border border-[#242424] rounded-full',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 h-8 gap-1.5',
      md: 'text-xs sm:text-sm px-4 py-2 h-9 gap-2',
      lg: 'text-sm sm:text-base px-5 py-2.5 h-11 gap-2.5',
      icon: 'h-9 w-9 p-0 rounded-lg',
    };

    return (
      <button
        ref={ref}
        className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
