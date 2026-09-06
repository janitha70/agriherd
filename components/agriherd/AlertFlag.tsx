import React from 'react';
import { Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TagBadge } from './TagBadge';

interface AlertFlagProps {
  title: React.ReactNode;
  detail: React.ReactNode;
  tagId?: string;
  className?: string;
}

export function AlertFlag({ title, detail, tagId, className }: AlertFlagProps) {
  return (
    <div className={cn("flex items-start gap-3 p-3 bg-alert-red/10 border border-alert-red/20 rounded-md", className)}>
      <div className="mt-0.5">
        <Flag className="w-5 h-5 text-alert-red fill-alert-red/20" />
      </div>
      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h4 className="font-bold text-alert-red text-sm tracking-tight">{title}</h4>
          <p className="text-alert-red/80 text-xs mt-0.5">{detail}</p>
        </div>
        {tagId && (
          <div className="shrink-0">
            {/* The TagBadge inside an alert can optionally have custom classes but the standard is fine. 
                Wait, standard TagBadge uses laterite. The prompt says "TagBadge" should be reused here.
                We'll just reuse it directly. */}
            <TagBadge tagId={tagId} size="sm" />
          </div>
        )}
      </div>
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
