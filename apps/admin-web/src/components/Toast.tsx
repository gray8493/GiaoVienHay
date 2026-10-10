'use client';

import React from 'react';

export type ToastVariant = 'success' | 'error' | 'info';

export default function Toast({
  message,
  variant = 'success',
}: {
  message: string;
  variant?: ToastVariant;
}) {
  const icon = variant === 'error' ? 'error' : variant === 'info' ? 'info' : 'check_circle';
  const iconColor = variant === 'error' ? 'text-rose-300' : variant === 'info' ? 'text-sky-300' : 'text-emerald-300';

  return (
    <div
      className="fixed bottom-6 right-6 z-[120] flex max-w-[calc(100vw-3rem)] items-center gap-2.5 rounded-xl bg-slate-900 px-4 py-3 text-xs font-medium text-white shadow-xl animate-fadeIn"
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
    >
      <span className={`material-symbols-outlined text-[18px] ${iconColor}`} aria-hidden="true">
        {icon}
      </span>
      <span>{message}</span>
    </div>
  );
}
