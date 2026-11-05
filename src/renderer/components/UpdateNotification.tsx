import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, X, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { UpdateInfoData, UpdateProgressData } from '../../preload';

interface UpdateNotificationProps {
  manualCheckTrigger?: number;
  onToastMessage?: (msg: string) => void;
}

export const UpdateNotification: React.FC<UpdateNotificationProps> = ({
  manualCheckTrigger,
  onToastMessage,
}) => {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfoData | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [isDownloaded, setIsDownloaded] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Listen to Electron IPC updater events
  useEffect(() => {
    if (!window.api?.onUpdateAvailable) return;

    const unregAvailable = window.api.onUpdateAvailable((info) => {
      setUpdateInfo(info);
      setIsDismissed(false);
      setIsDownloaded(false);
      setErrorMsg(null);
    });

    const unregProgress = window.api.onUpdateProgress((progress: UpdateProgressData) => {
      setIsDownloading(true);
      setDownloadProgress(progress.percent);
    });

    const unregDownloaded = window.api.onUpdateDownloaded(() => {
      setIsDownloading(false);
      setDownloadProgress(100);
      setIsDownloaded(true);
      setIsDismissed(false);
    });

    const unregError = window.api.onUpdateError((err: string) => {
      setIsDownloading(false);
      setErrorMsg(err);
      if (onToastMessage) {
        onToastMessage(`Update check failed: ${err}`);
      }
    });

    return () => {
      unregAvailable?.();
      unregProgress?.();
      unregDownloaded?.();
      unregError?.();
    };
  }, [onToastMessage]);

  // Handle manual update check triggered from StatusBar
  useEffect(() => {
    if (!manualCheckTrigger || manualCheckTrigger <= 0) return;

    if (!window.api?.checkForUpdates) {
      if (onToastMessage) onToastMessage('Updater is not available in development mode');
      return;
    }

    if (onToastMessage) onToastMessage('Checking for updates...');

    window.api.checkForUpdates().then((res) => {
      if (res.success && res.updateInfo) {
        // Handled via onUpdateAvailable event if version is higher
      } else if (res.error) {
        if (onToastMessage) onToastMessage(`Update check: ${res.error}`);
      } else {
        if (onToastMessage) onToastMessage('You are running the latest version!');
      }
    }).catch(() => {
      if (onToastMessage) onToastMessage('Unable to connect to update server');
    });
  }, [manualCheckTrigger, onToastMessage]);

  const handleStartDownload = async () => {
    setIsDownloading(true);
    setErrorMsg(null);
    try {
      const res = await window.api.startUpdateDownload();
      if (!res.success && res.error) {
        setIsDownloading(false);
        setErrorMsg(res.error);
      }
    } catch (err: any) {
      setIsDownloading(false);
      setErrorMsg(err?.message || 'Download failed');
    }
  };

  const handleInstallNow = () => {
    window.api.installUpdateNow();
  };

  if (isDismissed || (!updateInfo && !isDownloaded)) {
    return null;
  }

  return (
    <div className="fixed bottom-12 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="overflow-hidden rounded-2xl border border-fluent-accent/30 bg-fluent-card-light/95 p-4 shadow-2xl backdrop-blur-xl dark:bg-fluent-card-dark/95">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-fluent-accent/15 text-fluent-accent">
              {isDownloaded ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              ) : isDownloading ? (
                <RefreshCw className="h-5 w-5 animate-spin text-fluent-accent" />
              ) : (
                <Sparkles className="h-5 w-5 text-fluent-accent" />
              )}
            </div>
            <div>
              <h4 className="text-sm font-bold text-fluent-text-primaryLight dark:text-fluent-text-primaryDark">
                {isDownloaded
                  ? 'Update Ready to Install!'
                  : isDownloading
                  ? 'Downloading Update...'
                  : `Update Available: v${updateInfo?.version}`}
              </h4>
              <p className="text-[11px] text-fluent-text-secondaryLight dark:text-fluent-text-secondaryDark">
                {isDownloaded
                  ? 'Restart Batch-Viewer to finish applying the update.'
                  : isDownloading
                  ? `${downloadProgress ?? 0}% completed`
                  : 'A new version of Batch-Viewer is ready for you.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsDismissed(true)}
            className="rounded-lg p-1 text-fluent-text-secondaryLight transition-colors hover:bg-black/5 hover:text-fluent-text-primaryLight dark:text-fluent-text-secondaryDark dark:hover:bg-white/10 dark:hover:text-fluent-text-primaryDark"
            title="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Progress Bar (when downloading) */}
        {isDownloading && (
          <div className="mt-3.5 space-y-1.5">
            <div className="h-2 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-fluent-accent transition-all duration-300"
                style={{ width: `${Math.max(5, downloadProgress || 0)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-fluent-text-secondaryLight dark:text-fluent-text-secondaryDark">
              <span>Downloading installer</span>
              <span className="font-semibold text-fluent-accent">{downloadProgress ?? 0}%</span>
            </div>
          </div>
        )}

        {/* Error notice if any */}
        {errorMsg && (
          <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-red-500/10 px-2.5 py-1.5 text-[11px] text-red-500">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{errorMsg}</span>
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex items-center justify-end gap-2">
          {!isDownloading && !isDownloaded && (
            <>
              <button
                onClick={() => setIsDismissed(true)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-fluent-text-secondaryLight transition-colors hover:bg-black/5 dark:text-fluent-text-secondaryDark dark:hover:bg-white/10"
              >
                Later
              </button>
              <button
                onClick={handleStartDownload}
                className="flex items-center gap-1.5 rounded-lg bg-fluent-accent px-3.5 py-1.5 text-xs font-semibold text-white shadow-md transition-all hover:opacity-90 active:scale-95"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Update Now</span>
              </button>
            </>
          )}

          {isDownloaded && (
            <button
              onClick={handleInstallNow}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white shadow-md transition-all hover:bg-emerald-500 active:scale-95"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Restart & Install</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
