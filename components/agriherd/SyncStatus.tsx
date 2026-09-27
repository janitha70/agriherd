import React from 'react';
import { Sun, CloudOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface SyncStatusProps {
  state: 'synced' | 'queued' | 'offline';
  className?: string;
}

export function SyncStatus({ state, className }: SyncStatusProps) {
  const { t } = useLanguage();

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300",
        state === 'synced'
          ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50"
          : state === 'offline'
          ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/50"
          : "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50",
        className
      )}
    >
      {state === 'synced' ? (
        <>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          <span>{t("synced") || "Synced"}</span>
        </>
      ) : state === 'offline' ? (
        <>
          <CloudOff className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
          <span className="relative flex h-1.5 w-1.5">
             <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
          </span>
          <span>Offline</span>
        </>
      ) : (
        <>
          <RefreshCw className="w-3.5 h-3.5 animate-spin-slow text-amber-500 dark:text-amber-400" />
          <span>{t("pendingSync") || "Pending"}</span>
        </>
      )}
    </div>
  );
}
