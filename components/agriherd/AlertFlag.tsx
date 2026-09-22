import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TagBadge } from './TagBadge';

interface AlertFlagProps {
  title: React.ReactNode;
  detail: React.ReactNode;
  tagId?: string;
  className?: string;
}

export function AlertFlag({ title, detail, tagId, className }: AlertFlagProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-2xl border border-red-200 dark:border-red-800/50",
        "bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20",
        "shadow-sm animate-fade-slide-up",
        "relative overflow-hidden",
        className
      )}
    >
      {/* Left accent bar */}
      <span className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-500 to-rose-500 rounded-l-2xl" />

      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5 w-8 h-8 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
        <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 animate-pulse" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="font-bold text-red-700 dark:text-red-400 text-sm tracking-tight">{title}</h4>
            <p className="text-red-600/80 dark:text-red-400/70 text-xs mt-0.5">{detail}</p>
          </div>
          {tagId && (
            <div className="flex-shrink-0">
              <TagBadge tagId={tagId} size="sm" />
            </div>
          )}
        </div>
      </div>

      {/* Dismiss button */}
      <button
        onClick={() => setDismissed(true)}
        className="flex-shrink-0 p-1 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors mt-0.5"
        aria-label="Dismiss alert"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

/*
Usage Example:
<AlertFlag
  title="High Fever Detected"
  detail="Temp: 40.2°C logged at 10:30 AM"
  tagId="C-24"
/>
*/
