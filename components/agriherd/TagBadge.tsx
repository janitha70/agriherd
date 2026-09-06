import React from 'react';
import { cn } from '@/lib/utils';

interface TagBadgeProps {
  tagId: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function TagBadge({ tagId, size = 'sm', className }: TagBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center font-bold font-mono tracking-tight",
        "bg-[#A6472B]/10 text-laterite border border-laterite/20",
        size === 'sm' ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        // The ear-tag notch effect (cuts off bottom-right corner)
        "[clip-path:polygon(0_0,100%_0,100%_calc(100%-6px),calc(100%-6px)_100%,0_100%)]",
        className
      )}
      title={`Animal Tag: ${tagId}`}
    >
      <span className="flex items-center gap-1">
        {/* Optional small circle to represent the tag hole */}
        <span className="w-1.5 h-1.5 rounded-full bg-laterite/30 shrink-0" />
        {tagId}
      </span>
    </div>
  );
}

/* 
Usage Example:
<TagBadge tagId="A-118" size="md" />
*/
