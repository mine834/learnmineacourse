-- Run once in Supabase SQL Editor before saving short descriptions.
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS short_description text;
