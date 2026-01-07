-- Create taksasi table for storing appraisal data
CREATE TABLE public.taksasi (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nomor_dokumen TEXT NOT NULL,
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  jenis_agunan TEXT NOT NULL CHECK (jenis_agunan IN ('tanah', 'tanah_bangunan', 'kendaraan')),
  nama_debitur TEXT NOT NULL,
  alamat_debitur TEXT,
  no_rekening TEXT,
  no_hp TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'disetujui', 'ditolak')),
  detail_agunan JSONB NOT NULL DEFAULT '{}',
  dokumentasi TEXT[] DEFAULT '{}',
  nilai_pasar NUMERIC DEFAULT 0,
  nilai_taksasi NUMERIC DEFAULT 0,
  nilai_likuidasi NUMERIC DEFAULT 0,
  tim_penilai JSONB DEFAULT '{}',
  kantor_cabang TEXT,
  keterangan TEXT,
  marketability TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.taksasi ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own taksasi" 
ON public.taksasi 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own taksasi" 
ON public.taksasi 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own taksasi" 
ON public.taksasi 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own taksasi" 
ON public.taksasi 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_taksasi_updated_at
BEFORE UPDATE ON public.taksasi
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL,
  nama TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user', 'demo')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by authenticated users" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Trigger for profiles timestamp
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, nama, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data ->> 'nama', NEW.email),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'user')
  );
  RETURN NEW;
END;
$$;

-- Trigger for auto-creating profiles
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();