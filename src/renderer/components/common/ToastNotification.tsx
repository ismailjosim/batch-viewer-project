import React from "react";
import { X } from "lucide-react";

interface ToastNotificationProps {
  message: string | null;
  onClose: () => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  message,
  onClose,
}) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-10 right-6 z-50 flex items-center gap-2 px-3.5 py-2.5 bg-fluent-card-light dark:bg-fluent-card-dark border border-fluent-accent/50 rounded-xl shadow-2xl backdrop-blur-md text-xs animate-in fade-in select-none">
      <span className="font-medium text-fluent-text-primaryLight dark:text-fluent-text-primaryDark">
        {message}
      </span>
      <button
        onClick={onClose}
        className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-fluent-text-secondaryLight dark:text-fluent-text-secondaryDark hover:text-fluent-text-primaryLight dark:hover:text-fluent-text-primaryDark ml-1 transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};
