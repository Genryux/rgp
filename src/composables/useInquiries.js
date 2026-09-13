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
        inquiries.value = data;
      }
    } catch (err) {
      console.error('[Inquiries] Error fetching inquiries:', err);
    } finally {
      loading.value = false;
    }
  }

  async function submitInquiry(formData) {
    const newInquiry = {
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
        const { data, error } = await supabase
          .from('inquiries')
          .insert(newInquiry)
          .select()
          .single();

        if (error) throw error;
        return { data, error: null };
      } catch (err) {
        console.error('[Inquiries] Submit failed:', err);
        return { data: null, error: err };
      }
    } else {
      // Mock submit
      newInquiry.id = `inq_${Date.now()}`;
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
    submitInquiry,
    updateStatus,
    updateNotes,
    deleteInquiry,
  };
}
