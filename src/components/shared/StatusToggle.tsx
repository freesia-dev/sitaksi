import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { useTaksasi } from '@/context/TaksasiContext';
import { useToast } from '@/hooks/use-toast';
import { Check, FileEdit, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
  const [showConfirm, setShowConfirm] = useState(false);

  // Sync local state with prop when it changes
  useEffect(() => {
    setLocalStatus(currentStatus);
  }, [currentStatus]);

  const handleClick = () => {
    if (disabled || loading) return;
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setShowConfirm(false);
    
    const prevStatus = localStatus;
    // Database constraint only allows: 'draft', 'disetujui', 'ditolak'
    const newStatus = prevStatus === 'draft' ? 'disetujui' : 'draft';

    // Optimistic update
    setLocalStatus(newStatus);
    setLoading(true);

    try {
      await updateTaksasi(taksasiId, { status: newStatus });
      toast({
        title: 'Status diubah',
        description: `Status berhasil diubah menjadi ${newStatus === 'disetujui' ? 'Selesai' : 'Draft'}`,
      });
    } catch (error) {
      // Revert on error - toast already shown by context
      setLocalStatus(prevStatus);
    } finally {
      setLoading(false);
    }
  };

  const isDraft = localStatus === 'draft';
  const newStatusLabel = isDraft ? 'Selesai' : 'Draft';

  return (
    <>
      <Badge
        variant={isDraft ? 'secondary' : 'default'}
        className={cn(
          "cursor-pointer transition-all hover:opacity-80",
          isDraft ? "bg-warning/20 text-warning hover:bg-warning/30" : "bg-success/20 text-success hover:bg-success/30",
          disabled && "cursor-not-allowed opacity-50"
        )}
        onClick={handleClick}
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

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Ubah Status</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin mengubah status dari <strong>{isDraft ? 'Draft' : 'Selesai'}</strong> menjadi <strong>{newStatusLabel}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              Ya, Ubah Status
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
