/*
  # Create avatar storage bucket and update profile functions

  1. Storage
    - Create a storage bucket for user avatars
    - Set up appropriate RLS policies for the bucket

  2. Profile Updates
    - Update the handle_user_update function to include avatar_url updates
*/

-- Create a storage bucket for user avatars if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the avatars bucket
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Update the handle_user_update function to include avatar_url
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET 
    full_name = NEW.raw_user_meta_data->>'full_name',
    avatar_url = NEW.raw_user_meta_data->>'avatar_url',
    updated_at = now()
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the delete_user_account function to fix the ambiguous column reference
CREATE OR REPLACE FUNCTION public.delete_user_account(target_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  calling_user_id UUID := auth.uid();
BEGIN
  -- Security check: ensure the user can only delete their own account
  IF calling_user_id IS NULL OR calling_user_id != target_user_id THEN
    RAISE EXCEPTION 'Unauthorized: You can only delete your own account';
  END IF;

  -- Delete the user's documents
  DELETE FROM public.documents WHERE user_id = target_user_id;
  
  -- Delete the user's profile
  DELETE FROM public.profiles WHERE id = target_user_id;
  
  -- Delete the user from auth.users (this will cascade to other auth tables)
  DELETE FROM auth.users WHERE id = target_user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;