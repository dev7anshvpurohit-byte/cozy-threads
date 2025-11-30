-- Add phone_number column to profiles table
ALTER TABLE public.profiles ADD COLUMN phone_number text;

-- Update default city to Hyderabad for new profiles
ALTER TABLE public.profiles ALTER COLUMN city SET DEFAULT 'Hyderabad';