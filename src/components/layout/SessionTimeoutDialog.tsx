import { useEffect, useState } from 'react';
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
import { useAuth } from '@/context/AuthContext';

/**
 * Peringatan satu menit sebelum logout otomatis, menggantikan alert() bawaan
 * browser. Isian form yang belum disimpan tetap aman karena draf tersimpan
 * otomatis, tapi pengguna tetap diberi kesempatan untuk melanjutkan sesi.
 */
export function SessionTimeoutDialog() {
  const { idleWarning, extendSession, logout } = useAuth();
  const [sisa, setSisa] = useState(60);

  useEffect(() => {
    if (!idleWarning) return;
    setSisa(60);
    const t = setInterval(() => setSisa((d) => Math.max(0, d - 1)), 1000);
    return () => clearInterval(t);
  }, [idleWarning]);

  return (
    <AlertDialog open={idleWarning}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Masih di sana?</AlertDialogTitle>
          <AlertDialogDescription>
            Anda akan keluar otomatis dalam <strong>{sisa} detik</strong> karena tidak ada aktivitas.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => logout()}>Keluar sekarang</AlertDialogCancel>
          <AlertDialogAction onClick={() => extendSession()}>Lanjutkan sesi</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
