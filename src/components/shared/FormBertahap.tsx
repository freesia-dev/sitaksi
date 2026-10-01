import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, ArrowLeft, ArrowRight, Check, CloudOff, CloudUpload, History, LayoutList, ListOrdered } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface Langkah {
  judul: string;
  ikon?: LucideIcon;
  isi: React.ReactNode;
  /** Kembalikan daftar kolom wajib yang masih kosong di langkah ini */
  cek?: () => string[];
}

interface FormBertahapProps {
  langkah: Langkah[];
  /** Info draf otomatis untuk ditampilkan di bawah indikator langkah */
  draf?: {
    tersedia: { waktu: string } | null;
    terakhirDisimpan: string | null;
    pakai: () => void;
    buang: () => void;
  };
}

const jam = (iso: string) =>
  new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
const tanggalJam = (iso: string) =>
  new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));

const MODE_KEY = 'sitaksi:form-mode';

/**
 * Form panjang dipecah jadi langkah-langkah dengan penunjuk kemajuan.
 * Pengguna bisa melompat ke langkah mana saja lewat indikator di atas; tombol
 * "Berikutnya" memeriksa kolom wajib langkah itu dulu dan menandai yang kurang.
 * Mode "Semua bagian" menampilkan seluruh form dalam satu halaman seperti dulu.
 */
export function FormBertahap({ langkah, draf }: FormBertahapProps) {
  const [aktif, setAktif] = useState(0);
  const [kurang, setKurang] = useState<string[]>([]);
  const [dikunjungi, setDikunjungi] = useState<Set<number>>(() => new Set([0]));
  const [semua, setSemua] = useState(() => {
    try {
      return localStorage.getItem(MODE_KEY) === 'semua';
    } catch {
      return false;
    }
  });
  const atasRef = useRef<HTMLDivElement>(null);
  const indikatorRef = useRef<HTMLDivElement>(null);

  const total = langkah.length;
  const terakhir = aktif === total - 1;

  const pindah = (i: number) => {
    setAktif(i);
    setKurang([]);
    setDikunjungi((d) => new Set(d).add(i));
  };

  useEffect(() => {
    if (semua) return;
    atasRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const tombol = indikatorRef.current?.querySelector<HTMLElement>(`[data-langkah="${aktif}"]`);
    tombol?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [aktif, semua]);

  const berikutnya = () => {
    const hilang = langkah[aktif].cek?.() ?? [];
    if (hilang.length > 0) {
      setKurang(hilang);
      return;
    }
    pindah(Math.min(total - 1, aktif + 1));
  };

  const gantiMode = () => {
    setSemua((s) => {
      try {
        localStorage.setItem(MODE_KEY, s ? 'langkah' : 'semua');
      } catch {
        /* abaikan */
      }
      return !s;
    });
    setKurang([]);
  };

  const statusLangkah = (i: number) => {
    if (i === aktif) return 'aktif';
    const belum = (langkah[i].cek?.() ?? []).length > 0;
    if (dikunjungi.has(i) && !belum) return 'selesai';
    if (dikunjungi.has(i) && belum) return 'kurang';
    return 'belum';
  };

  return (
    <div className="space-y-4" ref={atasRef}>
      {/* Indikator langkah + pilihan mode */}
      <div className="rounded-xl border bg-card p-3 shadow-card space-y-3 scroll-mt-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium">
            {semua ? 'Semua bagian' : (
              <>Langkah {aktif + 1} dari {total}: <span className="text-primary">{langkah[aktif].judul}</span></>
            )}
          </p>
          <Button variant="ghost" size="sm" onClick={gantiMode} className="shrink-0 text-xs">
            {semua ? <ListOrdered size={14} className="mr-1" /> : <LayoutList size={14} className="mr-1" />}
            {semua ? 'Per langkah' : 'Semua bagian'}
          </Button>
        </div>

        {!semua && (
          <>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${((aktif + 1) / total) * 100}%` }}
              />
            </div>
            <div ref={indikatorRef} className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 custom-scrollbar">
              {langkah.map((l, i) => {
                const st = statusLangkah(i);
                const Ikon = l.ikon;
                return (
                  <button
                    key={l.judul}
                    type="button"
                    data-langkah={i}
                    onClick={() => pindah(i)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors',
                      st === 'aktif' && 'border-primary bg-primary text-primary-foreground',
                      st === 'selesai' && 'border-success/40 bg-success/10 text-success',
                      st === 'kurang' && 'border-warning/60 bg-warning/10 text-warning-foreground',
                      st === 'belum' && 'text-muted-foreground hover:bg-muted',
                    )}
                  >
                    {st === 'selesai' ? <Check size={12} /> : st === 'kurang' ? <AlertCircle size={12} /> : Ikon ? <Ikon size={12} /> : null}
                    <span>{i + 1}. {l.judul}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {draf?.tersedia ? (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-lg border border-warning/50 bg-warning/10 p-3 text-sm">
            <History size={16} className="shrink-0 text-warning-foreground" />
            <p className="flex-1">
              Ada isian yang belum disimpan dari <strong>{tanggalJam(draf.tersedia.waktu)}</strong>. Lanjutkan?
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={draf.buang}>Mulai baru</Button>
              <Button size="sm" onClick={draf.pakai}>Lanjutkan isian</Button>
            </div>
          </div>
        ) : draf ? (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {draf.terakhirDisimpan ? <CloudUpload size={12} /> : <CloudOff size={12} />}
            {draf.terakhirDisimpan
              ? `Isian tersimpan otomatis di perangkat ini · ${jam(draf.terakhirDisimpan)}`
              : 'Isian akan tersimpan otomatis di perangkat ini'}
          </p>
        ) : null}
      </div>

      {/* Isi */}
      {semua ? (
        <div className="grid gap-6">{langkah.map((l) => <React.Fragment key={l.judul}>{l.isi}</React.Fragment>)}</div>
      ) : (
        <div key={aktif} className="animate-fade-in">{langkah[aktif].isi}</div>
      )}

      {kurang.length > 0 && (
        <div role="alert" className="flex gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-destructive" />
          <div>
            <p className="font-medium text-destructive">Lengkapi dulu sebelum lanjut:</p>
            <ul className="mt-1 list-disc pl-5 text-foreground">
              {kurang.map((k) => <li key={k}>{k}</li>)}
            </ul>
            <button type="button" className="mt-2 text-xs underline text-muted-foreground" onClick={() => pindah(Math.min(total - 1, aktif + 1))}>
              Lewati dulu, isi nanti
            </button>
          </div>
        </div>
      )}

      {/* Navigasi */}
      {!semua && (
        <div className="sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] md:bottom-4 z-20 flex gap-3 rounded-xl border bg-card/95 p-3 shadow-elevated backdrop-blur">
          <Button variant="outline" className="flex-1" disabled={aktif === 0} onClick={() => pindah(aktif - 1)}>
            <ArrowLeft size={16} className="mr-1" /> Sebelumnya
          </Button>
          {!terakhir && (
            <Button className="flex-1" onClick={berikutnya}>
              Berikutnya <ArrowRight size={16} className="ml-1" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
