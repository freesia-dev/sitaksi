import { Building2, Car, Home } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type KodeJenis = 'tanah' | 'tanah-bangunan' | 'kendaraan';

export const JENIS: { kode: KodeJenis; label: string; ikon: LucideIcon; baru: string }[] = [
  { kode: 'tanah', label: 'Tanah', ikon: Home, baru: '/taksasi/tanah/new' },
  { kode: 'tanah-bangunan', label: 'Tanah & Bangunan', ikon: Building2, baru: '/taksasi/tanah-bangunan/new' },
  { kode: 'kendaraan', label: 'Kendaraan', ikon: Car, baru: '/taksasi/kendaraan/new' },
];

/** "Tanah & Bangunan" / "tanah_bangunan" / … → kode URL */
export const kodeJenis = (jenis: string): KodeJenis => {
  const j = (jenis || '').toLowerCase();
  if (j === 'kendaraan') return 'kendaraan';
  if (j === 'tanah' ) return 'tanah';
  return 'tanah-bangunan';
};

export const labelJenis = (kode: KodeJenis) => JENIS.find((j) => j.kode === kode)?.label ?? kode;

export const urlEdit = (jenis: string, id: string) => `/taksasi/${kodeJenis(jenis)}/edit/${id}`;
