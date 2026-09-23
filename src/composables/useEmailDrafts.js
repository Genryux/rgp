import { ref } from 'vue';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Studio quick reply templates
export const EMAIL_TEMPLATES = [
  {
    id: 'rates_availability',
    title: 'Rates & Availability',
    description: 'Send rate sheet, pricing details, and date confirmation',
    subject: 'RGP Films & Studio — Rates & Availability for {event_type}',
    body: `<p>Hi {client_name},</p><p>Thank you for reaching out to <strong>RGP Films & Studio</strong> regarding your <strong>{event_type}</strong> on <strong>{event_date}</strong>!</p><p>We're happy to share that we are currently available for this date. We offer tailored photography and cinematic videography packages designed to capture every meaningful moment.</p><p>Please let us know if you'd like to review our full rate sheet or schedule a brief consultation to discuss your vision.</p><p>Warm regards,<br><strong>RGP Films & Studio Team</strong><br><a href="https://rgpfilmsstudio.site">https://rgpfilmsstudio.site</a></p>`,
  },
  {
    id: 'booking_reservation',
    title: 'Booking & Downpayment Info',
    description: 'Provide reservation details and bank downpayment instructions',
    subject: 'Reserving Your Date with RGP Films & Studio — {event_type}',
    body: `<p>Hi {client_name},</p><p>We are thrilled to be part of your upcoming <strong>{event_type}</strong> on <strong>{event_date}</strong>!</p><p>To officially lock in your date on our calendar, here are our reservation and payment details:</p><ul><li><strong>Reservation Deposit:</strong> ₱5,000 (Deductible from total package rate)</li><li><strong>Bank / Payment Option:</strong> BDO / GCash</li><li><strong>Account Name:</strong> RGP Films & Studio</li><li><strong>Account Number:</strong> 0012-3456-7890</li></ul><p>Kindly send a screenshot or receipt of the deposit once completed so we can issue your official booking confirmation and agreement.</p><p>Best regards,<br><strong>RGP Films & Studio Team</strong></p>`,
  },
  {
    id: 'follow_up',
    title: 'Friendly Follow-up',
    description: 'Check in with the client regarding their inquiry',
    subject: 'Following up on your {event_type} Inquiry — RGP Films & Studio',
    body: `<p>Hi {client_name},</p><p>Just following up on your inquiry for your <strong>{event_type}</strong> on <strong>{event_date}</strong>.</p><p>Have you had a chance to review our packages, or do you have any specific questions about our coverage? We'd be glad to hop on a quick call or customize a package to suit your needs.</p><p>Looking forward to hearing from you!</p><p>Best regards,<br><strong>RGP Films & Studio Team</strong></p>`,
  },
  {
    id: 'custom_reply',
    title: 'Custom Response',
    description: 'Blank personalized response structure',
    subject: 'Re: {event_type} Inquiry — RGP Films & Studio',
    body: `<p>Hi {client_name},</p><p>Thank you for contacting <strong>RGP Films & Studio</strong>!</p><p>Regarding your inquiry:</p><p><br></p><p>Please let us know if you have any questions.</p><p>Best regards,<br><strong>RGP Films & Studio Team</strong></p>`,
  },
];

// Fallback mock messages when offline or before DB sync
const INITIAL_MESSAGES = [
  {
    id: 'msg_1_1',
    inquiry_id: 'inq_1',
    gmail_message_id: 'gmail_msg_101',
    gmail_thread_id: 'inq_1',
    sender: 'client',
    sender_name: 'Maria Santos',
    sender_email: 'maria.santos@example.com',
    recipient: 'studio@rgpfilms.com',
    subject: 'Wedding Inquiry - Dec 18, 2026',
    body: 'Hi! We are looking for full-day photo and video coverage for our church wedding in Tagaytay on Dec 18, 2026.\n\nWe have attached our preliminary moodboard and church layout for your reference!',
    attachments: [
      {
        id: 'att_1_1',
        name: 'Tagaytay_Wedding_Moodboard.pdf',
        size: '2.4 MB',
        type: 'application/pdf',
        isImage: false,
      },
      {
        id: 'att_1_2',
        name: 'Church_Interior_Sample.jpg',
        size: '1.8 MB',
        type: 'image/jpeg',
        isImage: true,
      },
    ],
    received_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    read: true,
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'msg_2_1',
    inquiry_id: 'inq_2',
    gmail_message_id: 'gmail_msg_201',
    gmail_thread_id: 'inq_2',
    sender: 'client',
    sender_name: 'David Reyes',
    sender_email: 'david.reyes@example.com',
    recipient: 'studio@rgpfilms.com',
    subject: 'Debut Package Inquiry',
    body: 'Hello, inquiring about the Grand Debut package and availability for November 5, 2026.',
    attachments: [],
    received_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    read: true,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'msg_2_2',
    inquiry_id: 'inq_2',
    gmail_message_id: 'gmail_msg_202',
    gmail_thread_id: 'inq_2',
    sender: 'studio',
    sender_name: 'RGP Films & Studio',
    sender_email: 'studio@rgpfilms.com',
    recipient: 'david.reyes@example.com',
    subject: 'Re: Debut Package Inquiry',
    body: '<p>Hi David,</p><p>Thank you for reaching out! We sent over our <strong>Grand Debut Package</strong> rate sheet attached below. Let us know if you need any adjustments.</p><p>Warm regards,<br><strong>RGP Studio Team</strong></p>',
    attachments: [
      {
        id: 'att_2_1',
        name: 'RGP_Debut_RateSheet_2026.pdf',
        size: '3.2 MB',
        type: 'application/pdf',
        isImage: false,
      },
    ],
    received_at: new Date(Date.now() - 86400000 * 1.5).toISOString(),
    read: true,
    created_at: new Date(Date.now() - 86400000 * 1.5).toISOString(),
  },
];

