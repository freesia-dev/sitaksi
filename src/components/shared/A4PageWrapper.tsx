import React from 'react';
import { cn } from '@/lib/utils';

interface A4PageWrapperProps {
  children: React.ReactNode;
  className?: string;
  isEditing?: boolean;
}

export function A4PageWrapper({ children, className, isEditing = false }: A4PageWrapperProps) {
  return (
    <div className="flex justify-center py-4">
      <div
        className={cn(
          "bg-white shadow-xl border rounded-sm",
          "w-[210mm] min-h-[297mm]",
          "print:shadow-none print:border-none print:rounded-none print:w-full print:min-h-0",
          isEditing && "ring-2 ring-accent/50",
          className
        )}
        style={{
          // A4 aspect ratio enforced
          maxWidth: '210mm',
        }}
      >
        {children}
      </div>
    </div>
  );
}
