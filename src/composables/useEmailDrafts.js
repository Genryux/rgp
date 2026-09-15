import { ref } from 'vue';

// Studio quick reply templates
export const EMAIL_TEMPLATES = [
  {
    id: 'rates_availability',
    title: 'Rates & Availability',
    description: 'Send rate sheet, pricing details, and date confirmation',
    subject: 'RGP Films & Studio — Rates & Availability for {event_type}',
    body: `<p>Hi {client_name},</p><p>Thank you for reaching out to <strong>RGP Films & Studio</strong> regarding your <strong>{event_type}</strong> on <strong>{event_date}</strong>!</p><p>We're happy to share that we are currently available for this date. We offer tailored photography and cinematic videography packages designed to capture every meaningful moment.</p><p>Please let us know if you'd like to review our full rate sheet or schedule a brief consultation to discuss your vision.</p><p>Warm regards,<br><strong>RGP Films & Studio Team</strong><br><a href="https://rgpfilms.studio">https://rgpfilms.studio</a></p>`,
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

// Initial mock synchronized messages adhering to email_drafting.json schema
const INITIAL_MESSAGES = [
  {
    id: 'msg_1_1',
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

// Reactive thread messages
const messages = ref(INITIAL_MESSAGES);

// Reactive drafts keyed by threadId: { [threadId]: { subject, body, to, templateId, attachments, savedAt } }
const drafts = ref({});

export function useEmailDrafts() {
  function getThreadMessages(threadId) {
    return messages.value
      .filter((m) => m.gmail_thread_id === threadId)
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
  }

  function discardDraft(threadId) {
    if (drafts.value[threadId]) {
      delete drafts.value[threadId];
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

  function sendReply(threadId, replyData) {
    const newMsg = {
      id: `msg_studio_${Date.now()}`,
      gmail_message_id: `gmail_mock_${Date.now()}`,
      gmail_thread_id: threadId,
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

    messages.value.push(newMsg);
    discardDraft(threadId);
    return newMsg;
  }

  return {
    messages,
    drafts,
    EMAIL_TEMPLATES,
    getThreadMessages,
    getDraft,
    hasDraft,
    saveDraft,
    discardDraft,
    renderTemplate,
    sendReply,
  };
}
