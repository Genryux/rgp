import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// URL-safe Base64 encoder according to RFC 4648 §5
function toBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Convert UTF-8 string to Base64 for RFC 2047 encoded-word format
function toUtf8Base64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || supabaseAnonKey;
    const clientId = Deno.env.get('GMAIL_CLIENT_ID');
    const clientSecret = Deno.env.get('GMAIL_CLIENT_SECRET');

    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);

    // 1. Parse inquiry payload
    const body = await req.json().catch(() => ({}));
    const { inquiryId, name, email, phone, event_type, event_date, message } = body;

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: 'Name, email, and message are required.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Fetch connected studio mailbox
    const { data: syncRecord } = await adminClient
      .from('gmail_sync_state')
      .select('refresh_token, connected_email, sender_display_name')
      .eq('id', 'studio_sync')
      .maybeSingle();

    const refreshToken = syncRecord?.refresh_token || Deno.env.get('GMAIL_REFRESH_TOKEN');
    const connectedEmail = syncRecord?.connected_email || Deno.env.get('STUDIO_EMAIL');
    const studioName = Deno.env.get('STUDIO_NAME') || 'RGP Films & Studio';

    if (!clientId || !clientSecret || !refreshToken || !connectedEmail) {
      console.warn('[notify-inquiry] No Gmail account connected. Skipping email notification.');
      return new Response(
        JSON.stringify({ success: true, message: 'Inquiry saved. No Gmail connected.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Exchange Refresh Token for Access Token
    const tokenResp = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!tokenResp.ok) {
      const errText = await tokenResp.text();
      console.error('[notify-inquiry] Google token refresh failed:', errText);
      throw new Error(`Token refresh failed: ${tokenResp.statusText}`);
    }

    const { access_token } = await tokenResp.json();

    // 4. Construct Notification Email (clean, professional format without internal bot/tip notes)
    const subject = `New Inquiry: ${event_type || 'Photography'} — ${name}`;
    const encodedSubject = `=?UTF-8?B?${toUtf8Base64(subject)}?=`;

    const formattedDate = event_date
      ? new Date(event_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : 'Flexible / TBD';

    const htmlBody = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #121212; color: #f5f5f5; margin: 0; padding: 20px; }
            .container { max-width: 580px; margin: 0 auto; background: #1a1a1a; border: 1px solid #2e2e2e; border-radius: 14px; overflow: hidden; }
            .header { background: #0d0d0d; padding: 20px 24px; border-bottom: 2px solid #FFD700; }
            .title { margin: 0; font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: -0.2px; }
            .content { padding: 24px; }
            .grid { width: 100%; border-collapse: collapse; margin-bottom: 18px; }
            .grid td { padding: 8px 0; border-bottom: 1px solid #262626; font-size: 13px; }
            .label { color: #888; width: 110px; font-size: 12px; font-weight: 600; }
            .val { color: #fff; font-weight: 500; }
            .message-label { font-size: 11px; text-transform: uppercase; color: #888; font-weight: 600; letter-spacing: 0.5px; margin-top: 14px; }
            .message-box { background: #222; border-left: 3px solid #FFD700; padding: 14px 16px; border-radius: 0 10px 10px 0; margin-top: 8px; font-size: 14px; line-height: 1.6; color: #e5e5e5; }
            .footer { padding: 16px 24px; background: #141414; border-top: 1px solid #262626; font-size: 12px; color: #777; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="title">Booking Inquiry — ${event_type || 'Event'}</h1>
            </div>
            <div class="content">
              <table class="grid" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td class="label" style="padding: 6px 0; color: #888888; width: 110px; font-size: 12px; font-weight: 600;">Client:</td>
                  <td class="val" style="padding: 6px 0; color: #ffffff; font-weight: 500;">${name}</td>
                </tr>
                <tr>
                  <td class="label" style="padding: 6px 0; color: #888888; font-size: 12px; font-weight: 600;">Service:</td>
                  <td class="val" style="padding: 6px 0; color: #ffffff; font-weight: 600;">${event_type || 'General'}</td>
                </tr>
                <tr>
                  <td class="label" style="padding: 6px 0; color: #888888; font-size: 12px; font-weight: 600;">Target Date:</td>
                  <td class="val" style="padding: 6px 0; color: #ffffff; font-weight: 500;">${formattedDate}</td>
                </tr>
                ${phone ? `<tr><td class="label" style="padding: 6px 0; color: #888888; font-size: 12px; font-weight: 600;">Phone:</td><td class="val" style="padding: 6px 0; color: #ffffff; font-weight: 500;">${phone}</td></tr>` : ''}
              </table>

              <br>

              <p style="margin: 16px 0 8px 0; font-size: 12px; text-transform: uppercase; color: #999999; font-weight: 600; letter-spacing: 0.5px;">
                Inquiry Message:
              </p>

              <div class="message-box" style="background: #222222; border-left: 3px solid #FFD700; padding: 14px 16px; border-radius: 0 10px 10px 0; margin: 4px 0 16px 0; font-size: 14px; line-height: 1.6; color: #e5e5e5;">
                ${message.replace(/\n/g, '<br>')}
              </div>

              <br>
              <hr style="border: none; border-top: 1px solid #2e2e2e; margin: 20px 0 12px 0;">

              <p style="margin: 0; font-size: 12px; color: #888888; font-weight: 500;">
                RGP Films & Studio
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailLines = [
      `From: ${studioName} <${connectedEmail}>`,
      `To: ${connectedEmail}`,
      `Reply-To: ${name} <${email}>`,
      `Subject: ${encodedSubject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=UTF-8',
      'Content-Transfer-Encoding: 7bit',
      '',
      htmlBody,
    ];

    const rawMime = emailLines.join('\r\n');
    const rawBase64Url = toBase64Url(rawMime);

    // 5. Send message via Gmail API
    const sendResp = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: rawBase64Url }),
    });

    if (!sendResp.ok) {
      const sendErr = await sendResp.text();
      console.error('[notify-inquiry] Gmail API send failed:', sendErr);
      throw new Error(`Gmail API send failed: ${sendErr}`);
    }

    const sentData = await sendResp.json();

    // 6. Record this initial inquiry email into Supabase messages table
    if (inquiryId && sentData?.id) {
      await adminClient.from('messages').insert({
        inquiry_id: inquiryId,
        gmail_message_id: sentData.id,
        gmail_thread_id: sentData.threadId,
        sender: 'client',
        sender_name: name,
        sender_email: email,
        recipient: connectedEmail,
        subject: subject,
        body: message,
        attachments: [],
        read: false,
        created_at: new Date().toISOString(),
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        gmailMessageId: sentData.id,
        gmailThreadId: sentData.threadId,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[notify-inquiry] Error:', message);
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
