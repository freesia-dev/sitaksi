import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Menyimpan isian form ke perangkat (localStorage) setiap kali berubah, supaya
 * isian tidak hilang kalau sinyal putus, tab tertutup, atau sesi berakhir.
 *
 * Alur:
 *  - Saat form dibuka dan ada draf lama untuk kunci yang sama, `drafTersedia`
 *    terisi dan penyimpanan otomatis DITAHAN sampai pengguna memilih
 *    "Lanjutkan draf" atau "Mulai baru" — supaya draf lama tidak tertimpa
 *    form kosong sebelum sempat dipulihkan.
 *  - Setelah itu setiap perubahan disimpan (jeda 800 ms).
 *  - Panggil `hapusDraf()` setelah data berhasil disimpan ke server.
 */

interface IsiDraf<T> {
  versi: 1;
  waktu: string;
  data: T;
}

const baca = <T,>(kunci: string): IsiDraf<T> | null => {
  try {
    const mentah = localStorage.getItem(kunci);
    if (!mentah) return null;
    const isi = JSON.parse(mentah) as IsiDraf<T>;
    return isi?.versi === 1 ? isi : null;
  } catch {
    return null;
  }
};

export function useDrafOtomatis<T>(
  kunci: string | null,
  data: T,
  pulihkan: (data: T) => void,
  aktif = true,
) {
  const [drafTersedia, setDrafTersedia] = useState<{ waktu: string } | null>(null);
  const [bolehSimpan, setBolehSimpan] = useState(false);
  const [terakhirDisimpan, setTerakhirDisimpan] = useState<string | null>(null);
  const awal = useRef<string | null>(null);
  const pulihkanRef = useRef(pulihkan);
  pulihkanRef.current = pulihkan;

  // Cek draf lama sekali, saat form siap
  useEffect(() => {
    if (!kunci || !aktif || awal.current === kunci) return;
    awal.current = kunci;
    const lama = baca<T>(kunci);
    if (lama && JSON.stringify(lama.data) !== JSON.stringify(data)) {
      setDrafTersedia({ waktu: lama.waktu });
      setBolehSimpan(false);
    } else {
      setBolehSimpan(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kunci, aktif]);

  // Simpan otomatis
  useEffect(() => {
    if (!kunci || !aktif || !bolehSimpan) return;
    const t = setTimeout(() => {
      try {
        const waktu = new Date().toISOString();
        localStorage.setItem(kunci, JSON.stringify({ versi: 1, waktu, data } satisfies IsiDraf<T>));
        setTerakhirDisimpan(waktu);
      } catch {
        /* penyimpanan penuh / diblokir — form tetap jalan tanpa draf */
      }
    }, 800);
    return () => clearTimeout(t);
  }, [kunci, aktif, bolehSimpan, data]);

  const pakaiDraf = useCallback(() => {
    if (!kunci) return;
    const lama = baca<T>(kunci);
    if (lama) pulihkanRef.current(lama.data);
    setDrafTersedia(null);
    setBolehSimpan(true);
  }, [kunci]);

  const buangDraf = useCallback(() => {
    if (kunci) {
      try {
        localStorage.removeItem(kunci);
      } catch {
        /* abaikan */
      }
    }
    setDrafTersedia(null);
    setBolehSimpan(true);
  }, [kunci]);

  const hapusDraf = useCallback(() => {
    setBolehSimpan(false);
    if (!kunci) return;
    try {
      localStorage.removeItem(kunci);
    } catch {
      /* abaikan */
    }
  }, [kunci]);

  return { drafTersedia, pakaiDraf, buangDraf, hapusDraf, terakhirDisimpan };
}
