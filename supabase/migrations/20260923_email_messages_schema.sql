-- ==============================================================================
-- RGP Films & Studio - Email Messages & Gmail Sync Schema Migration
-- Matches email_drafting.json specification
-- ==============================================================================

-- 1. MESSAGES TABLE (Synced Gmail and Studio Outbound Messages)
CREATE TABLE IF NOT EXISTS public.messages (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    inquiry_id TEXT REFERENCES public.inquiries(id) ON DELETE CASCADE,
    gmail_message_id VARCHAR(150) UNIQUE,          -- Gmail message ID identity key
    gmail_thread_id VARCHAR(150),                 -- Gmail thread ID for conversation grouping
    sender VARCHAR(20) NOT NULL DEFAULT 'client',    -- 'client' or 'studio'
    sender_name VARCHAR(150) NOT NULL,
    sender_email VARCHAR(150) NOT NULL,
    recipient VARCHAR(150) NOT NULL,
    subject VARCHAR(300),
    body TEXT NOT NULL,                           -- Formatted message body (HTML supported)
    attachments JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of attachment metadata
    received_at TIMESTAMPTZ DEFAULT now(),
    read BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast thread and inquiry lookups
CREATE INDEX IF NOT EXISTS idx_messages_inquiry_id ON public.messages(inquiry_id);
CREATE INDEX IF NOT EXISTS idx_messages_gmail_thread_id ON public.messages(gmail_thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at ASC);

-- 2. GMAIL SYNC & OAUTH CONNECTION TABLE
CREATE TABLE IF NOT EXISTS public.gmail_sync_state (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'studio_sync',
    connected_email VARCHAR(150),                 -- Studio's connected Gmail address
    refresh_token TEXT,                           -- OAuth2 refresh token for studio mailbox
    sender_display_name VARCHAR(150),             -- Studio sender name
    connected_at TIMESTAMPTZ,                     -- Timestamp when account was linked
    last_history_id VARCHAR(150),                 -- Incremental sync cursor from Gmail API
    last_synced_at TIMESTAMPTZ DEFAULT now(),
    sync_status VARCHAR(50) DEFAULT 'idle',
    error_message TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default sync state record
INSERT INTO public.gmail_sync_state (id, last_history_id, last_synced_at, sync_status)
VALUES ('studio_sync', NULL, now(), 'idle')
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gmail_sync_state ENABLE ROW LEVEL SECURITY;

-- Authenticated Admin Policies (Full CRUD for studio administrator)
CREATE POLICY "Admin full access on messages"
    ON public.messages FOR ALL
    USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access on gmail_sync_state"
    ON public.gmail_sync_state FOR ALL
    USING (auth.role() = 'authenticated');
