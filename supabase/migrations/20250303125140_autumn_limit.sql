/*
  # Update profiles table to ensure full_name is properly stored

  1. Changes
    - Add a trigger to update the profiles table when a user's metadata is updated
    - This ensures the full_name in profiles stays in sync with auth.users metadata
*/

-- Create a function to handle user metadata updates
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET 
    full_name = NEW.raw_user_meta_data->>'full_name',
    updated_at = now()
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to update profile when user metadata changes
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.raw_user_meta_data->>'full_name' IS DISTINCT FROM NEW.raw_user_meta_data->>'full_name')
  EXECUTE FUNCTION public.handle_user_update();