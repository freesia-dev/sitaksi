import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { useTaksasi } from '@/context/TaksasiContext';
import { useToast } from '@/hooks/use-toast';
import { Check, FileEdit, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusToggleProps {
  taksasiId: string;
  currentStatus: string;
  disabled?: boolean;
}

export function StatusToggle({ taksasiId, currentStatus, disabled = false }: StatusToggleProps) {
  const { updateTaksasi } = useTaksasi();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [localStatus, setLocalStatus] = useState(currentStatus);

  // Sync local state with prop when it changes
  useEffect(() => {
    setLocalStatus(currentStatus);
  }, [currentStatus]);

  const handleToggle = async () => {
    if (disabled || loading) return;

    const prevStatus = localStatus;
    const newStatus = prevStatus === 'draft' ? 'selesai' : 'draft';

    // Optimistic update
    setLocalStatus(newStatus);
    setLoading(true);

    try {
      await updateTaksasi(taksasiId, { status: newStatus });
      // Toast is handled by context, just show success
      toast({
        title: 'Status diubah',
        description: `Status berhasil diubah menjadi ${newStatus === 'selesai' ? 'Selesai' : 'Draft'}`,
      });
    } catch (error) {
      // Revert on error - toast already shown by context
      setLocalStatus(prevStatus);
    } finally {
      setLoading(false);
    }
  };

  const isDraft = localStatus === 'draft';

  return (
    <Badge
      variant={isDraft ? 'secondary' : 'default'}
      className={cn(
        "cursor-pointer transition-all hover:opacity-80",
        isDraft ? "bg-warning/20 text-warning hover:bg-warning/30" : "bg-success/20 text-success hover:bg-success/30",
        disabled && "cursor-not-allowed opacity-50"
      )}
      onClick={handleToggle}
    >
      {loading ? (
        <Loader2 size={12} className="mr-1 animate-spin" />
      ) : isDraft ? (
        <FileEdit size={12} className="mr-1" />
      ) : (
        <Check size={12} className="mr-1" />
      )}
      {isDraft ? 'Draft' : 'Selesai'}
    </Badge>
  );
}
