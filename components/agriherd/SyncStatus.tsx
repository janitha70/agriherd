import React from 'react';
import { Sun, CloudRain } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface SyncStatusProps {
  state: 'synced' | 'queued';
  className?: string;
}

export function SyncStatus({ state, className }: SyncStatusProps) {
  const { t } = useLanguage();

  return (
    <div 
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors",
        state === 'synced' 
          ? "bg-turmeric/10 text-ink border border-turmeric/20" 
          : "bg-paddy/10 text-paddy border border-paddy/20",
        className
      )}
    >
      {state === 'synced' ? (
        <>
          <Sun className="w-4 h-4 text-turmeric" />
          <span>{t("synced") || "Synced"}</span>
        </>
      ) : (
        <>
          <CloudRain className="w-4 h-4 text-paddy" />
          <span>{t("pendingSync") || "Saved, will sync"}</span>
        </>
      )}
    </div>
  );
}

/* 
Usage Example:
<SyncStatus state="synced" />
<SyncStatus state="queued" />
*/
