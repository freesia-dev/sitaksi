import React from 'react';
import { cn } from '@/lib/utils';

interface A4PageWrapperProps {
  children: React.ReactNode;
  className?: string;
  isEditing?: boolean;
}

export const A4PageWrapper = React.forwardRef<HTMLDivElement, A4PageWrapperProps>(
  ({ children, className, isEditing = false }, ref) => {
    return (
      <div className="flex justify-center py-4">
        <div
          ref={ref}
          className={cn(
            "bg-white shadow-xl border rounded-sm",
            "w-[210mm] min-h-[297mm]",
            "print:shadow-none print:border-none print:rounded-none print:w-full print:min-h-0",
            isEditing && "ring-2 ring-accent/50",
            className
          )}
          style={{
            maxWidth: '210mm',
          }}
        >
          {children}
        </div>
      </div>
    );
  }
);

A4PageWrapper.displayName = 'A4PageWrapper';
