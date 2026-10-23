import React, { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';

interface UpdateNotificationProps {
  currentVersion?: string;
}

export const UpdateNotification: React.FC<UpdateNotificationProps> = () => {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  return (
    <>
      {statusMessage && (
        <div className="animate-in fade-in slide-in-from-bottom-2 fixed bottom-10 right-6 z-50 flex items-center gap-2 rounded-xl border border-fluent-accent/40 bg-fluent-card-light px-3 py-2 text-xs shadow-2xl backdrop-blur-md dark:bg-fluent-card-dark">
          <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
          <span className="font-medium text-fluent-text-primaryLight dark:text-fluent-text-primaryDark">
            {statusMessage}
          </span>
          <button
            onClick={() => setStatusMessage(null)}
            className="ml-1 rounded p-1 hover:bg-black/5 dark:hover:bg-white/10"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
    </>
  );
};
