import React from 'react';
import { StatusOtorisasi } from '@/types';
import { cn } from '@/lib/utils';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: StatusOtorisasi;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = {
    Menunggu: {
      icon: Clock,
      className: 'bg-warning/10 text-warning border-warning/20',
    },
    Disetujui: {
      icon: CheckCircle2,
      className: 'bg-success/10 text-success border-success/20',
    },
    Ditolak: {
      icon: XCircle,
      className: 'bg-destructive/10 text-destructive border-destructive/20',
    },
  };

  const { icon: Icon, className: statusClassName } = config[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
        statusClassName,
        className
      )}
    >
      <Icon size={12} />
      {status}
    </span>
  );
}
