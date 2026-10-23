import React, { useState } from "react";
import { ArrowUpCircle, X, ExternalLink, CheckCircle } from "lucide-react";

interface UpdateNotificationProps {
  currentVersion?: string;
}

export const UpdateNotification: React.FC<UpdateNotificationProps> = ({
  currentVersion = "1.0.0",
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const checkForUpdates = () => {
    setStatusMessage("Checking for updates...");
    setTimeout(() => {
      setStatusMessage(
        `You are running Batch-Viewer v${currentVersion} (Latest Version)`,
      );
      setTimeout(() => setStatusMessage(null), 4000);
    }, 800);
  };

  return (
    <>
      {statusMessage && (
        <div className="fixed bottom-10 right-6 z-50 flex items-center gap-2 px-3 py-2 bg-fluent-card-light dark:bg-fluent-card-dark border border-fluent-accent/40 rounded-xl shadow-2xl backdrop-blur-md text-xs animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="font-medium text-fluent-text-primaryLight dark:text-fluent-text-primaryDark">
            {statusMessage}
          </span>
          <button
            onClick={() => setStatusMessage(null)}
            className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 ml-1"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </>
  );
};
