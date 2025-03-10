/*
  # Update handle_new_user function to include full_name

  1. Changes
    - Modify the handle_new_user function to include full_name from user metadata
    - This ensures the full_name is properly saved to the profiles table on signup
*/

-- Update the handle_new_user function to include full_name from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;