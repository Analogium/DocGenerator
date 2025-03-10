/*
  # Fix delete_user_account function

  1. Changes
     - Fix ambiguous column reference in delete_user_account function
     - Rename parameter to avoid conflict with column names
*/

-- Create a function to handle user account deletion with fixed parameter name
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