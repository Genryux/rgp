-- ==============================================================================
-- RGP Films & Studio - Complete Database Schema & Row Level Security (RLS)
-- Supports all 36 Page Builder Blocks across 9 Categories + CMS Modules
-- ==============================================================================

-- 1. SECTIONS TABLE (Dynamic Block-Based Page Builder)
-- Supported block types: 'navbar', 'hero', 'about', 'process', 'gear', 'text_block',
--                        'rates', 'testimonials', 'venues', 'video', 'before_after',
--                        'carousel', 'gallery_grid', 'instagram', 'footer', 'contact',
--                        'location_map', 'faq', 'cta', 'team'
CREATE TABLE IF NOT EXISTS public.sections (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    section_type VARCHAR(50) NOT NULL,
    label VARCHAR(150) NOT NULL,
    is_visible BOOLEAN DEFAULT true,
    sort_order INT NOT NULL DEFAULT 0,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. PACKAGES & RATES TABLE
CREATE TABLE IF NOT EXISTS public.packages (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    category VARCHAR(50) NOT NULL,     -- 'Weddings', 'Birthdays & Debuts', 'Portraits & Studio', etc.
    title VARCHAR(150) NOT NULL,       -- 'Gold Cinematic Wedding Package'
    price NUMERIC(10, 2) NOT NULL,      -- 25000.00
    promo_price NUMERIC(10, 2),         -- 22000.00 (Optional)
    badge VARCHAR(50),                 -- 'Most Popular', 'Best Value', 'Limited Slots'
    features JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of inclusion strings
    is_featured BOOLEAN DEFAULT false,  -- Highlighted badge/focus
    is_active BOOLEAN DEFAULT true,     -- Visible to visitors
    hide_price BOOLEAN DEFAULT false,   -- Mask price to 2?,??? on public views
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. GALLERY & MEDIA TABLE (Photos & Video Highlight Reels)
CREATE TABLE IF NOT EXISTS public.gallery (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    media_type VARCHAR(20) DEFAULT 'image', -- 'image' or 'video'
    category VARCHAR(50) NOT NULL,          -- 'Weddings', 'Portraits', 'Landscapes', 'Commercial', etc.
    title VARCHAR(150),                     -- File name or caption
    image_url TEXT NOT NULL,                -- Supabase Storage CDN URL or embed URL
    thumbnail_url TEXT,                     -- Optional smaller preview URL
    file_size_bytes BIGINT DEFAULT 0,       -- WebP file size in bytes
    is_featured BOOLEAN DEFAULT false,      -- Shown in top hero carousel
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. INQUIRIES & LEADS TABLE (Contact & Booking Submissions)
CREATE TABLE IF NOT EXISTS public.inquiries (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(50),
    event_type VARCHAR(50),                 -- 'Wedding', 'Birthday', 'Debut', 'Portrait Session', 'Other'
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
    address TEXT DEFAULT 'Metro Manila, Philippines',
    facebook_url TEXT,
    instagram_url TEXT,
    youtube_url TEXT,
    tiktok_url TEXT,
    theme_accent_color VARCHAR(20) DEFAULT '#FFD700',
    meta_title TEXT DEFAULT 'RGP Films & Studio | Professional Photography & Videography Services',
    meta_description TEXT DEFAULT 'Professional photography and videography services for weddings, events, portraits, and commercial projects.',
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. MEDIA FOLDERS & ALBUMS TABLE
CREATE TABLE IF NOT EXISTS public.media_folders (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- DEFAULT SEED DATA
-- ==============================================================================

-- Default Global Settings
INSERT INTO public.site_settings (id, studio_name, tagline, contact_email, contact_phone, address, facebook_url)
VALUES (
    'global',
    'RGP Films & Studio',
    'Turning Moments into Masterpiece.',
    'contact@rgpfilmsstudio.site',
    '+63 900 000 0000',
    'Metro Manila, Philippines',
    'https://www.facebook.com/profile.php?id=61586681783932'
) ON CONFLICT (id) DO NOTHING;

-- Default Media Folders
INSERT INTO public.media_folders (name) VALUES
    ('Weddings'),
    ('Birthdays'),
    ('Debuts'),
    ('Portraits'),
    ('Graduation'),
    ('Landscapes'),
    ('Commercial'),
    ('General')
ON CONFLICT (name) DO NOTHING;

-- Default Packages
INSERT INTO public.packages (id, category, title, price, promo_price, badge, features, is_featured, is_active, hide_price, sort_order)
VALUES
(
    'pkg_1',
    'Weddings',
    'Silver Wedding Package',
    15000.00,
    NULL,
    NULL,
    '["1 Professional Photographer", "4 Hours Continuous Coverage", "150 Enhanced Digital High-Res Photos", "Online Private Gallery Access", "USB Flash Drive with all RAW + JPEG files"]'::jsonb,
    false,
    true,
    false,
    1
),
(
    'pkg_2',
    'Weddings',
    'Gold Cinematic Wedding Package',
    25000.00,
    22000.00,
    'Most Popular',
    '["2 Photographers + 1 Videographer", "Full Day Coverage (Prep to Reception)", "300+ Enhanced High-Res Photos", "3-5 Minute 4K Cinematic Highlight Reel", "Same Day Edit (SDE) Teaser", "12x12 Premium Leather Photo Album"]'::jsonb,
    false,
    true,
    false,
    2
),
(
    'pkg_3',
    'Birthdays & Debuts',
    'Grand Debut Celebration',
    18000.00,
    NULL,
    'Best Value',
    '["2 Photographers", "Pre-Debut Creative Photoshoot included", "Full Event Photo Coverage", "200+ Enhanced Photos", "Soft copies delivered in high resolution"]'::jsonb,
    false,
    true,
    false,
    3
),
(
    'pkg_4',
    'Portraits & Studio',
    'Studio Creative & Portrait Session',
    5000.00,
    NULL,
    NULL,
    '["1.5 Hours Studio Time", "Up to 3 Wardrobe Changes", "15 Fully Retouched Magazine-Quality Photos", "High-Resolution Digital Downloads"]'::jsonb,
    false,
    true,
    false,
    4
)
ON CONFLICT (id) DO NOTHING;

-- Default Page Builder Sections
INSERT INTO public.sections (id, section_type, label, is_visible, sort_order, content)
VALUES
(
    'sec_navbar',
    'navbar',
    'Navigation Bar',
    true,
    1,
    '{"variant": "floating", "cta_text": "Book Now"}'::jsonb
),
(
    'sec_hero',
    'hero',
    'Hero Banner',
    true,
    2,
    '{"variant": "editorial", "heading_line1": "Turning", "heading_accent1": "Moments", "heading_line2": "into", "heading_accent2": "Masterpiece.", "subheading": "Professional photography and videography services. Book your session today.", "bg_image": "/images/hero-bg.jpg", "cta_text": "BOOK A SESSION", "cta_link": "#contact"}'::jsonb
),
(
    'sec_carousel',
    'carousel',
    'Showcase Carousel',
    true,
    3,
    '{"title": "Featured Works", "subtitle": "Explore our latest wedding, portrait, and commercial highlights", "show_dots": true, "show_tabs": true}'::jsonb
),
(
    'sec_video',
    'video',
    'Cinematic Highlights',
    true,
    4,
    '{"title": "Cinematic Highlights", "subtitle": "Relive the most memorable moments captured on film", "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "caption": "Wedding & Event Cinematic Highlight Reel"}'::jsonb
),
(
    'sec_rates',
    'rates',
    'Services & Packages',
    true,
    5,
    '{"variant": "pricing_tiered", "title": "Packages & Rates", "subtitle": "Tailored packages crafted for every milestone and celebration"}'::jsonb
),
(
    'sec_about',
    'about',
    'About Studio',
    true,
    6,
    '{"title": "Behind the Lens", "subtitle": "Passionate visual storytellers dedicated to preserving your moments forever.", "experience_years": "5+", "events_covered": "250+", "satisfaction_rate": "100%", "image_url": "/images/main-shot.jpg"}'::jsonb
),
(
    'sec_contact',
    'contact',
    'Contact & Booking',
    true,
    7,
    '{"title": "Let’s Create Magic Together", "subtitle": "Have a date in mind? Send us an inquiry and we’ll get back to you within 24 hours."}'::jsonb
),
(
    'sec_footer',
    'footer',
    'Studio Footer',
    true,
    8,
    '{"variant": "multi_column", "tagline": "Turning Moments into Masterpiece. Premium wedding cinematography, portraits, and commercial visual production."}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- Default Gallery Items
INSERT INTO public.gallery (id, media_type, category, title, image_url, file_size_bytes, is_featured, sort_order)
VALUES
    ('gal_1', 'image', 'Weddings', '1.jpg', '/images/1.jpg', 380000, true, 1),
    ('gal_2', 'image', 'Portraits', '2.jpg', '/images/2.jpg', 420000, true, 2),
    ('gal_3', 'image', 'Birthdays', '3.jpg', '/images/3.jpg', 350000, true, 3),
    ('gal_4', 'image', 'Graduation', '4.jpg', '/images/4.jpg', 310000, true, 4),
    ('gal_5', 'image', 'Landscapes', '5.jpg', '/images/5.jpg', 490000, true, 5),
    ('gal_6', 'image', 'Commercial', '6.jpg', '/images/6.jpg', 290000, true, 6)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_folders ENABLE ROW LEVEL SECURITY;
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

CREATE POLICY "Public can view media folders" 
    ON public.media_folders FOR SELECT 
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

CREATE POLICY "Admin full access on media folders" 
    ON public.media_folders FOR ALL 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access on inquiries" 
    ON public.inquiries FOR ALL 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access on site settings" 
    ON public.site_settings FOR ALL 
    USING (auth.role() = 'authenticated');

-- ==============================================================================
-- STORAGE BUCKET & POLICIES ('portfolio')
-- ==============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio', 'portfolio', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Public read access to portfolio assets
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public can view portfolio assets'
    ) THEN
        CREATE POLICY "Public can view portfolio assets"
            ON storage.objects FOR SELECT
            USING (bucket_id = 'portfolio');
    END IF;
END $$;

-- Admin upload & manage access to portfolio assets
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admin can upload portfolio assets'
    ) THEN
        CREATE POLICY "Admin can upload portfolio assets"
            ON storage.objects FOR INSERT
            WITH CHECK (bucket_id = 'portfolio' AND auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admin can update portfolio assets'
    ) THEN
        CREATE POLICY "Admin can update portfolio assets"
            ON storage.objects FOR UPDATE
            USING (bucket_id = 'portfolio' AND auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admin can delete portfolio assets'
    ) THEN
        CREATE POLICY "Admin can delete portfolio assets"
            ON storage.objects FOR DELETE
            USING (bucket_id = 'portfolio' AND auth.role() = 'authenticated');
    END IF;
END $$;
