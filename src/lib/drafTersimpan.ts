import { KodeJenis } from '@/lib/jenisAgunan';

export interface DrafTersimpan {
  kunci: string;
  jenis: KodeJenis;
  id: string | null; // null = taksasi baru
  waktu: string;
  nama: string;
}

/** Daftar isian form yang tersimpan otomatis di perangkat ini milik user tertentu */
export function daftarDraf(userId?: string): DrafTersimpan[] {
  if (!userId) return [];
  const hasil: DrafTersimpan[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const kunci = localStorage.key(i);
      if (!kunci?.startsWith('sitaksi:draf:')) continue;
      const [, , jenis, uid, id] = kunci.split(':');
      if (uid !== userId) continue;
      try {
        const isi = JSON.parse(localStorage.getItem(kunci) || '');
        hasil.push({
          kunci,
          jenis: jenis as KodeJenis,
          id: id === 'baru' ? null : id,
          waktu: isi?.waktu,
          nama: isi?.data?.formData?.nama_nasabah || '',
        });
      } catch {
        /* draf rusak — lewati */
      }
    }
  } catch {
    return [];
  }
  return hasil.sort((a, b) => (b.waktu || '').localeCompare(a.waktu || ''));
}

export function hapusDrafTersimpan(kunci: string) {
  try {
    localStorage.removeItem(kunci);
  } catch {
    /* abaikan */
  }
}
