-- Add is_approved column to profiles table for admin authorization
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_approved boolean NOT NULL DEFAULT false;

-- Update existing users to be approved (so current users don't get locked out)
UPDATE public.profiles SET is_approved = true WHERE is_approved = false;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_is_approved ON public.profiles(is_approved);

-- Add policy for admins to update any profile's approval status
CREATE POLICY "Admins can update all profiles" 
ON public.profiles 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));