import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CurrencyInput } from '@/components/ui/currency-input';
import { CloudImageUploader, LabeledImage } from '@/components/shared/CloudImageUploader';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { KATEGORI_LABEL, KategoriKunjungan } from '@/types/monitoring';

interface FormState {
  kategori: KategoriKunjungan;
  tanggal_kunjungan: string;
  jam_kunjungan: string;
  nama_debitur: string;
  no_rekening: string;
  no_hp: string;
  alamat: string;
  plafond: number;
  baki_debet: number;
  tunggakan_pokok: number;
  tunggakan_bunga: number;
  hari_tunggakan: number;
  tujuan_kunjungan: string;
  kondisi_usaha: string;
  kondisi_agunan: string;
  hasil_kunjungan: string;
  rencana_tindak_lanjut: string;
  komitmen_bayar_nominal: number;
  komitmen_bayar_tanggal: string;
  officer_nama: string;
  pimpinan_nama: string;
  kantor_cabang: string;
  status: 'draft' | 'final';
}

const initial: FormState = {
  kategori: 'aktif',
  tanggal_kunjungan: new Date().toISOString().slice(0, 10),
  jam_kunjungan: '',
  nama_debitur: '',
  no_rekening: '',
  no_hp: '',
  alamat: '',
  plafond: 0,
  baki_debet: 0,
  tunggakan_pokok: 0,
  tunggakan_bunga: 0,
  hari_tunggakan: 0,
  tujuan_kunjungan: '',
  kondisi_usaha: '',
  kondisi_agunan: '',
  hasil_kunjungan: '',
  rencana_tindak_lanjut: '',
  komitmen_bayar_nominal: 0,
  komitmen_bayar_tanggal: '',
  officer_nama: '',
  pimpinan_nama: '',
  kantor_cabang: 'KCP TELIHAN',
  status: 'final',
};

