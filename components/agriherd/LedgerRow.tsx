import React from 'react';
import { cn } from '@/lib/utils';

interface LedgerRowProps {
  label: React.ReactNode;
  value: React.ReactNode;
  valueClassName?: string;
  className?: string;
}

export function LedgerRow({ label, value, valueClassName, className }: LedgerRowProps) {
  return (
    <div className={cn("flex items-center justify-between py-3 border-b border-husk/50 last:border-0", className)}>
      <div className="text-sm font-medium text-ink/70 uppercase tracking-wide">
        {label}
      </div>
      <div className={cn("text-2xl font-bold font-mono tracking-tight text-ink", valueClassName)}>
        {value}
      </div>
    </div>
  );
}

/* 
Usage Example:
<div className="bg-husk/20 rounded-md p-4">
  <LedgerRow label="Today's Yield" value="24.5 L" valueClassName="text-turmeric" />
  <LedgerRow label="Active Herd" value="12 Head" />
</div>
*/
