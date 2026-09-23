import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Safe UTF-8 Base64URL decoder
function decodeBase64Url(base64UrlStr: string): string {
  if (!base64UrlStr) return '';
  try {
    const base64 = base64UrlStr.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch {
    return '';
  }
}

// Extract Name & Email from header format: "John Doe <john@example.com>"
function parseHeaderAddress(headerVal: string): { name: string; email: string } {
  if (!headerVal) return { name: '', email: '' };
  const match = headerVal.match(/(.*?)\s*<(.+?)>/);
  if (match) {
    return {
      name: match[1].replace(/["']/g, '').trim(),
      email: match[2].trim(),
    };
  }
  return {
    name: headerVal.split('@')[0],
    email: headerVal.trim(),
  };
}

// Recursively find HTML or Plain Text body from Gmail message payload parts
interface GmailPart {
  mimeType?: string;
  body?: { data?: string; size?: number };
  parts?: GmailPart[];
  filename?: string;
}

function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function getAllParts(part: GmailPart): GmailPart[] {
  const parts: GmailPart[] = [part];
  if (part.parts && Array.isArray(part.parts)) {
    for (const child of part.parts) {
      parts.push(...getAllParts(child));
    }
  }
  return parts;
}

// Extract message body and lightweight attachment metadata (0 file bytes stored in Supabase!)
function extractMessageContentAndAttachments(
  msg: any
): { body: string; attachments: any[] } {
  const payload = msg.payload;
  if (!payload) return { body: '', attachments: [] };

  const allParts = getAllParts(payload);

  let htmlBody = '';
  let textBody = '';

  for (const part of allParts) {
    if (part.mimeType === 'text/html' && part.body?.data && !htmlBody) {
      htmlBody = decodeBase64Url(part.body.data);
    } else if (part.mimeType === 'text/plain' && part.body?.data && !textBody) {
      textBody = decodeBase64Url(part.body.data);
    }
  }

  let finalBody = htmlBody;
  if (!finalBody && textBody) {
    finalBody = textBody
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .split(/\n\s*\n/)
      .map((p) => `<p>${p.trim().replace(/\n/g, '<br>')}</p>`)
      .join('');
  }
  if (!finalBody && payload.body?.data) {
    finalBody = decodeBase64Url(payload.body.data);
  }

  const attachments: any[] = [];

  for (const part of allParts) {
    const mimeType = part.mimeType || 'application/octet-stream';
    if (mimeType === 'text/html' || mimeType === 'text/plain' || mimeType.startsWith('multipart/')) {
      continue;
    }

    const hasAttachmentId = Boolean(part.body?.attachmentId);
    const hasData = Boolean(part.body?.data);
    const hasFilename = Boolean(part.filename && part.filename.trim().length > 0);
    const isImage = mimeType.toLowerCase().startsWith('image/');

    const cidHeader = part.headers?.find(
      (h: { name: string; value: string }) => h.name.toLowerCase() === 'content-id'
    )?.value;
    const cid = cidHeader ? cidHeader.replace(/[<>]/g, '').trim() : null;

    const xAttachmentId = part.headers?.find(
      (h: { name: string; value: string }) => h.name.toLowerCase() === 'x-attachment-id'
    )?.value?.trim() || null;

    if (!hasAttachmentId && !hasData && !hasFilename && !cid && !xAttachmentId) {
      continue;
    }

    const sizeBytes = part.body?.size || 0;
    const filename = part.filename?.trim() || (isImage ? `image_${attachments.length + 1}.${mimeType.split('/')[1] || 'jpg'}` : `attachment_${attachments.length + 1}`);

    // Store ONLY lightweight metadata in Supabase (NO file binaries or base64!)
    attachments.push({
      id: part.body?.attachmentId || `att_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: filename,
      size: formatFileSize(sizeBytes),
      type: mimeType,
      isImage,
      attachmentId: part.body?.attachmentId || '',
      messageId: msg.id,
    });
  }

  finalBody = cleanQuotedReply(finalBody);
  // Strip unresolved cid: inline images so no broken image boxes appear and 0 base64 is stored
  finalBody = finalBody.replace(/<img[^>]*src=["']cid:[^"']*["'][^>]*>/gi, '');

  return { body: finalBody, attachments };
}

// Clean out quoted reply text (e.g. Gmail quote blocks, On ... wrote:, Outlook headers)
function cleanQuotedReply(content: string): string {
  if (!content) return '';
  let cleaned = content;

  // 1. Remove standard email HTML quote containers (matching gmail_quote, gmail_attr, etc.)
  cleaned = cleaned.replace(/<div[^>]*class=["'][^"']*gmail_quote[^"']*["'][\s\S]*$/i, '');
  cleaned = cleaned.replace(/<div[^>]*class=["'][^"']*gmail_attr[^"']*["'][\s\S]*$/i, '');
  cleaned = cleaned.replace(/<div[^>]*class=["'][^"']*gmail_signature[^"']*["'][\s\S]*$/i, '');
  cleaned = cleaned.replace(/<blockquote[\s\S]*$/i, '');
  cleaned = cleaned.replace(/<hr[^>]*id=["']stopSpelling["'][\s\S]*$/i, '');
  cleaned = cleaned.replace(/-----Original Message-----[\s\S]*$/i, '');
  cleaned = cleaned.replace(/________________________________[\s\S]*$/i, '');

  // 2. Remove standard "On [date/time] ... wrote:" attribution lines
  cleaned = cleaned.replace(/(?:<p[^>]*>|<div[^>]*>|\n|^|\r)?\s*On\s+([A-Za-z]{3},\s+)?[A-Za-z]{3}\s+\d{1,2},?\s+\d{4}[\s\S]*$/i, '');
  cleaned = cleaned.replace(/(?:<p[^>]*>|<div[^>]*>|\n|^|\r)?\s*On\s+\d{1,2}\s+[A-Za-z]{3}\s+\d{4}[\s\S]*$/i, '');
  cleaned = cleaned.replace(/(?:<p[^>]*>|<div[^>]*>|\n|^|\r)?\s*On\s+.*?wrote:\s*(?:<br\s*\/?>)?[\s\S]*$/i, '');

  // 3. Trim trailing break tags, empty tags, non-breaking spaces
  cleaned = cleaned.replace(/(?:<br\s*\/?>|\s|&nbsp;|<p>\s*<\/p>|<div>\s*<\/div>)+$/i, '').trim();

  return cleaned || content;
}

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

    // 2. Query connected account tokens from database
    const { data: syncRecord } = await adminClient
      .from('gmail_sync_state')
      .select('refresh_token, connected_email, sender_display_name')
      .eq('id', 'studio_sync')
      .maybeSingle();

    const refreshToken = syncRecord?.refresh_token || Deno.env.get('GMAIL_REFRESH_TOKEN');
    const connectedEmail = syncRecord?.connected_email || Deno.env.get('STUDIO_EMAIL');

    if (!clientId || !clientSecret || !refreshToken || !connectedEmail) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Gmail account is not connected. Please connect your Google account in Settings.',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Exchange Refresh Token for fresh Access Token
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
      console.error('[sync-gmail] Token refresh failed:', errText);
      throw new Error(`Gmail token refresh failed: ${tokenResp.statusText}`);
    }

    const { access_token } = await tokenResp.json();

    const body = await req.json().catch(() => ({}));

    // 4. On-demand streaming/download of attachment directly from Gmail (0 bytes stored in Supabase!)
    if (body.action === 'get-attachment') {
      const { messageId, attachmentId, mimeType = 'application/octet-stream' } = body;
      if (!messageId || !attachmentId) {
        return new Response(
          JSON.stringify({ error: 'messageId and attachmentId are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const attResp = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/attachments/${attachmentId}`,
        { headers: { Authorization: `Bearer ${access_token}` } }
      );

      if (!attResp.ok) {
        const attErr = await attResp.text();
        return new Response(
          JSON.stringify({ error: `Failed to fetch from Gmail: ${attErr}` }),
          { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const attData = await attResp.json();
      const rawBase64 = attData.data ? attData.data.replace(/-/g, '+').replace(/_/g, '/') : '';
      return new Response(
        JSON.stringify({
          success: true,
          data: rawBase64 ? `data:${mimeType};base64,${rawBase64}` : null,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { inquiryId } = body;

    if (!inquiryId) {
      return new Response(
        JSON.stringify({ error: 'inquiryId is required for thread synchronization.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Fetch inquiry & existing thread IDs from Supabase
    const { data: inquiry, error: inqErr } = await adminClient
      .from('inquiries')
      .select('*')
      .eq('id', inquiryId)
      .single();

    if (inqErr || !inquiry) {
      return new Response(
        JSON.stringify({ error: 'Inquiry not found.' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: existingMessages } = await adminClient
      .from('messages')
      .select('id, gmail_message_id, gmail_thread_id, attachments, body')
      .eq('inquiry_id', inquiryId);

    const existingMap = new Map((existingMessages || []).map((m) => [m.gmail_message_id, m]));
    let targetThreadId: string | null = null;

    for (const m of existingMessages || []) {
      if (m.gmail_thread_id && !m.gmail_thread_id.startsWith('mock_')) {
        targetThreadId = m.gmail_thread_id;
        break;
      }
    }

    // 5. If no known threadId, search Gmail threads matching this client's email
    if (!targetThreadId && inquiry.email) {
      const searchResp = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/threads?q=${encodeURIComponent(inquiry.email)}`,
        { headers: { Authorization: `Bearer ${access_token}` } }
      );

      if (searchResp.ok) {
        const searchData = await searchResp.json();
        if (searchData.threads && searchData.threads.length > 0) {
          targetThreadId = searchData.threads[0].id;
        }
      }
    }

    if (!targetThreadId) {
      return new Response(
        JSON.stringify({
          success: true,
          syncedCount: 0,
          message: 'No Gmail thread found for this inquiry yet.',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 6. Fetch the complete thread from Gmail API
    const threadResp = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/threads/${targetThreadId}?format=full`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    if (!threadResp.ok) {
      const threadErr = await threadResp.text();
      console.error('[sync-gmail] Error fetching thread:', threadErr);
      throw new Error(`Failed to fetch Gmail thread: ${threadResp.statusText}`);
    }

    const threadData = await threadResp.json();
    const gmailMessages = threadData.messages || [];
    const newMessagesToInsert = [];

    for (const msg of gmailMessages) {
      if (existingMap.has(msg.id)) {
        const existing = existingMap.get(msg.id);
        const hasEmptyAtts = !existing.attachments || (Array.isArray(existing.attachments) && existing.attachments.length === 0);
        const hasCidInBody = existing.body && existing.body.includes('cid:');

        // Auto-repair existing message if it was saved without attachments or with broken inline cid: images
        if (hasEmptyAtts || hasCidInBody) {
          const { body: repairedBody, attachments: extractedAtts } = extractMessageContentAndAttachments(msg);
          if (extractedAtts.length > 0 || (hasCidInBody && !repairedBody.includes('cid:'))) {
            await adminClient
              .from('messages')
              .update({
                body: repairedBody,
                attachments: extractedAtts,
              })
              .eq('id', existing.id);
          }
        }
        continue;
      }

      const headers = msg.payload?.headers || [];
      const getHeader = (name: string) =>
        headers.find((h: { name: string; value: string }) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

      const fromHeader = getHeader('From');
      const toHeader = getHeader('To') || connectedEmail;
      const subjectHeader = getHeader('Subject') || inquiry.event_type;
      const dateHeader = getHeader('Date');

      const parsedFrom = parseHeaderAddress(fromHeader);
      const isFromStudio = parsedFrom.email.toLowerCase().includes(connectedEmail.toLowerCase());

      const senderType = isFromStudio ? 'studio' : 'client';
      const senderName = isFromStudio
        ? syncRecord?.sender_display_name || 'RGP Films & Studio'
        : inquiry.name || parsedFrom.name || 'Client';
      const senderEmail = parsedFrom.email || (isFromStudio ? connectedEmail : inquiry.email);

      const { body: messageBody, attachments: messageAttachments } = extractMessageContentAndAttachments(msg);
      const msgTimestamp = dateHeader ? new Date(dateHeader).toISOString() : new Date(parseInt(msg.internalDate)).toISOString();

      newMessagesToInsert.push({
        inquiry_id: inquiryId,
        gmail_message_id: msg.id,
        gmail_thread_id: targetThreadId,
        sender: senderType,
        sender_name: senderName,
        sender_email: senderEmail,
        recipient: toHeader,
        subject: subjectHeader,
        body: messageBody,
        attachments: messageAttachments,
        received_at: msgTimestamp,
        read: senderType === 'studio' ? true : false,
        created_at: msgTimestamp,
      });
    }

    // 7. Insert newly identified messages into Supabase
    let insertedCount = 0;
    if (newMessagesToInsert.length > 0) {
      const { data: inserted, error: insertErr } = await adminClient
        .from('messages')
        .insert(newMessagesToInsert)
        .select();

      if (insertErr) {
        console.error('[sync-gmail] DB insert error:', insertErr);
        throw insertErr;
      }

      insertedCount = inserted?.length || newMessagesToInsert.length;

      // Auto-update inquiry status to 'Contacted' if studio replied
      if (inquiry.status === 'New') {
        const hasStudioReply = newMessagesToInsert.some((m) => m.sender === 'studio');
        if (hasStudioReply) {
          await adminClient
            .from('inquiries')
            .update({ status: 'Contacted', read: true })
            .eq('id', inquiryId);
        }
      }

      // Update sync state timestamp
      await adminClient
        .from('gmail_sync_state')
        .update({ last_synced_at: new Date().toISOString() })
        .eq('id', 'studio_sync');
    }

    return new Response(
      JSON.stringify({
        success: true,
        syncedCount: insertedCount,
        threadId: targetThreadId,
        newMessages: newMessagesToInsert,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[sync-gmail-messages] Error:', message);
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