// Local storage draft key
const DRAFT_STORAGE_KEY = 'rgp_studio_drafts_v1';

function loadStoredDrafts() {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function persistStoredDrafts(data) {
  try {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore quota issues
  }
}

// Global reactive states
const messages = ref(INITIAL_MESSAGES);
const drafts = ref(loadStoredDrafts());
const loadingMessages = ref(false);

export function useEmailDrafts() {
  // Fetch messages from Supabase messages table for a specific inquiry
  async function fetchThreadMessages(inquiryId) {
    if (!isSupabaseConfigured || !supabase || !inquiryId) return;

    loadingMessages.value = true;
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`inquiry_id.eq.${inquiryId},gmail_thread_id.eq.${inquiryId}`)
        .order('created_at', { ascending: true });

      if (error) {
        // Table might not be migrated yet; fallback gracefully
        console.warn('[EmailDrafts] Messages query info/fallback:', error.message);
      } else if (data && data.length > 0) {
        // Merge fetched messages into messages cache, avoiding duplicates
        const existingIds = new Set(messages.value.map((m) => m.id));
        for (const item of data) {
          if (!existingIds.has(item.id)) {
            messages.value.push(item);
          }
        }
      }
    } catch (err) {
      console.warn('[EmailDrafts] Error querying messages table:', err);
    } finally {
      loadingMessages.value = false;
    }
  }

  // Fetch all recent messages across all inquiries (used for inbox badges and new reply indicators)
  async function fetchAllMessages() {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.warn('[EmailDrafts] Error querying all messages:', error.message);
      } else if (data) {
        const existingMap = new Map(messages.value.map((m) => [m.id, m]));
        for (const item of data) {
          existingMap.set(item.id, item);
        }
        messages.value = Array.from(existingMap.values());
      }
    } catch (err) {
      console.warn('[EmailDrafts] Error in fetchAllMessages:', err);
    }
  }

  // Mark all messages for an inquiry as read
  async function markThreadAsRead(inquiryId) {
    if (!inquiryId) return;
    let hasUnread = false;
    for (const m of messages.value) {
      if ((m.inquiry_id === inquiryId || m.gmail_thread_id === inquiryId) && m.read === false) {
        m.read = true;
        hasUnread = true;
      }
    }
    if (hasUnread && isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('messages')
          .update({ read: true })
          .or(`inquiry_id.eq.${inquiryId},gmail_thread_id.eq.${inquiryId}`)
          .eq('read', false);
      } catch (err) {
        console.warn('[EmailDrafts] Error updating read status in DB:', err);
      }
    }
  }

  // Check if an inquiry has an unread client reply
  function hasNewReply(inquiryId) {
    if (!inquiryId) return false;
    const thread = messages.value
      .filter((m) => m.inquiry_id === inquiryId || m.gmail_thread_id === inquiryId)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    if (thread.length === 0) return false;

    // A new reply is an unread client message that is NOT the initial contact submission
    return thread.some((m, idx) => {
      if (m.sender !== 'client' || m.read !== false) return false;
      return idx > 0 || m.subject?.toLowerCase().startsWith('re:') || thread.some((t) => t.sender === 'studio');
    });
  }

  // Sync recent active inquiries with Gmail in parallel (used on Reload)
  async function syncRecentInquiries(inquiryList = []) {
    if (!isSupabaseConfigured || !supabase || inquiryList.length === 0) return;
    const active = inquiryList
      .filter((i) => i.status !== 'Booked')
      .slice(0, 6);

    await Promise.allSettled(active.map((inq) => syncThread(inq.id)));
  }

  function getThreadMessages(threadId) {
    return messages.value
      .filter((m) => m.inquiry_id === threadId || m.gmail_thread_id === threadId)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }

  function getDraft(threadId) {
    return drafts.value[threadId] || null;
  }

  function hasDraft(threadId) {
    const d = drafts.value[threadId];
    return Boolean(d && (d.body?.trim() || (d.attachments && d.attachments.length > 0)));
  }

  function saveDraft(threadId, draftData) {
    drafts.value[threadId] = {
      ...draftData,
      attachments: draftData.attachments || [],
      savedAt: new Date().toISOString(),
    };
    persistStoredDrafts(drafts.value);
  }

  function discardDraft(threadId) {
    if (drafts.value[threadId]) {
      delete drafts.value[threadId];
      persistStoredDrafts(drafts.value);
    }
  }

  function renderTemplate(template, clientData) {
    let sub = template.subject || '';
    let text = template.body || '';

    const replacements = {
      '{client_name}': clientData.name || 'Valued Client',
      '{event_type}': clientData.event_type || 'Event',
      '{event_date}': clientData.event_date
        ? new Date(clientData.event_date).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })
        : 'your preferred date',
    };

    for (const [key, val] of Object.entries(replacements)) {
      sub = sub.replaceAll(key, val);
      text = text.replaceAll(key, val);
    }

    return { subject: sub, body: text };
  }

  // Send reply through Supabase Edge Function (or mock fallback if offline)
  async function sendReply(inquiryId, replyData) {
    let sentMsg = null;
    let isLive = false;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.functions.invoke('send-email-reply', {
          body: {
            inquiryId,
            recipientEmail: replyData.to,
            subject: replyData.subject,
            htmlBody: replyData.body,
            attachments: replyData.attachments || [],
          },
        });

        if (error) {
          throw new Error(data?.error || error.message || 'Edge function returned error');
        }

        if (data?.message) {
          sentMsg = data.message;
          isLive = data.mode === 'live_gmail';
        }
      } catch (err) {
        console.error('[EmailDrafts] Failed to send email via edge function:', err);
        throw err;
      }
    }

    // Fallback if Edge Function is not yet deployed or in offline mode
    if (!sentMsg) {
      sentMsg = {
        id: `msg_studio_${Date.now()}`,
        inquiry_id: inquiryId,
        gmail_message_id: `gmail_mock_${Date.now()}`,
        gmail_thread_id: inquiryId,
        sender: 'studio',
        sender_name: 'RGP Films & Studio',
        sender_email: 'studio@rgpfilms.com',
        recipient: replyData.to,
        subject: replyData.subject,
        body: replyData.body,
        attachments: replyData.attachments || [],
        received_at: new Date().toISOString(),
        read: true,
        created_at: new Date().toISOString(),
      };
    }

    // Add to local state and clear draft
    messages.value.push(sentMsg);
    discardDraft(inquiryId);

    return {
      success: true,
      message: sentMsg,
      isLive,
    };
  }

  const isSyncing = ref(false);

  // Sync incoming replies from Gmail for this inquiry thread
  async function syncThread(inquiryId) {
    if (!isSupabaseConfigured || !supabase || !inquiryId) return { success: false, syncedCount: 0 };

    isSyncing.value = true;
    try {
      const { data, error } = await supabase.functions.invoke('sync-gmail-messages', {
        body: { inquiryId },
      });

      if (error) {
        console.warn('[EmailDrafts] Sync error:', error);
        return { success: false, error: error.message };
      }

      // Re-fetch thread messages from DB to get the latest synced messages
      await fetchThreadMessages(inquiryId);
      return { success: true, syncedCount: data?.syncedCount || 0 };
    } catch (err) {
      console.error('[EmailDrafts] syncThread exception:', err);
      return { success: false, error: err.message };
    } finally {
      isSyncing.value = false;
    }
  }

  return {
    messages,
    drafts,
    loadingMessages,
    isSyncing,
    EMAIL_TEMPLATES,
    fetchAllMessages,
    markThreadAsRead,
    hasNewReply,
    syncRecentInquiries,
    fetchThreadMessages,
    syncThread,
    getThreadMessages,
    getDraft,
    hasDraft,
    saveDraft,
    discardDraft,
    renderTemplate,
    sendReply,
  };
}

