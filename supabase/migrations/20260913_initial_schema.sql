-- ==============================================================================
-- RGP Films & Studio - Complete Database Schema & Row Level Security (RLS)
-- ==============================================================================

-- 1. SECTIONS TABLE (Dynamic Block-Based Page Builder)
CREATE TABLE IF NOT EXISTS public.sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_type VARCHAR(50) NOT NULL, -- 'hero', 'carousel', 'gallery_grid', 'video', 'rates', 'about', 'text_block', 'testimonials', 'faq', 'cta', 'contact'
    label VARCHAR(100) NOT NULL,       -- e.g. "Main Hero Showcase", "Wedding Highlights"
    is_visible BOOLEAN DEFAULT true,
    sort_order INT NOT NULL DEFAULT 0,
    content JSONB NOT NULL DEFAULT '{}'::jsonb, -- Flexible JSON for all block settings
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. PACKAGES & RATES TABLE
CREATE TABLE IF NOT EXISTS public.packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(50) NOT NULL,     -- 'Wedding', 'Birthday', 'Debut', 'Portrait', 'Graduation', etc.
    title VARCHAR(100) NOT NULL,        -- 'Gold Cinematic Wedding Package'
    price NUMERIC(10, 2) NOT NULL,      -- e.g. 25000.00
    promo_price NUMERIC(10, 2),         -- e.g. 20000.00 (Optional)
    badge VARCHAR(50),                 -- 'Most Popular', 'Best Value', 'Limited Slots'
    features JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of strings: ["2 Photographers", "100 Edited Photos"]
    is_featured BOOLEAN DEFAULT false,  -- Highlighted on homepage
    is_active BOOLEAN DEFAULT true,     -- Visible to visitors
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. GALLERY & MEDIA TABLE (Photos & Video Highlight Reels)
CREATE TABLE IF NOT EXISTS public.gallery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    media_type VARCHAR(20) DEFAULT 'image', -- 'image' or 'video'
    category VARCHAR(50) NOT NULL,          -- 'Weddings', 'Portraits', 'Landscapes', 'Commercial', etc.
    title VARCHAR(150),                     -- Title or Caption
    image_url TEXT NOT NULL,                -- Supabase Storage CDN URL or YouTube/Vimeo Embed URL
    thumbnail_url TEXT,                     -- Optional smaller preview URL
    is_featured BOOLEAN DEFAULT false,      -- Shown in top hero carousel
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. INQUIRIES & LEADS TABLE (Contact Form Submissions)
CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(50),
    event_type VARCHAR(50),                 -- 'Wedding', 'Birthday', 'Portrait Session', 'Other'
    event_date DATE,                        -- Requested event date
    message TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'New',       -- 'New', 'Contacted', 'Booked', 'Completed', 'Archived'
    internal_notes TEXT,                    -- Private notes added in Admin CMS
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. SITE SETTINGS TABLE (Branding, SEO & Social Links)
CREATE TABLE IF NOT EXISTS public.site_settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'global',
    studio_name VARCHAR(100) DEFAULT 'RGP Films & Studio',
    tagline VARCHAR(200) DEFAULT 'Turning Moments into Masterpiece.',
    contact_email VARCHAR(150),
    contact_phone VARCHAR(50),
    address TEXT,
    facebook_url TEXT,
    instagram_url TEXT,
    youtube_url TEXT,
    tiktok_url TEXT,
    theme_accent_color VARCHAR(20) DEFAULT '#FFD700',
    meta_title TEXT DEFAULT 'RGP Films & Studio | Professional Photography & Videography Services',
    meta_description TEXT DEFAULT 'Professional photography and videography services for weddings, events, portraits, and commercial projects.',
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert Default Global Settings Row
INSERT INTO public.site_settings (id, studio_name, tagline, contact_email, contact_phone, facebook_url)
VALUES (
    'global',
    'RGP Films & Studio',
    'Turning Moments into Masterpiece.',
    'contact@rgpfilmsstudio.site',
    '+63 900 000 0000',
    'https://www.facebook.com/profile.php?id=61586681783932'
) ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 1. PUBLIC VISITOR POLICIES (Read-only on published content, Insert on inquiries)
CREATE POLICY "Public can view visible sections" 
    ON public.sections FOR SELECT 
    USING (is_visible = true);

CREATE POLICY "Public can view active packages" 
    ON public.packages FOR SELECT 
    USING (is_active = true);

CREATE POLICY "Public can view gallery media" 
    ON public.gallery FOR SELECT 
    USING (true);

CREATE POLICY "Public can view site settings" 
    ON public.site_settings FOR SELECT 
    USING (true);

CREATE POLICY "Public can submit contact inquiries" 
    ON public.inquiries FOR INSERT 
    WITH CHECK (true);

-- 2. AUTHENTICATED ADMIN POLICIES (Full CRUD access for studio owner)
CREATE POLICY "Admin full access on sections" 
    ON public.sections FOR ALL 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access on packages" 
    ON public.packages FOR ALL 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access on gallery" 
    ON public.gallery FOR ALL 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access on inquiries" 
    ON public.inquiries FOR ALL 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access on site settings" 
    ON public.site_settings FOR ALL 
    USING (auth.role() = 'authenticated');
