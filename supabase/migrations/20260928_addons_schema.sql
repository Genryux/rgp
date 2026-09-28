-- ==============================================================================
-- RGP Films & Studio - Add-ons / Additionals Schema Migration
-- Defines the public.addons table for studio add-ons and extra deliverables
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.addons (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title VARCHAR(150) NOT NULL,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index on created_at for fast chronological listing
CREATE INDEX IF NOT EXISTS idx_addons_created_at ON public.addons(created_at ASC);

-- Row Level Security (RLS)
ALTER TABLE public.addons ENABLE ROW LEVEL SECURITY;

-- Public can view all studio add-ons
CREATE POLICY "Public can view addons"
    ON public.addons FOR SELECT
    USING (true);

-- Authenticated Admin Policies (Full CRUD for studio administrator)
CREATE POLICY "Admin full access on addons"
    ON public.addons FOR ALL
    USING (auth.role() = 'authenticated');
