import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function uint8ArrayToBase64(bytes: Uint8Array): string {
  const CHUNK_SIZE = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    const chunk = bytes.subarray(i, i + CHUNK_SIZE);
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  return btoa(binary);
}

// URL-safe Base64 encoder according to RFC 4648 §5
function toBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  return uint8ArrayToBase64(bytes)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Convert UTF-8 string to Base64 for RFC 2047 encoded-word format (Subjects with non-ASCII or punctuation)
function toUtf8Base64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  return uint8ArrayToBase64(bytes);
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || supabaseAnonKey;

    // 1. Authenticate calling admin
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
        JSON.stringify({ error: 'Unauthorized. Admin session required.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Parse request payload
    const body = await req.json();
    const { inquiryId, recipientEmail, subject, htmlBody, attachments = [] } = body;

    if (!recipientEmail || !subject || (!htmlBody && attachments.length === 0)) {
      return new Response(
        JSON.stringify({ error: 'recipientEmail, subject, and message body are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Obtain Google OAuth Secrets & Connected Account Tokens
    const clientId = Deno.env.get('GMAIL_CLIENT_ID');
    const clientSecret = Deno.env.get('GMAIL_CLIENT_SECRET');

    // Admin database client (service role) to read credentials & write messages
    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Query connected studio mailbox from DB
    const { data: syncRecord } = await adminClient
      .from('gmail_sync_state')
      .select('refresh_token, connected_email, sender_display_name')
      .eq('id', 'studio_sync')
      .maybeSingle();

    const refreshToken = syncRecord?.refresh_token || Deno.env.get('GMAIL_REFRESH_TOKEN');
    const studioEmail = syncRecord?.connected_email || Deno.env.get('STUDIO_EMAIL') || 'contact@rgpfilmsstudio.site';
    const studioSenderName = syncRecord?.sender_display_name || Deno.env.get('STUDIO_NAME') || 'RGP Films & Studio';

    let gmailMessageId = `mock_gmail_${Date.now()}`;
    let gmailThreadId = `mock_thread_${Date.now()}`;

    let parentMessageId: string | null = null;
    let finalSubject = subject;

    // Check if inquiry already has an associated Gmail thread ID & parent message
    if (inquiryId) {
      const { data: existingMsg } = await adminClient
        .from('messages')
        .select('gmail_thread_id, gmail_message_id, subject')
        .eq('inquiry_id', inquiryId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingMsg?.gmail_thread_id && !existingMsg.gmail_thread_id.startsWith('mock_')) {
        gmailThreadId = existingMsg.gmail_thread_id;
      }
      if (existingMsg?.gmail_message_id && !existingMsg.gmail_message_id.startsWith('mock_')) {
        parentMessageId = existingMsg.gmail_message_id;
      }
      // If thread already has an established subject, preserve it with "Re: " so Gmail groups it in the same thread!
      if (existingMsg?.subject) {
        finalSubject = existingMsg.subject.trim().toLowerCase().startsWith('re:')
          ? existingMsg.subject.trim()
          : `Re: ${existingMsg.subject.trim()}`;
      }
    }

    if (clientId && clientSecret && refreshToken) {
      // 4. Exchange Refresh Token for Access Token
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
        const errDetails = await tokenResp.text();
        console.error('[Gmail OAuth] Token refresh failed:', errDetails);
        throw new Error(`Gmail token refresh failed: ${tokenResp.statusText}`);
      }

      const tokenData = await tokenResp.json();
      const accessToken = tokenData.access_token;

      // 5. Look up real RFC 2822 Message-ID and thread Subject from Gmail
      let parentRfcMessageId: string | null = null;
      let threadReferences: string | null = null;

      // If we don't have a known threadId, search for existing thread with this recipient
      if ((!gmailThreadId || gmailThreadId.startsWith('mock_')) && recipientEmail) {
        try {
          const searchResp = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/threads?q=${encodeURIComponent(recipientEmail)}`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
          if (searchResp.ok) {
            const searchData = await searchResp.json();
            if (searchData.threads && searchData.threads.length > 0) {
              gmailThreadId = searchData.threads[0].id;
            }
          }
        } catch {
          // Ignore search error
        }
      }

      // If thread exists, fetch its metadata to grab the exact parent Message-ID
      if (gmailThreadId && !gmailThreadId.startsWith('mock_')) {
        try {
          const threadMetaResp = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/threads/${gmailThreadId}?format=metadata&metadataHeaders=Message-ID&metadataHeaders=References&metadataHeaders=Subject`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
          if (threadMetaResp.ok) {
            const threadData = await threadMetaResp.json();
            const msgs = threadData.messages || [];
            if (msgs.length > 0) {
              // 1. Lock Subject to the original thread subject so Gmail cannot fork it
              const firstHeaders = msgs[0].payload?.headers || [];
              const origSub = firstHeaders.find((h: { name: string; value: string }) => h.name.toLowerCase() === 'subject')?.value;
              if (origSub) {
                finalSubject = origSub.trim().toLowerCase().startsWith('re:')
                  ? origSub.trim()
                  : `Re: ${origSub.trim()}`;
              }

              // 2. Extract authentic RFC 2822 Message-ID of the last message in this thread
              const lastMsg = msgs[msgs.length - 1];
              const lastHeaders = lastMsg.payload?.headers || [];
              const rfcId = lastHeaders.find((h: { name: string; value: string }) => h.name.toLowerCase() === 'message-id')?.value;
              if (rfcId) {
                parentRfcMessageId = rfcId;
              }

              // 3. Extract existing References chain
              const existingRefs = lastHeaders.find((h: { name: string; value: string }) => h.name.toLowerCase() === 'references')?.value;
              if (existingRefs) {
                threadReferences = existingRefs;
              }
            }
          }
        } catch (err) {
          console.warn('[send-email-reply] Error fetching thread metadata:', err);
        }
      }

      // Helper to parse attachment base64 and mime
      function parseAttachment(att: { name?: string; type?: string; data?: string }) {
        let mimeType = att.type || 'application/octet-stream';
        let base64 = att.data || '';
        const filename = att.name || 'attachment';

        if (base64.startsWith('data:')) {
          const commaIdx = base64.indexOf(',');
          if (commaIdx !== -1) {
            const header = base64.substring(5, commaIdx);
            if (header.includes(';')) {
              mimeType = header.split(';')[0] || mimeType;
            }
            base64 = base64.substring(commaIdx + 1);
          }
        }
        return { mimeType, base64, filename };
      }

      // 6. Construct compliant RFC 2822 MIME message (multipart/mixed if attachments present)
      const encodedSubject = `=?UTF-8?B?${toUtf8Base64(finalSubject)}?=`;
      let rawMime: string;

      if (attachments && attachments.length > 0) {
        const mixedBoundary = `====_MIXED_BOUNDARY_${Date.now()}_====`;
        const emailHeaders = [
          `From: ${studioSenderName} <${studioEmail}>`,
          `To: ${recipientEmail}`,
          `Reply-To: ${studioEmail}`,
          `Subject: ${encodedSubject}`,
          'MIME-Version: 1.0',
          `Content-Type: multipart/mixed; boundary="${mixedBoundary}"`,
        ];

        // Threading headers according to RFC 5322: MUST use authentic Message-ID
        if (parentRfcMessageId) {
          emailHeaders.push(`In-Reply-To: ${parentRfcMessageId}`);
          if (threadReferences) {
            emailHeaders.push(`References: ${threadReferences} ${parentRfcMessageId}`);
          } else {
            emailHeaders.push(`References: ${parentRfcMessageId}`);
          }
        }

        const bodyParts: string[] = [
          `--${mixedBoundary}`,
          'Content-Type: text/html; charset=UTF-8',
          'Content-Transfer-Encoding: 7bit',
          '',
          htmlBody,
        ];

        for (const att of attachments) {
          const { mimeType, base64, filename } = parseAttachment(att);
          if (!base64) continue;

          // Split base64 into 76-character lines according to RFC 2045
          const formattedBase64 = base64.match(/.{1,76}/g)?.join('\r\n') || base64;
          const encodedFilename = `=?UTF-8?B?${toUtf8Base64(filename)}?=`;

          bodyParts.push(
            `--${mixedBoundary}`,
            `Content-Type: ${mimeType}; name="${encodedFilename}"`,
            `Content-Disposition: attachment; filename="${encodedFilename}"`,
            'Content-Transfer-Encoding: base64',
            '',
            formattedBase64
          );
        }

        bodyParts.push(`--${mixedBoundary}--`, '');
        rawMime = emailHeaders.join('\r\n') + '\r\n\r\n' + bodyParts.join('\r\n');
      } else {
        const emailLines = [
          `From: ${studioSenderName} <${studioEmail}>`,
          `To: ${recipientEmail}`,
          `Reply-To: ${studioEmail}`,
          `Subject: ${encodedSubject}`,
          'MIME-Version: 1.0',
          'Content-Type: text/html; charset=UTF-8',
          'Content-Transfer-Encoding: 7bit',
        ];

        // Threading headers according to RFC 5322: MUST use authentic Message-ID
        if (parentRfcMessageId) {
          emailLines.push(`In-Reply-To: ${parentRfcMessageId}`);
          if (threadReferences) {
            emailLines.push(`References: ${threadReferences} ${parentRfcMessageId}`);
          } else {
            emailLines.push(`References: ${parentRfcMessageId}`);
          }
        }

        emailLines.push('', htmlBody);
        rawMime = emailLines.join('\r\n');
      }

      const rawBase64Url = toBase64Url(rawMime);

      // 7. Send message via Gmail API (messages.send)
      const sendPayload: Record<string, unknown> = { raw: rawBase64Url };
      if (gmailThreadId && !gmailThreadId.startsWith('mock_')) {
        sendPayload.threadId = gmailThreadId;
      }

      const sendResp = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sendPayload),
      });

      if (!sendResp.ok) {
        const sendError = await sendResp.text();
        console.error('[Gmail API] Send failed:', sendError);
        throw new Error(`Gmail API send failed: ${sendError}`);
      }

      const sentData = await sendResp.json();
      gmailMessageId = sentData.id;
      gmailThreadId = sentData.threadId || gmailThreadId;
    } else {
      console.warn(
        '[send-email-reply] GMAIL_REFRESH_TOKEN or OAuth keys not configured in Supabase secrets. Simulating send in test mode.'
      );
    }

    // 7. Store outbound message in Supabase `messages` table
    // Store strictly lightweight metadata (zero file binaries / base64 saved in Supabase!)
    const metadataOnlyAttachments = (attachments || []).map((att: any) => ({
      id: att.id || `att_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: att.name || 'attachment',
      size: att.size || '0 B',
      type: att.type || 'application/octet-stream',
      isImage: Boolean(att.isImage),
    }));

    const newMessage = {
      inquiry_id: inquiryId || null,
      gmail_message_id: gmailMessageId,
      gmail_thread_id: gmailThreadId,
      sender: 'studio',
      sender_name: studioSenderName,
      sender_email: studioEmail,
      recipient: recipientEmail,
      subject: finalSubject,
      body: htmlBody,
      attachments: metadataOnlyAttachments,
      read: true,
      created_at: new Date().toISOString(),
    };

    const { data: savedMessage, error: insertError } = await adminClient
      .from('messages')
      .insert(newMessage)
      .select()
      .single();

    if (insertError) {
      console.error('[send-email-reply] Failed to save message to DB:', insertError);
      throw new Error(`Failed to save message to database: ${insertError.message}`);
    }

    // 8. Update inquiry status to 'Contacted'
    if (inquiryId) {
      await adminClient
        .from('inquiries')
        .update({ status: 'Contacted' })
        .eq('id', inquiryId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: savedMessage || newMessage,
        mode: clientId && refreshToken ? 'live_gmail' : 'simulated_no_credentials',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[send-email-reply] Error:', message);
    return new Response(
      JSON.stringify({ success: false, error: message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
