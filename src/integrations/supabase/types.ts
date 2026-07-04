export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      cron_job_logs: {
        Row: {
          details: Json | null
          executed_at: string
          id: string
          job_name: string
          status: string
        }
        Insert: {
          details?: Json | null
          executed_at?: string
          id?: string
          job_name: string
          status?: string
        }
        Update: {
          details?: Json | null
          executed_at?: string
          id?: string
          job_name?: string
          status?: string
        }
        Relationships: []
      }
      mlf_snapshot: {
        Row: {
          baki: number | null
          brname: string | null
          date_mature: string | null
          date_mulai: string | null
          id: string
          jobdate: string | null
          kol: string | null
          l0lnno: string | null
          l0name: string | null
          l0narr: string | null
          l0rstl: string | null
          lytitl: string | null
          pla: number | null
          tungbg: number | null
          tungpk: number | null
          uploaded_at: string
          uploaded_by: string | null
        }
        Insert: {
          baki?: number | null
          brname?: string | null
          date_mature?: string | null
          date_mulai?: string | null
          id?: string
          jobdate?: string | null
          kol?: string | null
          l0lnno?: string | null
          l0name?: string | null
          l0narr?: string | null
          l0rstl?: string | null
          lytitl?: string | null
          pla?: number | null
          tungbg?: number | null
          tungpk?: number | null
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Update: {
          baki?: number | null
          brname?: string | null
          date_mature?: string | null
          date_mulai?: string | null
          id?: string
          jobdate?: string | null
          kol?: string | null
          l0lnno?: string | null
          l0name?: string | null
          l0narr?: string | null
          l0rstl?: string | null
          lytitl?: string | null
          pla?: number | null
          tungbg?: number | null
          tungpk?: number | null
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      monitoring_jadwal: {
        Row: {
          created_at: string
          id: string
          jam_rencana: string | null
          kategori: Database["public"]["Enums"]["kategori_kunjungan"]
          keterangan: string | null
          nama_debitur: string
          no_loan: string | null
          status: Database["public"]["Enums"]["jadwal_status"]
          tanggal_rencana: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          jam_rencana?: string | null
          kategori?: Database["public"]["Enums"]["kategori_kunjungan"]
          keterangan?: string | null
          nama_debitur: string
          no_loan?: string | null
          status?: Database["public"]["Enums"]["jadwal_status"]
          tanggal_rencana: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          jam_rencana?: string | null
          kategori?: Database["public"]["Enums"]["kategori_kunjungan"]
          keterangan?: string | null
          nama_debitur?: string
          no_loan?: string | null
          status?: Database["public"]["Enums"]["jadwal_status"]
          tanggal_rencana?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      monitoring_kunjungan: {
        Row: {
          alamat: string | null
          baki_debet: number | null
          created_at: string
          foto_kunjungan: string[] | null
          hari_tunggakan: number | null
          hasil_kunjungan: string | null
          id: string
          jam_kunjungan: string | null
          kantor_cabang: string | null
          kategori: Database["public"]["Enums"]["kategori_kunjungan"]
          komitmen_bayar_nominal: number | null
          komitmen_bayar_tanggal: string | null
          kondisi_agunan: string | null
          kondisi_usaha: string | null
          nama_debitur: string
          no_hp: string | null
          no_loan: string | null
          nomor_ba: string | null
          officer_nama: string | null
          pimpinan_nama: string | null
          plafond: number | null
          rencana_tindak_lanjut: string | null
          status: Database["public"]["Enums"]["monitoring_status"]
          taksasi_id: string | null
          tanggal_kunjungan: string
          tujuan_kunjungan: string | null
          tunggakan_bunga: number | null
          tunggakan_pokok: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          alamat?: string | null
          baki_debet?: number | null
          created_at?: string
          foto_kunjungan?: string[] | null
          hari_tunggakan?: number | null
          hasil_kunjungan?: string | null
          id?: string
          jam_kunjungan?: string | null
          kantor_cabang?: string | null
          kategori: Database["public"]["Enums"]["kategori_kunjungan"]
          komitmen_bayar_nominal?: number | null
          komitmen_bayar_tanggal?: string | null
          kondisi_agunan?: string | null
          kondisi_usaha?: string | null
          nama_debitur: string
          no_hp?: string | null
          no_loan?: string | null
          nomor_ba?: string | null
          officer_nama?: string | null
          pimpinan_nama?: string | null
          plafond?: number | null
          rencana_tindak_lanjut?: string | null
          status?: Database["public"]["Enums"]["monitoring_status"]
          taksasi_id?: string | null
          tanggal_kunjungan?: string
          tujuan_kunjungan?: string | null
          tunggakan_bunga?: number | null
          tunggakan_pokok?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          alamat?: string | null
          baki_debet?: number | null
          created_at?: string
          foto_kunjungan?: string[] | null
          hari_tunggakan?: number | null
          hasil_kunjungan?: string | null
          id?: string
          jam_kunjungan?: string | null
          kantor_cabang?: string | null
          kategori?: Database["public"]["Enums"]["kategori_kunjungan"]
          komitmen_bayar_nominal?: number | null
          komitmen_bayar_tanggal?: string | null
          kondisi_agunan?: string | null
          kondisi_usaha?: string | null
          nama_debitur?: string
          no_hp?: string | null
          no_loan?: string | null
          nomor_ba?: string | null
          officer_nama?: string | null
          pimpinan_nama?: string | null
          plafond?: number | null
          rencana_tindak_lanjut?: string | null
          status?: Database["public"]["Enums"]["monitoring_status"]
          taksasi_id?: string | null
          tanggal_kunjungan?: string
          tujuan_kunjungan?: string | null
          tunggakan_bunga?: number | null
          tunggakan_pokok?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monitoring_kunjungan_taksasi_id_fkey"
            columns: ["taksasi_id"]
            isOneToOne: false
            referencedRelation: "taksasi"
            referencedColumns: ["id"]
          },
        ]
      }
      pl_to_npl_item: {
        Row: {
          alasan_npl: string | null
          baki_debet: number | null
          cabang: string | null
          created_at: string
          id: string
          jenis_kredit: string | null
          kolektabilitas: string | null
          laporan_id: string
          nama_debitur: string | null
          no_loan: string | null
          no_pk: string | null
          no_rekening: string | null
          plafon: number | null
          proyeksi_tw: string | null
          tanggal_mature: string | null
          tanggal_mulai: string | null
          tunggakan_bunga: number | null
          tunggakan_pokok: number | null
          updated_at: string
          urutan: number
        }
        Insert: {
          alasan_npl?: string | null
          baki_debet?: number | null
          cabang?: string | null
          created_at?: string
          id?: string
          jenis_kredit?: string | null
          kolektabilitas?: string | null
          laporan_id: string
          nama_debitur?: string | null
          no_loan?: string | null
          no_pk?: string | null
          no_rekening?: string | null
          plafon?: number | null
          proyeksi_tw?: string | null
          tanggal_mature?: string | null
          tanggal_mulai?: string | null
          tunggakan_bunga?: number | null
          tunggakan_pokok?: number | null
          updated_at?: string
          urutan?: number
        }
        Update: {
          alasan_npl?: string | null
          baki_debet?: number | null
          cabang?: string | null
          created_at?: string
          id?: string
          jenis_kredit?: string | null
          kolektabilitas?: string | null
          laporan_id?: string
          nama_debitur?: string | null
          no_loan?: string | null
          no_pk?: string | null
          no_rekening?: string | null
          plafon?: number | null
          proyeksi_tw?: string | null
          tanggal_mature?: string | null
          tanggal_mulai?: string | null
          tunggakan_bunga?: number | null
          tunggakan_pokok?: number | null
          updated_at?: string
          urutan?: number
        }
        Relationships: [
          {
            foreignKeyName: "pl_to_npl_item_laporan_id_fkey"
            columns: ["laporan_id"]
            isOneToOne: false
            referencedRelation: "pl_to_npl_laporan"
            referencedColumns: ["id"]
          },
        ]
      }
      pl_to_npl_laporan: {
        Row: {
          created_at: string
          created_by: string
          id: string
          mlf_jobdate: string | null
          nama_pemimpin: string | null
          periode: string
          tanggal_laporan: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          mlf_jobdate?: string | null
          nama_pemimpin?: string | null
          periode: string
          tanggal_laporan?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          mlf_jobdate?: string | null
          nama_pemimpin?: string | null
          periode?: string
          tanggal_laporan?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          is_approved: boolean
          nama: string | null
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id?: string
          is_approved?: boolean
          nama?: string | null
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          is_approved?: boolean
          nama?: string | null
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      storage_files: {
        Row: {
          created_at: string
          file_path: string
          file_size: number
          id: string
          taksasi_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          file_path: string
          file_size?: number
          id?: string
          taksasi_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          file_path?: string
          file_size?: number
          id?: string
          taksasi_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "storage_files_taksasi_id_fkey"
            columns: ["taksasi_id"]
            isOneToOne: false
            referencedRelation: "taksasi"
            referencedColumns: ["id"]
          },
        ]
      }
      subrogasi_debitur: {
        Row: {
          asuransi: string
          created_at: string
          created_by: string | null
          id: string
          nama_cabang: string | null
          nama_debitur: string
          nik: string | null
          nilai_subrogasi: number
          no_loan: string
          no_perjanjian_kredit: string | null
          no_premi_asuransi: string | null
          produk: string | null
          tahun_pencairan: number | null
          updated_at: string
        }
        Insert: {
          asuransi?: string
          created_at?: string
          created_by?: string | null
          id?: string
          nama_cabang?: string | null
          nama_debitur: string
          nik?: string | null
          nilai_subrogasi?: number
          no_loan: string
          no_perjanjian_kredit?: string | null
          no_premi_asuransi?: string | null
          produk?: string | null
          tahun_pencairan?: number | null
          updated_at?: string
        }
        Update: {
          asuransi?: string
          created_at?: string
          created_by?: string | null
          id?: string
          nama_cabang?: string | null
          nama_debitur?: string
          nik?: string | null
          nilai_subrogasi?: number
          no_loan?: string
          no_perjanjian_kredit?: string | null
          no_premi_asuransi?: string | null
          produk?: string | null
          tahun_pencairan?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      subrogasi_laporan: {
        Row: {
          created_at: string
          created_by: string
          id: string
          nama_kantor: string
          nama_pemimpin: string | null
          periode: string
          tanggal_laporan: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          nama_kantor?: string
          nama_pemimpin?: string | null
          periode: string
          tanggal_laporan?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          nama_kantor?: string
          nama_pemimpin?: string | null
          periode?: string
          tanggal_laporan?: string
          updated_at?: string
        }
        Relationships: []
      }
      subrogasi_laporan_item: {
        Row: {
          akumulasi_pembayaran: number
          created_at: string
          debitur_id: string
          hasil_kesepakatan: string | null
          id: string
          konfirmasi_asuransi: string | null
          konfirmasi_cabang: string | null
          laporan_id: string
          sisa_subrogasi: number
          tanggal_pembayaran: string | null
          updated_at: string
          urutan: number
        }
        Insert: {
          akumulasi_pembayaran?: number
          created_at?: string
          debitur_id: string
          hasil_kesepakatan?: string | null
          id?: string
          konfirmasi_asuransi?: string | null
          konfirmasi_cabang?: string | null
          laporan_id: string
          sisa_subrogasi?: number
          tanggal_pembayaran?: string | null
          updated_at?: string
          urutan?: number
        }
        Update: {
          akumulasi_pembayaran?: number
          created_at?: string
          debitur_id?: string
          hasil_kesepakatan?: string | null
          id?: string
          konfirmasi_asuransi?: string | null
          konfirmasi_cabang?: string | null
          laporan_id?: string
          sisa_subrogasi?: number
          tanggal_pembayaran?: string | null
          updated_at?: string
          urutan?: number
        }
        Relationships: [
          {
            foreignKeyName: "subrogasi_laporan_item_debitur_id_fkey"
            columns: ["debitur_id"]
            isOneToOne: false
            referencedRelation: "subrogasi_debitur"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subrogasi_laporan_item_laporan_id_fkey"
            columns: ["laporan_id"]
            isOneToOne: false
            referencedRelation: "subrogasi_laporan"
            referencedColumns: ["id"]
          },
        ]
      }
      subrogasi_pembayaran: {
        Row: {
          created_at: string
          id: string
          item_id: string
          jumlah_pembayaran: number
          keterangan: string | null
          tanggal_pembayaran: string | null
          updated_at: string
          urutan: number
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          jumlah_pembayaran?: number
          keterangan?: string | null
          tanggal_pembayaran?: string | null
          updated_at?: string
          urutan?: number
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          jumlah_pembayaran?: number
          keterangan?: string | null
          tanggal_pembayaran?: string | null
          updated_at?: string
          urutan?: number
        }
        Relationships: [
          {
            foreignKeyName: "subrogasi_pembayaran_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "subrogasi_laporan_item"
            referencedColumns: ["id"]
          },
        ]
      }
      taksasi: {
        Row: {
          alamat_debitur: string | null
          created_at: string
          detail_agunan: Json
          dokumentasi: string[] | null
          id: string
          jenis_agunan: string
          kantor_cabang: string | null
          keterangan: string | null
          marketability: string | null
          nama_debitur: string
          nilai_likuidasi: number | null
          nilai_pasar: number | null
          nilai_taksasi: number | null
          no_hp: string | null
          no_rekening: string | null
          nomor_dokumen: string
          status: string
          tanggal: string
          tim_penilai: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          alamat_debitur?: string | null
          created_at?: string
          detail_agunan?: Json
          dokumentasi?: string[] | null
          id?: string
          jenis_agunan: string
          kantor_cabang?: string | null
          keterangan?: string | null
          marketability?: string | null
          nama_debitur: string
          nilai_likuidasi?: number | null
          nilai_pasar?: number | null
          nilai_taksasi?: number | null
          no_hp?: string | null
          no_rekening?: string | null
          nomor_dokumen: string
          status?: string
          tanggal?: string
          tim_penilai?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          alamat_debitur?: string | null
          created_at?: string
          detail_agunan?: Json
          dokumentasi?: string[] | null
          id?: string
          jenis_agunan?: string
          kantor_cabang?: string | null
          keterangan?: string | null
          marketability?: string | null
          nama_debitur?: string
          nilai_likuidasi?: number | null
          nilai_pasar?: number | null
          nilai_taksasi?: number | null
          no_hp?: string | null
          no_rekening?: string | null
          nomor_dokumen?: string
          status?: string
          tanggal?: string
          tim_penilai?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      trigger_monthly_report: { Args: never; Returns: undefined }
      trigger_monthly_report_with_logging: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "user" | "demo"
      jadwal_status: "scheduled" | "done" | "canceled"
      kategori_kunjungan: "prospek" | "aktif" | "menunggak" | "restrukturisasi"
      monitoring_status: "draft" | "final"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user", "demo"],
      jadwal_status: ["scheduled", "done", "canceled"],
      kategori_kunjungan: ["prospek", "aktif", "menunggak", "restrukturisasi"],
      monitoring_status: ["draft", "final"],
    },
  },
} as const
