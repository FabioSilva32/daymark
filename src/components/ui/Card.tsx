import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Card({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={twMerge(
        clsx(
          'bg-[#141414] border border-[#242424] rounded-xl p-4 transition-colors',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={twMerge(
        clsx('flex items-center justify-between pb-3 mb-3 border-b border-[#1C1C1C]', className)
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={twMerge(
        clsx('font-heading font-bold text-sm text-[#FFFFFF] tracking-tight', className)
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function Badge({
  className,
  variant = 'default',
  children,
}: {
  className?: string;
  variant?: 'default' | 'red' | 'success' | 'warning' | 'muted';
  children: React.ReactNode;
}) {
  const styles = {
    default: 'bg-[#1A1A1A] text-[#AAAAAA] border border-[#282828]',
    red: 'bg-[#E50914] text-[#FFFFFF] font-bold',
    success: 'bg-[#0E261A] text-[#10B981] border border-[#10B981]/30 font-medium',
    warning: 'bg-[#291F0A] text-[#F59E0B] border border-[#F59E0B]/30 font-medium',
    muted: 'bg-[#181818] text-[#8E8E8E] border border-[#242424]',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded',
          styles[variant],
          className
        )
      )}
    >
      {children}
    </span>
  );
}
