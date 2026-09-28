-- ==============================================================================
-- RGP Films & Studio - Inquiries Table Schema Enhancement
-- Adds support for storing attached package, deliverables, and add-ons metadata
-- ==============================================================================

ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS package_name VARCHAR(150);
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS package_price NUMERIC(10, 2);
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS package_inclusions JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS addons JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS addons_total NUMERIC(10, 2) DEFAULT 0.00;
