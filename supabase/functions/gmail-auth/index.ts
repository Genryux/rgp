import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || supabaseAnonKey;

    // 1. Authenticate caller (admin only)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized. Admin access required.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);
    const clientId = Deno.env.get('GMAIL_CLIENT_ID');
    const clientSecret = Deno.env.get('GMAIL_CLIENT_SECRET');

    const body = await req.json();
    const { action } = body;

    // ACTION: GET AUTH URL (Generate Google OAuth sign-in link for studio owner)
    if (action === 'get-auth-url') {
      const redirectUri = body.redirectUri;
      if (!clientId) {
        return new Response(
          JSON.stringify({ error: 'GMAIL_CLIENT_ID is not configured in Supabase secrets.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const scopes = [
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
      ].join(' ');

      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: scopes,
        access_type: 'offline', // Critical: ensures Google delivers a permanent refresh_token
        prompt: 'consent',     // Critical: ensures Google returns refresh_token on re-connect
      });

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
      return new Response(
        JSON.stringify({ success: true, url: authUrl }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ACTION: EXCHANGE CODE (Client completed Google login; save refresh_token)
    if (action === 'exchange-code') {
      const { code, redirectUri } = body;
      if (!code || !redirectUri) {
        return new Response(
          JSON.stringify({ error: 'code and redirectUri are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!clientId || !clientSecret) {
        return new Response(
          JSON.stringify({ error: 'GMAIL_CLIENT_ID or GMAIL_CLIENT_SECRET missing in Supabase secrets.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Exchange code for tokens
      const tokenResp = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenResp.ok) {
        const errText = await tokenResp.text();
        console.error('[gmail-auth] Code exchange failed:', errText);
        throw new Error(`Google token exchange failed: ${tokenResp.statusText}`);
      }

      const tokens = await tokenResp.json();
      const accessToken = tokens.access_token;
      const refreshToken = tokens.refresh_token;

      // Fetch user profile info (email and display name)
      const userinfoResp = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      let connectedEmail = 'Connected Account';
      let displayName = 'RGP Studio Owner';

      if (userinfoResp.ok) {
        const profile = await userinfoResp.json();
        connectedEmail = profile.email || connectedEmail;
        displayName = profile.name || displayName;
      }

      // Persist in database
      const updateData: Record<string, unknown> = {
        id: 'studio_sync',
        connected_email: connectedEmail,
        sender_display_name: displayName,
        connected_at: new Date().toISOString(),
        sync_status: 'connected',
      };

      if (refreshToken) {
        updateData.refresh_token = refreshToken;
      }

      const { error: upsertErr } = await adminClient
        .from('gmail_sync_state')
        .upsert(updateData);

      if (upsertErr) {
        console.error('[gmail-auth] DB update failed:', upsertErr);
        throw upsertErr;
      }

      return new Response(
        JSON.stringify({
          success: true,
          connectedEmail,
          senderDisplayName: displayName,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ACTION: GET CONNECTION STATUS
    if (action === 'get-status') {
      const { data: record } = await adminClient
        .from('gmail_sync_state')
        .select('connected_email, sender_display_name, connected_at, refresh_token, sync_status')
        .eq('id', 'studio_sync')
        .maybeSingle();

      const hasStaticEnv = Boolean(Deno.env.get('GMAIL_REFRESH_TOKEN'));
      const isConnected = Boolean(record?.refresh_token || (hasStaticEnv && record?.connected_email));

      return new Response(
        JSON.stringify({
          success: true,
          connected: isConnected,
          connectedEmail: record?.connected_email || Deno.env.get('STUDIO_EMAIL') || null,
          senderDisplayName: record?.sender_display_name || Deno.env.get('STUDIO_NAME') || null,
          connectedAt: record?.connected_at || null,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ACTION: DISCONNECT GMAIL
    if (action === 'disconnect') {
      await adminClient
        .from('gmail_sync_state')
        .update({
          connected_email: null,
          refresh_token: null,
          sender_display_name: null,
          connected_at: null,
          sync_status: 'disconnected',
        })
        .eq('id', 'studio_sync');

      return new Response(
        JSON.stringify({ success: true, message: 'Gmail account disconnected.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: `Unknown action: ${action}` }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[gmail-auth] Error:', message);
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
