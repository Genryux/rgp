import { ref } from 'vue';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Mock inquiries for offline development
const DEFAULT_INQUIRIES = [
  {
    id: 'inq_1',
    name: 'Maria Santos',
    email: 'maria.santos@example.com',
    phone: '+63 917 123 4567',
    event_type: 'Wedding',
    event_date: '2026-12-18',
    message: 'Hi! We are looking for full-day photo and video coverage for our church wedding in Tagaytay.',
    status: 'New',
    internal_notes: '',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'inq_2',
    name: 'David Reyes',
    email: 'david.reyes@example.com',
    phone: '+63 918 987 6543',
    event_type: 'Debut',
    event_date: '2026-11-05',
    message: 'Hello, inquiring about the Grand Debut package and availability for November.',
    status: 'Contacted',
    internal_notes: 'Sent rate sheet via email on Sept 12.',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

const inquiries = ref(DEFAULT_INQUIRIES);
const loading = ref(false);

const READ_STORAGE_KEY = 'rgp_studio_read_inquiries_v1';

function getStoredReadIds() {
  try {
    const raw = localStorage.getItem(READ_STORAGE_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

export function useInquiries() {
  async function fetchInquiries() {
    if (!isSupabaseConfigured || !supabase) return;
    loading.value = true;
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        const storedRead = getStoredReadIds();
        inquiries.value = data.map((item) => ({
          ...item,
          read: Boolean(item.read || storedRead.has(item.id) || item.status !== 'New'),
        }));
      }
    } catch (err) {
      console.error('[Inquiries] Error fetching inquiries:', err);
    } finally {
      loading.value = false;
    }
  }

  async function markInquiryAsRead(id) {
    if (!id) return;
    const item = inquiries.value.find((inq) => inq.id === id);
    if (item) {
      item.read = true;
    }

    try {
      const raw = localStorage.getItem(READ_STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      if (!list.includes(id)) {
        list.push(id);
        localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(list));
      }
    } catch (e) {}

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('inquiries')
          .update({ read: true })
          .eq('id', id);
      } catch (err) {
        console.warn('[Inquiries] Error marking inquiry as read in DB:', err);
      }
    }
  }

  async function submitInquiry(formData) {
    const inquiryId = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : `inq_${Date.now()}`;

    const newInquiry = {
      id: inquiryId,
      name: formData.name,
      email: formData.email,
      phone: formData.phone || null,
      event_type: formData.event_type || 'General Inquiry',
      event_date: formData.event_date || null,
      message: formData.message,
      status: 'New',
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('inquiries')
          .insert(newInquiry);

        if (error) throw error;

        // Dispatches instant email notification to the studio's connected Gmail account
        supabase.functions.invoke('notify-inquiry', {
          body: {
            inquiryId,
            name: newInquiry.name,
            email: newInquiry.email,
            phone: newInquiry.phone,
            event_type: newInquiry.event_type,
            event_date: newInquiry.event_date,
            message: newInquiry.message,
          },
        }).then(({ data, error: fnErr }) => {
          if (fnErr) {
            console.warn('[Inquiries] notify-inquiry dispatch warning:', fnErr);
          } else {
            console.log('[Inquiries] notify-inquiry dispatched successfully:', data);
          }
        }).catch((err) => {
          console.warn('[Inquiries] notify-inquiry invocation error:', err);
        });

        return { data: newInquiry, error: null };
      } catch (err) {
        console.error('[Inquiries] Submit failed:', err);
        return { data: null, error: err };
      }
    } else {
      // Mock submit
      inquiries.value.unshift(newInquiry);
      return { data: newInquiry, error: null };
    }
  }

  async function updateStatus(id, newStatus) {
    const item = inquiries.value.find((inq) => inq.id === id);
    if (!item) return;
    item.status = newStatus;

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('inquiries')
          .update({ status: newStatus })
          .eq('id', id);
      } catch (err) {
        console.error('[Inquiries] Update status failed:', err);
      }
    }
  }

  async function updateNotes(id, notes) {
    const item = inquiries.value.find((inq) => inq.id === id);
    if (!item) return;
    item.internal_notes = notes;

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('inquiries')
          .update({ internal_notes: notes })
          .eq('id', id);
      } catch (err) {
        console.error('[Inquiries] Update notes failed:', err);
      }
    }
  }

  async function deleteInquiry(id) {
    inquiries.value = inquiries.value.filter((inq) => inq.id !== id);
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('inquiries').delete().eq('id', id);
      } catch (err) {
        console.error('[Inquiries] Delete failed:', err);
      }
    }
  }

  return {
    inquiries,
    loading,
    fetchInquiries,
    markInquiryAsRead,
    submitInquiry,
    updateStatus,
    updateNotes,
    deleteInquiry,
  };
}
