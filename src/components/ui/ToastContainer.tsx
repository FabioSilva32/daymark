'use client';

import React from 'react';
import { useDaymark } from '@/context/DaymarkContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useDaymark();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className="pointer-events-auto bg-[#181818] border border-[#282828] shadow-2xl rounded-xl p-3.5 flex items-start gap-3 transition-all"
          >
            <div className="mt-0.5 shrink-0">
              {isSuccess && <CheckCircle2 size={16} className="text-[#10B981]" />}
              {isError && <AlertCircle size={16} className="text-[#E50914]" />}
              {!isSuccess && !isError && <Info size={16} className="text-[#3B82F6]" />}
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-[#FFFFFF]">{toast.title}</h4>
              {toast.description && (
                <p className="text-xs text-[#AAAAAA] mt-0.5">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#777777] hover:text-[#FFFFFF] p-0.5"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
