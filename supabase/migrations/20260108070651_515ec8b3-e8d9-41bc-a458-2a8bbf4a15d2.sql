-- Fix handle_new_user() to prevent role injection from user-controlled metadata
-- Always default new users to 'user' role and sanitize nama input

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _nama text;
BEGIN
  -- Sanitize and limit nama input from user metadata
  _nama := COALESCE(
    LEFT(TRIM(NEW.raw_user_meta_data ->> 'nama'), 100), -- Limit to 100 chars
    NEW.email
  );
  
  -- Insert profile with validated data
  -- Always default role to 'user' - never trust user-supplied role
  INSERT INTO public.profiles (user_id, email, nama, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    _nama,
    'user'  -- Always default to 'user', never from metadata
  );
  
  -- Insert role - always 'user' for new signups
  -- Admin roles must be assigned by existing admin through secure interface
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id, 
    'user'::app_role  -- Never read from metadata
  );
  
  RETURN NEW;
END;
$$;