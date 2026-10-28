import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-xs font-semibold text-[#AAAAAA]">
            {label}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          className={twMerge(
            clsx(
              'w-full px-3.5 py-2 text-xs sm:text-sm bg-[#141414] border border-[#242424] text-[#FFFFFF] placeholder-[#777777] rounded-lg transition-colors',
              'focus:border-[#E50914] focus:outline-none',
              error && 'border-[#E50914]',
              className
            )
          )}
          {...props}
        />
        {error && <span className="text-xs text-[#E50914]">{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-xs font-semibold text-[#AAAAAA]">
            {label}
          </label>
        )}
        <textarea
          id={id}
          ref={ref}
          className={twMerge(
            clsx(
              'w-full px-3.5 py-2 text-xs sm:text-sm bg-[#141414] border border-[#242424] text-[#FFFFFF] placeholder-[#777777] rounded-lg transition-colors resize-y min-h-[80px]',
              'focus:border-[#E50914] focus:outline-none',
              error && 'border-[#E50914]',
              className
            )
          )}
          {...props}
        />
        {error && <span className="text-xs text-[#E50914]">{error}</span>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: { value: string | number; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, children, options, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-xs font-semibold text-[#AAAAAA]">
            {label}
          </label>
        )}
        <select
          id={id}
          ref={ref}
          className={twMerge(
            clsx(
              'w-full px-3.5 py-2 text-xs sm:text-sm bg-[#141414] border border-[#242424] text-[#FFFFFF] rounded-lg transition-colors cursor-pointer',
              'focus:border-[#E50914] focus:outline-none',
              error && 'border-[#E50914]',
              className
            )
          )}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#141414] text-[#FFFFFF]">
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {error && <span className="text-xs text-[#E50914]">{error}</span>}
      </div>
    );
  }
);
Select.displayName = 'Select';
