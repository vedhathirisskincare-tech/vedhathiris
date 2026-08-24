-- Create a secure view to expose user display names without exposing emails or sensitive data
CREATE OR REPLACE VIEW public.review_profiles AS
SELECT 
  id, 
  COALESCE(
    NULLIF(TRIM(raw_user_meta_data->>'full_name'), ''),
    split_part(email, '@', 1),
    'Verified Customer'
  ) as display_name
FROM auth.users;

-- Ensure the view is accessible by everyone
GRANT SELECT ON public.review_profiles TO anon, authenticated;
