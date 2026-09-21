-- ==============================================================================
-- Migration: Dynamic Multi-Page CMS Support
-- Adds pages table and links sections to specific pages (defaults to 'home')
-- ==============================================================================

-- 1. Create Pages Table
CREATE TABLE IF NOT EXISTS public.pages (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title VARCHAR(150) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    is_published BOOLEAN DEFAULT true,
    meta_title TEXT,
    meta_description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Seed Default Home Page
INSERT INTO public.pages (id, title, slug, is_published, meta_title, meta_description)
VALUES (
    'page_home',
    'Home',
    'home',
    true,
    'RGP Films & Studio | Professional Photography & Videography Services',
    'Professional photography and videography services. Turning moments into masterpieces.'
)
ON CONFLICT (id) DO NOTHING;

-- 3. Add page association columns to sections table
ALTER TABLE public.sections 
ADD COLUMN IF NOT EXISTS page_id TEXT REFERENCES public.pages(id) ON DELETE CASCADE;

ALTER TABLE public.sections 
ADD COLUMN IF NOT EXISTS page_slug VARCHAR(100) DEFAULT 'home';

-- 4. Set existing sections to point to the home page
UPDATE public.sections 
SET page_id = 'page_home', page_slug = 'home' 
WHERE page_id IS NULL;

-- 5. Row Level Security (RLS) for Pages Table
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

DO 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'pages' AND policyname = 'Public can view published pages'
    ) THEN
        CREATE POLICY "Public can view published pages" 
            ON public.pages FOR SELECT 
            USING (is_published = true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'pages' AND policyname = 'Admin full access on pages'
    ) THEN
        CREATE POLICY "Admin full access on pages" 
            ON public.pages FOR ALL 
            USING (auth.role() = 'authenticated');
    END IF;
END ;
