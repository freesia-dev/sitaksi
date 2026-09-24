/**
 * Menyiapkan foto lapangan sebelum diupload:
 *  1. Dikecilkan ke sisi terpanjang maks. 1600 px dan disimpan ulang sebagai
 *     JPEG kualitas 0,8 — foto HP 4–8 MB biasanya jadi 250–500 KB, jadi upload
 *     di lapangan lebih cepat dan penyimpanan R2 lebih hemat.
 *  2. Diberi watermark di pojok bawah: waktu foto, nama petugas, dan koordinat
 *     GPS perangkat saat diunggah (kalau izin lokasi diberikan).
 *
 * Kalau browser gagal membaca gambarnya (mis. HEIC di Chrome), file asli
 * dipakai apa adanya supaya upload tidak gagal hanya karena proses ini.
 */

export interface Koordinat {
  lat: number;
  lng: number;
  akurasi: number;
}

export interface FotoSiap {
  file: File;
  waktu: string; // ISO
  lokasi: Koordinat | null;
  diproses: boolean;
}

const SISI_MAKS = 1600;
const KUALITAS = 0.8;

let lokasiTerakhir: { nilai: Koordinat; saat: number } | null = null;

/** Minta lokasi perangkat sekali; hasilnya dipakai ulang selama 2 menit. */
export function ambilLokasi(batasMs = 8000): Promise<Koordinat | null> {
  if (lokasiTerakhir && Date.now() - lokasiTerakhir.saat < 120_000) {
    return Promise.resolve(lokasiTerakhir.nilai);
  }
  if (typeof navigator === 'undefined' || !navigator.geolocation) return Promise.resolve(null);

  return new Promise((resolve) => {
    const gagal = setTimeout(() => resolve(null), batasMs + 500);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(gagal);
        const nilai = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          akurasi: Math.round(pos.coords.accuracy),
        };
        lokasiTerakhir = { nilai, saat: Date.now() };
        resolve(nilai);
      },
      () => {
        clearTimeout(gagal);
        resolve(null);
      },
      { enableHighAccuracy: true, timeout: batasMs, maximumAge: 60_000 },
    );
  });
}

function muatGambar(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Gambar tidak bisa dibaca'));
    };
    img.src = url;
  });
}

const formatWaktu = (d: Date) =>
  new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(d);

export async function siapkanFoto(
  file: File,
  opsi: { petugas?: string; lokasi?: Koordinat | null } = {},
): Promise<FotoSiap> {
  // lastModified = waktu file dibuat kamera (atau disimpan di galeri)
  const waktu = new Date(file.lastModified || Date.now());
  const lokasi = opsi.lokasi ?? null;

  try {
    const img = await muatGambar(file);
    const skala = Math.min(1, SISI_MAKS / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.round(img.naturalWidth * skala);
    const h = Math.round(img.naturalHeight * skala);

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas tidak tersedia');
    ctx.drawImage(img, 0, 0, w, h);

    // Watermark
    const baris = [
      formatWaktu(waktu),
      opsi.petugas ? `Petugas: ${opsi.petugas}` : null,
      lokasi
        ? `GPS unggah: ${lokasi.lat.toFixed(6)}, ${lokasi.lng.toFixed(6)} (±${lokasi.akurasi} m)`
        : 'GPS: tidak tersedia',
      'SITAKSI · Bankaltimtara KCP Telihan',
    ].filter(Boolean) as string[];

    const ukuran = Math.max(14, Math.round(Math.min(w, h) / 38));
    ctx.font = `600 ${ukuran}px system-ui, -apple-system, "Segoe UI", sans-serif`;
    const tinggiBaris = Math.round(ukuran * 1.35);
    const pad = Math.round(ukuran * 0.7);
    const lebarKotak = Math.min(w, Math.max(...baris.map((b) => ctx.measureText(b).width)) + pad * 2);
    const tinggiKotak = tinggiBaris * baris.length + pad * 2 - (tinggiBaris - ukuran);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fillRect(0, h - tinggiKotak, lebarKotak, tinggiKotak);
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'top';
    baris.forEach((b, i) => ctx.fillText(b, pad, h - tinggiKotak + pad + i * tinggiBaris));

    const blob: Blob | null = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', KUALITAS));
    if (!blob) throw new Error('Gagal mengompres');

    const nama = file.name.replace(/\.[^.]+$/, '') + '.jpg';
    return {
      file: new File([blob], nama, { type: 'image/jpeg', lastModified: waktu.getTime() }),
      waktu: waktu.toISOString(),
      lokasi,
      diproses: true,
    };
  } catch {
    return { file, waktu: waktu.toISOString(), lokasi, diproses: false };
  }
}
