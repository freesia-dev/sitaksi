-- Create storage bucket for dokumentasi
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('dokumentasi', 'dokumentasi', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

-- Create tracking table for storage files
CREATE TABLE public.storage_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_path TEXT NOT NULL UNIQUE,
  file_size BIGINT NOT NULL DEFAULT 0,
  taksasi_id UUID REFERENCES public.taksasi(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.storage_files ENABLE ROW LEVEL SECURITY;

-- RLS policies for storage_files
CREATE POLICY "Users can view all storage files" 
ON public.storage_files 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert their own storage files" 
ON public.storage_files 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own storage files" 
ON public.storage_files 
FOR DELETE 
USING (auth.uid() = user_id);

-- Storage policies for dokumentasi bucket
CREATE POLICY "Anyone can view dokumentasi" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'dokumentasi');

CREATE POLICY "Authenticated users can upload dokumentasi" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'dokumentasi' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their dokumentasi" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'dokumentasi' AND auth.uid() IS NOT NULL);

-- Create index for efficient queries
CREATE INDEX idx_storage_files_taksasi_id ON public.storage_files(taksasi_id);
CREATE INDEX idx_storage_files_created_at ON public.storage_files(created_at);