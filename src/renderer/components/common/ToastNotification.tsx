import React from 'react';
import { X } from 'lucide-react';

interface ToastNotificationProps {
  message: string | null;
  onClose: () => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="animate-in fade-in pointer-events-auto fixed bottom-10 right-6 z-50 flex select-none items-center gap-2 rounded-xl border border-fluent-accent/50 bg-fluent-card-light px-3.5 py-2.5 text-xs shadow-2xl backdrop-blur-md dark:bg-fluent-card-dark"
    >
      <span className="font-medium text-fluent-text-primaryLight dark:text-fluent-text-primaryDark">
        {message}
      </span>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss notification"
        title="Dismiss"
        className="ml-1 rounded p-1 text-fluent-text-secondaryLight transition-colors hover:bg-black/10 hover:text-fluent-text-primaryLight dark:text-fluent-text-secondaryDark dark:hover:bg-white/10 dark:hover:text-fluent-text-primaryDark"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
};
