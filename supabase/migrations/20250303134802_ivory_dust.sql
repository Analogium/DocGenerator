/*
  # Add function to delete user account

  1. New Functions
    - `delete_user_account` - A secure function to delete a user's account and all associated data
  
  2. Security
    - Function is marked as SECURITY DEFINER to run with elevated privileges
    - Only the authenticated user can delete their own account
*/

-- Create a function to handle user account deletion
CREATE OR REPLACE FUNCTION public.delete_user_account(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  calling_user_id UUID := auth.uid();
BEGIN
  -- Security check: ensure the user can only delete their own account
  IF calling_user_id IS NULL OR calling_user_id != user_id THEN
    RAISE EXCEPTION 'Unauthorized: You can only delete your own account';
  END IF;

  -- Delete the user's documents
  DELETE FROM public.documents WHERE user_id = user_id;
  
  -- Delete the user's profile
  DELETE FROM public.profiles WHERE id = user_id;
  
  -- Delete the user from auth.users (this will cascade to other auth tables)
  DELETE FROM auth.users WHERE id = user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;