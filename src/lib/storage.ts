import { supabase } from '@/integrations/supabase/client';

export interface UploadResult {
  url: string;
  path: string;
  size: number;
}

export interface StorageStats {
  used_bytes: number;
  total_bytes: number;
  used_mb: number;
  total_mb: number;
  percentage: number;
  total_files: number;
  draft_files: number;
  selesai_files: number;
}

export async function uploadDokumentasi(file: File, taksasiId?: string): Promise<UploadResult> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Not authenticated');
  }

  const formData = new FormData();
  formData.append('file', file);
  if (taksasiId) {
    formData.append('taksasi_id', taksasiId);
  }

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-dokumentasi`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Upload failed');
  }

  return response.json();
}

export async function uploadMultipleDokumentasi(
  files: File[], 
  taksasiId?: string
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];
  
  for (const file of files) {
    try {
      const result = await uploadDokumentasi(file, taksasiId);
      results.push(result);
    } catch (error) {
      console.error('Failed to upload file:', file.name, error);
      throw error;
    }
  }
  
  return results;
}

export async function getStorageStats(): Promise<StorageStats> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/storage-stats`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to get storage stats');
  }

  return response.json();
}