export default function MonitoringForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>(initial);
  const [photos, setPhotos] = useState<LabeledImage[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit || !id) return;
    (async () => {
      const { data, error } = await supabase.from('monitoring_kunjungan').select('*').eq('id', id).maybeSingle();
      if (error || !data) {
        toast({ title: 'Data tidak ditemukan', variant: 'destructive' });
        navigate('/monitoring');
        return;
      }
      setForm({
        kategori: data.kategori as KategoriKunjungan,
        tanggal_kunjungan: data.tanggal_kunjungan,
        jam_kunjungan: data.jam_kunjungan || '',
        nama_debitur: data.nama_debitur,
        no_rekening: data.no_rekening || '',
        no_hp: data.no_hp || '',
        alamat: data.alamat || '',
        plafond: Number(data.plafond) || 0,
        baki_debet: Number(data.baki_debet) || 0,
        tunggakan_pokok: Number(data.tunggakan_pokok) || 0,
        tunggakan_bunga: Number(data.tunggakan_bunga) || 0,
        hari_tunggakan: data.hari_tunggakan || 0,
        tujuan_kunjungan: data.tujuan_kunjungan || '',
        kondisi_usaha: data.kondisi_usaha || '',
        kondisi_agunan: data.kondisi_agunan || '',
        hasil_kunjungan: data.hasil_kunjungan || '',
        rencana_tindak_lanjut: data.rencana_tindak_lanjut || '',
        komitmen_bayar_nominal: Number(data.komitmen_bayar_nominal) || 0,
        komitmen_bayar_tanggal: data.komitmen_bayar_tanggal || '',
        officer_nama: data.officer_nama || '',
        pimpinan_nama: data.pimpinan_nama || '',
        kantor_cabang: data.kantor_cabang || 'KCP TELIHAN',
        status: (data.status as any) || 'final',
      });
      setPhotos((data.foto_kunjungan || []).map((url: string, idx: number) => ({ url, label: `Foto ${idx + 1}` })));
      setLoading(false);
    })();
  }, [id, isEdit, navigate, toast]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm(s => ({ ...s, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.nama_debitur.trim()) {
      toast({ title: 'Nama debitur wajib diisi', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const payload: any = {
      ...form,
      jam_kunjungan: form.jam_kunjungan || null,
      komitmen_bayar_tanggal: form.komitmen_bayar_tanggal || null,
      foto_kunjungan: photos.map(p => p.url),
      user_id: user.id,
    };
    let error;
    if (isEdit && id) {
      ({ error } = await supabase.from('monitoring_kunjungan').update(payload).eq('id', id));
    } else {
      // generate nomor BA
      const now = new Date();
      const nomor = `BA-MON/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${Date.now().toString().slice(-4)}`;
      payload.nomor_ba = nomor;
      ({ error } = await supabase.from('monitoring_kunjungan').insert(payload));
    }
    setSaving(false);
    if (error) {
      toast({ title: 'Gagal menyimpan', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: isEdit ? 'Data diperbarui' : 'Kunjungan tersimpan' });
      navigate('/monitoring');
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Memuat...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PageHeader
        title={isEdit ? 'Edit Kunjungan' : 'Tambah Kunjungan'}
        description="Isi data kunjungan debitur dengan lengkap"
        actions={
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}><ArrowLeft className="mr-2" size={16} />Kembali</Button>
            <Button type="submit" disabled={saving}><Save className="mr-2" size={16} />{saving ? 'Menyimpan...' : 'Simpan'}</Button>
          </div>
        }
      />

      {/* Data dasar */}
      <Section title="Data Kunjungan">
        <Grid>
          <Field label="Kategori Kunjungan">
            <Select value={form.kategori} onValueChange={(v) => set('kategori', v as KategoriKunjungan)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(KATEGORI_LABEL) as KategoriKunjungan[]).map(k => (
                  <SelectItem key={k} value={k}>{KATEGORI_LABEL[k]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Tanggal Kunjungan"><Input type="date" value={form.tanggal_kunjungan} onChange={e => set('tanggal_kunjungan', e.target.value)} /></Field>
          <Field label="Jam Kunjungan"><Input type="time" value={form.jam_kunjungan} onChange={e => set('jam_kunjungan', e.target.value)} /></Field>
          <Field label="Tujuan Kunjungan"><Input value={form.tujuan_kunjungan} onChange={e => set('tujuan_kunjungan', e.target.value)} placeholder="Survei awal / monitoring / penagihan..." /></Field>
        </Grid>
      </Section>

      {/* Data debitur */}
      <Section title="Identitas Debitur">
        <Grid>
          <Field label="Nama Debitur *"><Input value={form.nama_debitur} onChange={e => set('nama_debitur', e.target.value)} required /></Field>
          <Field label="No. Rekening"><Input value={form.no_rekening} onChange={e => set('no_rekening', e.target.value)} /></Field>
          <Field label="No. HP"><Input value={form.no_hp} onChange={e => set('no_hp', e.target.value)} /></Field>
          <Field label="Alamat" full><Textarea value={form.alamat} onChange={e => set('alamat', e.target.value)} rows={2} /></Field>
        </Grid>
      </Section>

      {/* Data kredit */}
      <Section title="Data Kredit">
        <Grid>
          <Field label="Plafond"><CurrencyInput value={form.plafond} onChange={(v) => set('plafond', Number(v) || 0)} /></Field>
          <Field label="Baki Debet"><CurrencyInput value={form.baki_debet} onChange={(v) => set('baki_debet', Number(v) || 0)} /></Field>
          <Field label="Tunggakan Pokok"><CurrencyInput value={form.tunggakan_pokok} onChange={(v) => set('tunggakan_pokok', Number(v) || 0)} /></Field>
          <Field label="Tunggakan Bunga"><CurrencyInput value={form.tunggakan_bunga} onChange={(v) => set('tunggakan_bunga', Number(v) || 0)} /></Field>
          <Field label="Hari Tunggakan"><Input type="number" value={form.hari_tunggakan} onChange={e => set('hari_tunggakan', Number(e.target.value))} /></Field>
        </Grid>
      </Section>

      {/* Hasil kunjungan */}
      <Section title="Hasil Kunjungan & Kondisi">
        <Grid>
          <Field label="Kondisi Usaha" full><Textarea rows={2} value={form.kondisi_usaha} onChange={e => set('kondisi_usaha', e.target.value)} /></Field>
          <Field label="Kondisi Agunan" full><Textarea rows={2} value={form.kondisi_agunan} onChange={e => set('kondisi_agunan', e.target.value)} /></Field>
          <Field label="Hasil / Catatan Kunjungan" full><Textarea rows={3} value={form.hasil_kunjungan} onChange={e => set('hasil_kunjungan', e.target.value)} /></Field>
        </Grid>
      </Section>

      {/* Tindak lanjut */}
      <Section title="Rencana Tindak Lanjut & Komitmen Bayar">
        <Grid>
          <Field label="Rencana Tindak Lanjut" full><Textarea rows={2} value={form.rencana_tindak_lanjut} onChange={e => set('rencana_tindak_lanjut', e.target.value)} /></Field>
          <Field label="Komitmen Bayar (Nominal)"><CurrencyInput value={form.komitmen_bayar_nominal} onChange={(v) => set('komitmen_bayar_nominal', Number(v) || 0)} /></Field>
          <Field label="Komitmen Bayar (Tanggal)"><Input type="date" value={form.komitmen_bayar_tanggal} onChange={e => set('komitmen_bayar_tanggal', e.target.value)} /></Field>
        </Grid>
      </Section>

      {/* Foto */}
      <Section title="Foto Dokumentasi Kunjungan">
        <CloudImageUploader images={photos} onChange={setPhotos} maxImages={6} title="Foto Kunjungan" />
      </Section>

      {/* TTD */}
      <Section title="Tanda Tangan Berita Acara">
        <Grid>
          <Field label="Officer Relationship Kredit"><Input value={form.officer_nama} onChange={e => set('officer_nama', e.target.value)} placeholder="Nama Officer" /></Field>
          <Field label="Pimpinan KCP Telihan"><Input value={form.pimpinan_nama} onChange={e => set('pimpinan_nama', e.target.value)} placeholder="Nama Pimpinan" /></Field>
          <Field label="Kantor Cabang"><Input value={form.kantor_cabang} onChange={e => set('kantor_cabang', e.target.value)} /></Field>
        </Grid>
      </Section>

      <div className="flex justify-end gap-2 pb-6">
        <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Batal</Button>
        <Button type="submit" disabled={saving}><Save className="mr-2" size={16} />{saving ? 'Menyimpan...' : 'Simpan Kunjungan'}</Button>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-card">
      <h3 className="font-semibold mb-4 text-primary">{title}</h3>
      {children}
    </div>
  );
}
function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>;
}
function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? 'md:col-span-2 space-y-1.5' : 'space-y-1.5'}>
      <Label className="text-sm">{label}</Label>
      {children}
    </div>
  );
}