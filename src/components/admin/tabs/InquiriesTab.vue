<script setup>
import { ref, computed, nextTick } from 'vue';
import { useInquiries } from '../../../composables/useInquiries';
import { useEmailDrafts, EMAIL_TEMPLATES } from '../../../composables/useEmailDrafts';
import {
  Calendar,
  Mail,
  Phone,
  Trash2,
  Inbox,
  Clock,
  CheckCircle2,
  FileText,
  User,
  Eye,
  X,
  MessageSquare,
  StickyNote,
  ExternalLink,
  ChevronRight,
  ArrowLeft,
  Send,
  FileEdit,
  Save,
  Check,
  History,
  Loader2,
  Copy,
  Reply,
  Minus,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp,
  Tag,
  Star,
  Search,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link2,
  Paperclip,
  Download,
  Image as ImageIcon,
  Type,
  AlertTriangle,
} from '@lucide/vue';

const { inquiries, updateStatus, updateNotes, deleteInquiry } = useInquiries();
const {
  hasDraft,
  getDraft,
  saveDraft,
  discardDraft,
  renderTemplate,
  sendReply,
  getThreadMessages,
} = useEmailDrafts();

const selectedFilter = ref('All');
const filterStatuses = ['All', 'New', 'Contacted', 'Booked', 'Drafts', 'Archived'];
const searchQuery = ref('');

// Active in-page selected inquiry
const selectedInquiry = ref(null);
const showClientDetails = ref(false);
const copiedEmail = ref(false);
const draftSavedNotice = ref(false);
const isSending = ref(false);

// Gmail-style Floating Composer State (Initially hidden)
const isComposerVisible = ref(false);
const isComposerMinimized = ref(false);
const isComposerExpanded = ref(false);
const showFormattingToolbar = ref(false);

// Composer fields
const composerTo = ref('');
const composerSubject = ref('');
const composerBody = ref('');
const composerTemplateId = ref('');
const composerAttachments = ref([]);
const editorRef = ref(null);
const fileInputRef = ref(null);

const filteredInquiries = computed(() => {
  let list = inquiries.value;
  if (selectedFilter.value === 'Drafts') {
    list = list.filter((i) => hasDraft(i.id));
  } else if (selectedFilter.value !== 'All') {
    list = list.filter((i) => i.status === selectedFilter.value);
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase();
    list = list.filter((i) =>
      (i.name && i.name.toLowerCase().includes(q)) ||
      (i.email && i.email.toLowerCase().includes(q)) ||
      (i.event_type && i.event_type.toLowerCase().includes(q))
    );
  }

  return list;
});

const subsequentThreadMessages = computed(() => {
  if (!selectedInquiry.value) return [];
  const allMessages = getThreadMessages(selectedInquiry.value.id);
  // Omit the client's initial submission message because the email itself is already displayed as the main message above
  if (allMessages.length > 0 && allMessages[0].sender === 'client') {
    return allMessages.slice(1);
  }
  return allMessages;
});

function getStatusCount(status) {
  if (status === 'All') return inquiries.value.length;
  if (status === 'Drafts') return inquiries.value.filter((i) => hasDraft(i.id)).length;
  return inquiries.value.filter((i) => i.status === status).length;
}

function formatDate(dateStr) {
  if (!dateStr) return 'Flexible / TBD';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatMsgDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function handleFileUpload(e) {
  const files = Array.from(e.target.files || []);
  for (const file of files) {
    const isImg = file.type.startsWith('image/');
    composerAttachments.value.push({
      id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type,
      isImage: isImg,
      previewUrl: isImg ? URL.createObjectURL(file) : null,
    });
  }
  handleAutoSaveDraft();
  e.target.value = '';
}

function removeAttachment(index) {
  composerAttachments.value.splice(index, 1);
  handleAutoSaveDraft();
}

function convertTextToHtml(text) {
  if (!text) return '';
  if (/<[a-z][\s\S]*>/i.test(text)) {
    return text;
  }
  return text
    .split(/\n\s*\n/)
    .map((para) => `<p>${para.trim().replace(/\n/g, '<br>')}</p>`)
    .join('');
}

function syncEditorContent(htmlOrText) {
  const formatted = convertTextToHtml(htmlOrText || '');
  composerBody.value = formatted;
  nextTick(() => {
    if (editorRef.value) {
      editorRef.value.innerHTML = formatted;
    }
  });
}

function onEditorInput() {
  if (editorRef.value) {
    composerBody.value = editorRef.value.innerHTML;
    handleAutoSaveDraft();
  }
}

function applyFormatting(command) {
  if (!editorRef.value) return;
  editorRef.value.focus();

  if (command === 'link') {
    const url = prompt('Enter link URL (e.g. https://example.com):', 'https://');
    if (url) {
      document.execCommand('createLink', false, url);
    }
  } else {
    document.execCommand(command, false, null);
  }

  composerBody.value = editorRef.value.innerHTML;
  handleAutoSaveDraft();
}

function formatMessageContent(content) {
  if (!content) return '';
  if (/<[a-z][\s\S]*>/i.test(content)) {
    return content;
  }
  let sanitized = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return sanitized
    .split(/\n\s*\n/)
    .map((para) => `<p>${para.trim().replace(/\n/g, '<br>')}</p>`)
    .join('');
}

function selectInquiry(inq) {
  selectedInquiry.value = inq;
  isComposerVisible.value = false;
  isComposerMinimized.value = false;
  isComposerExpanded.value = false;
  initComposerForInquiry(inq);
}

function deselectInquiry() {
  selectedInquiry.value = null;
  isComposerVisible.value = false;
}

function openComposer() {
  if (!selectedInquiry.value) return;
  initComposerForInquiry(selectedInquiry.value);
  isComposerVisible.value = true;
  isComposerMinimized.value = false;
  nextTick(() => {
    if (editorRef.value) {
      editorRef.value.innerHTML = composerBody.value;
    }
  });
}

function closeComposer() {
  if ((composerBody.value.trim() || composerAttachments.value.length > 0) && selectedInquiry.value) {
    handleAutoSaveDraft();
  }
  isComposerVisible.value = false;
}

function toggleMinimizeComposer() {
  if (isComposerExpanded.value) {
    isComposerExpanded.value = false;
    isComposerMinimized.value = true;
  } else {
    isComposerMinimized.value = !isComposerMinimized.value;
  }
}

function toggleExpandComposer() {
  if (isComposerMinimized.value) {
    isComposerMinimized.value = false;
  }
  isComposerExpanded.value = !isComposerExpanded.value;
}

function initComposerForInquiry(inq) {
  if (!inq) return;
  composerTo.value = inq.email || '';

  const existingDraft = getDraft(inq.id);
  if (existingDraft) {
    composerSubject.value = existingDraft.subject || '';
    composerTemplateId.value = existingDraft.templateId || '';
    composerAttachments.value = existingDraft.attachments ? [...existingDraft.attachments] : [];
    syncEditorContent(existingDraft.body || '');
  } else {
    composerSubject.value = `Re: ${inq.event_type || 'Photography'} Inquiry — RGP Films & Studio`;
    composerTemplateId.value = '';
    composerAttachments.value = [];
    const defaultText = `<p>Hi ${inq.name || 'there'},</p><p>Thank you for reaching out to <strong>RGP Films & Studio</strong>!</p><p><br></p>`;
    syncEditorContent(defaultText);
  }
}

function applyTemplate(tpl) {
  if (!selectedInquiry.value) return;
  composerTemplateId.value = tpl.id;
  const rendered = renderTemplate(tpl, selectedInquiry.value);
  composerSubject.value = rendered.subject;
  syncEditorContent(rendered.body);
  handleAutoSaveDraft();
}

function handleAutoSaveDraft() {
  if (!selectedInquiry.value) return;
  saveDraft(selectedInquiry.value.id, {
    to: composerTo.value,
    subject: composerSubject.value,
    body: composerBody.value,
    templateId: composerTemplateId.value,
    attachments: [...composerAttachments.value],
  });
  draftSavedNotice.value = true;
  setTimeout(() => {
    draftSavedNotice.value = false;
  }, 2500);
}

function handleDiscardDraft() {
  if (!selectedInquiry.value) return;
  discardDraft(selectedInquiry.value.id);
  composerAttachments.value = [];
  initComposerForInquiry(selectedInquiry.value);
  draftSavedNotice.value = false;
}

// Toast Notification Feedback State
const toast = ref({
  visible: false,
  title: '',
  subtitle: '',
  type: 'success', // 'success' | 'danger' | 'info'
});
let toastTimer = null;

function triggerToast(title, subtitle = '', type = 'success', duration = 4000) {
  if (toastTimer) clearTimeout(toastTimer);
  toast.value = {
    visible: true,
    title,
    subtitle,
    type,
  };
  toastTimer = setTimeout(() => {
    toast.value.visible = false;
  }, duration);
}

function dismissToast() {
  if (toastTimer) clearTimeout(toastTimer);
  toast.value.visible = false;
}

// Delete Confirmation Modal State
const inquiryToDelete = ref(null);
const showDeleteConfirmModal = ref(false);

function promptDeleteInquiry(inquiry) {
  if (!inquiry) return;
  inquiryToDelete.value = inquiry;
  showDeleteConfirmModal.value = true;
}

function cancelDeleteInquiry() {
  showDeleteConfirmModal.value = false;
  inquiryToDelete.value = null;
}

function confirmDeleteInquiry() {
  if (!inquiryToDelete.value) return;
  const inq = inquiryToDelete.value;
  const name = inq.name || 'Inquiry';

  if (selectedInquiry.value && selectedInquiry.value.id === inq.id) {
    selectedInquiry.value = null;
    isComposerVisible.value = false;
  }

  deleteInquiry(inq.id);
  showDeleteConfirmModal.value = false;
  inquiryToDelete.value = null;

  triggerToast('Inquiry deleted', `Removed inquiry from ${name}`, 'info', 3500);
}

async function handleSendReply() {
  if (!selectedInquiry.value || (!composerBody.value.trim() && composerAttachments.value.length === 0)) return;

  const clientName = selectedInquiry.value.name || 'Client';
  const recipientEmail = composerTo.value || selectedInquiry.value.email;
  isSending.value = true;

  setTimeout(() => {
    sendReply(selectedInquiry.value.id, {
      to: composerTo.value,
      subject: composerSubject.value,
      body: composerBody.value,
      attachments: [...composerAttachments.value],
    });
    updateStatus(selectedInquiry.value.id, 'Contacted');
    composerAttachments.value = [];
    isSending.value = false;
    isComposerVisible.value = false;

    triggerToast('Email sent successfully', `Your reply to ${clientName} (${recipientEmail}) has been sent.`, 'success', 4500);
  }, 700);
}

function copyEmail(email) {
  if (!email) return;
  navigator.clipboard.writeText(email);
  copiedEmail.value = true;
  setTimeout(() => {
    copiedEmail.value = false;
  }, 2000);
}
</script>

<template>
  <div class="space-y-6 font-manrope">
    <!-- Top Header (Separated outside inbox container just like before) -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
      <div>
        <h2 class="text-2xl font-bold text-white tracking-wide">Inquiries & Leads</h2>
        <p class="text-xs text-neutral-400 mt-0.5">Manage incoming client booking requests, quotes, and messages</p>
      </div>
    </div>

    <!-- ========================================================= -->
    <!-- GMAIL-STYLE INBOX LIST VIEW                               -->
    <!-- ========================================================= -->
    <div v-if="!selectedInquiry" class="bg-[#141414] border border-white/[0.08] rounded-2xl overflow-hidden shadow-xl">
      <!-- Toolbar: Filters + Search Bar -->
      <div class="px-5 py-3.5 border-b border-white/[0.08] flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 bg-black/30">
        <!-- Filter Tabs -->
        <div class="flex flex-wrap gap-1.5 bg-black/50 p-1 rounded-xl border border-white/[0.06] shrink-0">
          <button
            v-for="status in filterStatuses"
            :key="status"
            @click="selectedFilter = status"
            class="cursor-pointer px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
            :class="[
              selectedFilter === status
                ? 'bg-white/15 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
            ]"
          >
            <span>{{ status }}</span>
            <span
              class="text-[10px] px-1.5 py-0.2 rounded-full font-mono"
              :class="[selectedFilter === status ? 'bg-black/40 text-neutral-200' : 'bg-white/5 text-neutral-500']"
            >
              {{ getStatusCount(status) }}
            </span>
          </button>
        </div>

        <!-- Search Bar -->
        <div class="relative flex-1 max-w-sm">
          <Search class="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search inquiries by name..."
            class="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-8.5 pr-8 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FFD700]/50 transition"
          />
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="cursor-pointer absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <!-- Gmail Rows List -->
      <div v-if="filteredInquiries.length > 0" class="divide-y divide-white/[0.04]">
        <div
          v-for="inq in filteredInquiries"
          :key="inq.id"
          @click="selectInquiry(inq)"
          class="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.04] transition-colors cursor-pointer group text-xs select-none min-h-[52px]"
          :class="[inq.status === 'New' ? 'bg-white/[0.02]' : '']"
        >
          <!-- Status Indicator Dot -->
          <div class="shrink-0 flex items-center">
            <span
              class="w-2 h-2 rounded-full"
              :class="[
                inq.status === 'New' ? 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)]' : inq.status === 'Contacted' ? 'bg-blue-400' : inq.status === 'Booked' ? 'bg-emerald-400' : 'bg-neutral-600'
              ]"
            ></span>
          </div>

          <!-- Sender / Client Name -->
          <div class="w-36 sm:w-44 shrink-0 truncate">
            <span
              class="text-sm truncate"
              :class="[inq.status === 'New' ? 'font-bold text-white' : 'font-semibold text-neutral-200']"
            >
              {{ inq.name }}
            </span>
          </div>

          <!-- Event Chip -->
          <div class="shrink-0 hidden sm:block">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/[0.06] text-neutral-300 border border-white/[0.08]">
              {{ inq.event_type }}
            </span>
          </div>

          <!-- Draft badge -->
          <div v-if="hasDraft(inq.id)" class="shrink-0">
            <span class="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Draft
            </span>
          </div>

          <!-- Subject & Message Snippet -->
          <div class="flex-1 min-w-0 truncate text-neutral-400">
            <span class="text-neutral-200 font-medium">{{ inq.event_type }} Inquiry — </span>
            <span class="text-neutral-400 font-normal">{{ inq.message }}</span>
          </div>

          <!-- Received Date & Hover Quick Actions (Zero layout shift with absolute overlay) -->
          <div class="w-24 shrink-0 h-7 flex items-center justify-end relative">
            <span class="text-[11px] text-neutral-500 group-hover:opacity-0 transition-opacity font-medium absolute right-0">
              {{ formatDate(inq.created_at) }}
            </span>

            <!-- Actions shown on hover -->
            <div class="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 absolute right-0 pointer-events-none group-hover:pointer-events-auto" @click.stop>
              <button
                @click="selectInquiry(inq)"
                class="cursor-pointer w-7 h-7 rounded-lg bg-white/10 hover:bg-[#FFD700] text-neutral-300 hover:text-black flex items-center justify-center transition shadow-sm"
                title="Open Conversation"
              >
                <Eye class="w-3.5 h-3.5" />
              </button>
              <button
                @click="promptDeleteInquiry(inq)"
                class="cursor-pointer w-7 h-7 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition"
                title="Delete"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-16 px-6 text-neutral-400 space-y-3">
        <Inbox class="w-8 h-8 mx-auto text-neutral-600" />
        <p class="text-sm font-medium">
          {{ searchQuery ? `No inquiries found matching "${searchQuery}"` : `No inquiries in "${selectedFilter}"` }}
        </p>
      </div>
    </div>

    <!-- ========================================================= -->
    <!-- GMAIL-STYLE SINGLE UNIFIED THREAD READER                  -->
    <!-- 1. Message                                                -->
    <!-- 2. Client Details                                         -->
    <!-- 3. Thread History                                         -->
    <!-- 4. Floating Gmail Composer (Hidden by default)            -->
    <!-- 5. Studio Notes                                           -->
    <!-- ========================================================= -->
    <div v-else class="bg-[#141414] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
      
      <!-- 1. Gmail Top Navigation Toolbar -->
      <div class="px-5 py-3 border-b border-white/[0.08] bg-black/40 flex items-center justify-between gap-3 text-xs">
        <div class="flex items-center gap-2">
          <button
            @click="deselectInquiry"
            class="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition flex items-center gap-1.5 font-semibold"
            title="Back to Inbox"
          >
            <ArrowLeft class="w-4 h-4" />
            <span class="hidden sm:inline">Back</span>
          </button>

          <div class="h-4 w-px bg-white/10 mx-1"></div>

          <!-- Status Selector Dropdown -->
          <div class="flex items-center gap-2">
            <span
              class="w-2 h-2 rounded-full shrink-0"
              :class="[
                selectedInquiry.status === 'New' ? 'bg-yellow-400' : selectedInquiry.status === 'Contacted' ? 'bg-blue-400' : selectedInquiry.status === 'Booked' ? 'bg-emerald-400' : 'bg-neutral-600'
              ]"
            ></span>
            <select
              :value="selectedInquiry.status"
              @change="updateStatus(selectedInquiry.id, $event.target.value)"
              class="cursor-pointer bg-transparent border border-white/10 px-2.5 py-1 rounded-lg text-xs font-bold focus:outline-none"
              :class="[
                selectedInquiry.status === 'New' ? 'text-yellow-300' : selectedInquiry.status === 'Contacted' ? 'text-blue-300' : selectedInquiry.status === 'Booked' ? 'text-emerald-300' : 'text-neutral-400'
              ]"
            >
              <option value="New" class="bg-neutral-900 text-yellow-300">New</option>
              <option value="Contacted" class="bg-neutral-900 text-blue-300">Contacted</option>
              <option value="Booked" class="bg-neutral-900 text-emerald-300">Booked</option>
              <option value="Archived" class="bg-neutral-900 text-neutral-400">Archived</option>
            </select>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <!-- Reply / Compose Button -->
          <button
            @click="openComposer"
            class="cursor-pointer px-4 py-1.5 rounded-full bg-[#FFD700] text-[#121212] hover:bg-yellow-400 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Reply class="w-3.5 h-3.5" />
            <span>{{ hasDraft(selectedInquiry.id) ? 'Continue Draft' : 'Reply' }}</span>
          </button>

          <!-- Delete Action -->
          <button
            @click="promptDeleteInquiry(selectedInquiry)"
            class="p-2 rounded-xl text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
            title="Delete this inquiry"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Main Reading Area (No double nesting!) -->
      <div class="p-6 md:p-8 space-y-6 flex-1">
        
        <!-- Subject Line & Tags -->
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
          <div class="space-y-1.5">
            <h1 class="text-xl md:text-2xl font-bold text-white tracking-tight">
              {{ selectedInquiry.event_type }} Inquiry — {{ selectedInquiry.name }}
            </h1>
            <div class="flex flex-wrap items-center gap-2 text-xs">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/10 text-neutral-200">
                {{ selectedInquiry.event_type }}
              </span>
              <span class="text-neutral-400">&bull;</span>
              <span class="text-neutral-400">Target Date: <strong class="text-white">{{ selectedInquiry.event_date ? formatDate(selectedInquiry.event_date) : 'Flexible / TBD' }}</strong></span>
            </div>
          </div>
        </div>

        <!-- SENDER HEADER (Gmail Sender row) -->
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-start gap-3 min-w-0">
            <!-- Avatar -->
            <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-500/20 to-amber-500/30 border border-yellow-500/30 flex items-center justify-center text-[#FFD700] font-bold text-sm shrink-0">
              {{ selectedInquiry.name.charAt(0) }}
            </div>

            <div class="min-w-0">
              <div class="flex flex-wrap items-baseline gap-2">
                <span class="font-bold text-white text-sm">{{ selectedInquiry.name }}</span>
                <span class="text-xs text-neutral-500 truncate">&lt;{{ selectedInquiry.email }}&gt;</span>
              </div>
              <div class="text-[11px] text-neutral-400 flex items-center gap-1 mt-0.5">
                <span>to studio@rgpfilms.com</span>
                <button
                  @click="showClientDetails = !showClientDetails"
                  class="text-[10px] text-neutral-500 hover:text-white cursor-pointer ml-1 inline-flex items-center gap-0.5"
                >
                  <span>{{ showClientDetails ? 'hide details' : 'show details' }}</span>
                  <ChevronUp v-if="showClientDetails" class="w-3 h-3" />
                  <ChevronDown v-else class="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          <!-- Date & Reply Shortcut -->
          <div class="text-right shrink-0 flex items-center gap-3">
            <span class="text-xs text-neutral-400 hidden sm:inline font-mono">
              {{ formatMsgDate(selectedInquiry.created_at) }}
            </span>
            <button
              @click="openComposer"
              class="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition"
              title="Reply"
            >
              <Reply class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- 2. CLIENT DETAILS (Uncluttered Gmail Metadata Details Strip) -->
        <div v-show="showClientDetails" class="py-3 px-4 rounded-xl bg-black/40 border border-white/[0.06] text-xs text-neutral-300 space-y-2">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <span class="text-neutral-500 text-[10px] uppercase font-semibold block">Email:</span>
              <div class="flex items-center gap-1.5 mt-0.5">
                <a :href="`mailto:${selectedInquiry.email}`" class="text-[#FFD700] hover:underline truncate">
                  {{ selectedInquiry.email }}
                </a>
                <button
                  @click="copyEmail(selectedInquiry.email)"
                  class="text-neutral-500 hover:text-white cursor-pointer"
                  title="Copy email"
                >
                  <Copy class="w-3 h-3" />
                </button>
              </div>
            </div>

            <div>
              <span class="text-neutral-500 text-[10px] uppercase font-semibold block">Phone / Viber:</span>
              <span class="text-white mt-0.5 block">{{ selectedInquiry.phone || 'Not provided' }}</span>
            </div>

            <div>
              <span class="text-neutral-500 text-[10px] uppercase font-semibold block">Received:</span>
              <span class="text-white mt-0.5 block">{{ formatMsgDate(selectedInquiry.created_at) }}</span>
            </div>
          </div>
        </div>

        <!-- 1. PRIMARY MESSAGE (Clean, flat typography directly on the surface) -->
        <div
          class="py-2 text-neutral-100 text-sm md:text-base leading-relaxed font-normal [&_p]:mb-3.5 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3.5 [&_li]:mb-1.5 [&_a]:text-[#FFD700] [&_a]:underline [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic [&_u]:underline"
          v-html="formatMessageContent(selectedInquiry.message)"
        ></div>

        <!-- Client / Initial Attachments (In-memory mock files) -->
        <div v-if="selectedInquiry.id === 'inq_1' || (selectedInquiry.attachments && selectedInquiry.attachments.length > 0)" class="space-y-2 pt-2">
          <span class="text-[11px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
            <Paperclip class="w-3.5 h-3.5 text-neutral-400" />
            <span>Attachments (2)</span>
          </span>
          <div class="flex flex-wrap gap-2.5">
            <div
              v-for="att in [
                { name: 'Tagaytay_Wedding_Moodboard.pdf', size: '2.4 MB', type: 'application/pdf', isImage: false },
                { name: 'Church_Interior_Sample.jpg', size: '1.8 MB', type: 'image/jpeg', isImage: true }
              ]"
              :key="att.name"
              class="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-black/40 border border-white/10 hover:border-white/25 text-xs transition group cursor-pointer"
            >
              <div class="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center text-neutral-300">
                <ImageIcon v-if="att.isImage" class="w-3.5 h-3.5 text-neutral-400" />
                <FileText v-else class="w-3.5 h-3.5 text-neutral-400" />
              </div>
              <div class="min-w-0 max-w-[160px]">
                <p class="text-white text-xs font-semibold truncate">{{ att.name }}</p>
                <p class="text-[10px] text-neutral-500">{{ att.size }}</p>
              </div>
              <Download class="w-3.5 h-3.5 text-neutral-400 group-hover:text-white ml-1 transition" />
            </div>
          </div>
        </div>

        <!-- 3. THREAD CONVERSATION HISTORY -->
        <div v-if="subsequentThreadMessages.length > 0" class="pt-6 border-t border-white/[0.08] space-y-4">
          <div class="text-[11px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
            <History class="w-3.5 h-3.5 text-neutral-400" />
            <span>Replies & Conversation ({{ subsequentThreadMessages.length }})</span>
          </div>

          <!-- Chronological Conversation Timeline -->
          <div class="space-y-4">
            <div
              v-for="msg in subsequentThreadMessages"
              :key="msg.id"
              class="flex flex-col"
              :class="[msg.sender === 'studio' ? 'items-end' : 'items-start']"
            >
              <div
                class="p-4 rounded-2xl transition max-w-[90%] sm:max-w-[75%]"
                :class="[
                  msg.sender === 'studio'
                    ? 'bg-white/[0.08] border border-white/15 rounded-tr-sm shadow-md'
                    : 'bg-black/40 border border-white/[0.07] rounded-tl-sm'
                ]"
              >
                <div
                  class="flex items-center gap-2 text-xs mb-2 border-b pb-1.5"
                  :class="[
                    msg.sender === 'studio'
                      ? 'justify-end border-white/10'
                      : 'justify-start border-white/[0.06]'
                  ]"
                >
                  <span class="font-bold text-white">{{ msg.sender_name }}</span>
                  <span
                    class="font-mono text-[11px]"
                    :class="[msg.sender === 'studio' ? 'text-neutral-400' : 'text-neutral-500']"
                  >
                    {{ formatMsgDate(msg.created_at) }}
                  </span>
                </div>

                <div
                  class="text-sm leading-relaxed text-left [&_p]:mb-3.5 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3.5 [&_li]:mb-1.5 [&_a]:text-[#FFD700] [&_a]:underline [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic [&_u]:underline"
                  :class="[msg.sender === 'studio' ? 'text-neutral-100' : 'text-neutral-200']"
                  v-html="formatMessageContent(msg.body)"
                ></div>

                <!-- Thread Message Attachments (if any) -->
                <div v-if="msg.attachments && msg.attachments.length > 0" class="mt-3 pt-2.5 border-t border-white/[0.06] flex flex-wrap gap-2">
                  <div
                    v-for="att in msg.attachments"
                    :key="att.id || att.name"
                    class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-[11px]"
                    :class="[
                      msg.sender === 'studio'
                        ? 'bg-black/40 border-white/15'
                        : 'bg-black/50 border-white/10'
                    ]"
                  >
                    <ImageIcon v-if="att.isImage" class="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <FileText v-else class="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span class="text-neutral-200 font-medium truncate max-w-[140px]">{{ att.name }}</span>
                    <span class="text-neutral-500 text-[10px] font-mono">{{ att.size }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Gmail Reply Prompt Box -->
        <div class="pt-4 border-t border-white/[0.08]">
          <div
            @click="openComposer"
            class="cursor-pointer p-4 rounded-xl border border-white/10 hover:border-white/30 bg-black/30 hover:bg-white/[0.03] text-neutral-400 hover:text-white transition flex items-center justify-between text-xs group"
          >
            <div class="flex items-center gap-2">
              <Reply class="w-4 h-4 text-[#FFD700] group-hover:scale-110 transition-transform" />
              <span>{{ hasDraft(selectedInquiry.id) ? 'Click to resume draft reply...' : 'Click here to Reply to ' + selectedInquiry.name + '...' }}</span>
            </div>
            <span v-if="hasDraft(selectedInquiry.id)" class="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 font-semibold">
              Draft Active
            </span>
          </div>
        </div>

        <!-- 5. STUDIO PRIVATE NOTES (Clean flat field) -->
        <div class="pt-4 border-t border-white/[0.08] space-y-2">
          <label class="text-[11px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
            <StickyNote class="w-3.5 h-3.5 text-neutral-500" />
            <span>Studio Notes (Private):</span>
          </label>
          <textarea
            rows="2"
            :value="selectedInquiry.internal_notes || ''"
            @blur="updateNotes(selectedInquiry.id, $event.target.value)"
            placeholder="Add internal studio notes (e.g. Discussed package over Viber, booking deposit received)..."
            class="w-full p-3 rounded-xl bg-black/40 border border-white/[0.06] text-white text-xs focus:outline-none focus:border-[#FFD700] transition resize-none leading-relaxed"
          ></textarea>
        </div>
      </div>
    </div>

    <!-- ========================================================= -->
    <!-- 4. GMAIL-STYLE DOCKED / FLOATING COMPOSE EMAIL WIDGET     -->
    <!-- Initially hidden, docked bottom-right or expanded         -->
    <!-- ========================================================= -->
    <Teleport to="body">
      <div
        v-if="isComposerVisible && selectedInquiry"
        class="font-manrope select-none"
      >
        <!-- Fullscreen Backdrop (100% full screen coverage when expanded) -->
        <div
          v-if="isComposerExpanded"
          class="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm transition-opacity"
          @click="toggleExpandComposer"
        ></div>

        <!-- Composer Box Container -->
        <div
          class="fixed z-[10000] bg-[#181818] border border-white/20 shadow-2xl overflow-hidden flex flex-col transition-all duration-200"
          :class="[
            isComposerExpanded
              ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-4xl h-[720px] max-h-[90vh] rounded-2xl'
              : [
                  'bottom-0 right-4 sm:right-8 w-[95vw] sm:w-[600px] rounded-t-2xl rounded-b-none shadow-[0_-8px_30px_rgba(0,0,0,0.8)]',
                  isComposerMinimized ? 'h-11' : 'h-[560px] sm:h-[600px] max-h-[85vh]'
                ]
          ]"
        >
          <!-- Gmail Header Bar -->
          <div
            @click="isComposerMinimized && toggleMinimizeComposer()"
            class="px-4 py-2.5 bg-black/80 border-b border-white/10 flex items-center justify-between cursor-pointer shrink-0"
          >
            <div class="flex items-center gap-2 min-w-0">
              <span class="w-2.5 h-2.5 rounded-full bg-[#FFD700]"></span>
              <span class="text-xs font-bold text-white truncate">
                Reply: {{ selectedInquiry.name }}
              </span>
              <span v-if="hasDraft(selectedInquiry.id)" class="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/20 text-amber-300 font-semibold">
                Draft
              </span>
            </div>

            <!-- Window Controls -->
            <div class="flex items-center gap-1 shrink-0" @click.stop>
              <button
                @click="toggleMinimizeComposer"
                class="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                :title="isComposerMinimized ? 'Expand' : 'Minimize'"
              >
                <Minus class="w-3.5 h-3.5" />
              </button>

              <button
                @click="toggleExpandComposer"
                class="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition hidden sm:block cursor-pointer"
                :title="isComposerExpanded ? 'Restore' : 'Maximize'"
              >
                <Minimize2 v-if="isComposerExpanded" class="w-3.5 h-3.5" />
                <Maximize2 v-else class="w-3.5 h-3.5" />
              </button>

              <button
                @click="closeComposer"
                class="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition ml-1 cursor-pointer"
                title="Close & Save Draft"
              >
                <X class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Composer Content (Hidden when minimized) -->
          <div v-show="!isComposerMinimized" class="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col bg-[#161616]">
            
            <!-- Quick Studio Templates Inserter -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                  Quick Templates:
                </span>
                <span v-if="draftSavedNotice" class="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                  <Check class="w-3.5 h-3.5" />
                  <span>Draft Saved</span>
                </span>
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  v-for="tpl in EMAIL_TEMPLATES"
                  :key="tpl.id"
                  @click="applyTemplate(tpl)"
                  type="button"
                  class="cursor-pointer px-3 py-2.5 rounded-xl border text-left transition"
                  :class="[
                    composerTemplateId === tpl.id
                      ? 'bg-white/15 border-white/30 text-white shadow-sm'
                      : 'bg-black/40 border-white/[0.08] text-neutral-300 hover:bg-white/[0.06] hover:text-white'
                  ]"
                >
                  <span class="text-xs font-semibold block truncate">{{ tpl.title }}</span>
                </button>
              </div>
            </div>

            <!-- Metadata: To, Subject -->
            <div class="space-y-2 text-xs border-y border-white/[0.06] py-2.5">
              <div class="flex items-center gap-2">
                <span class="text-neutral-500 w-14 shrink-0 font-medium text-xs">To:</span>
                <input
                  type="email"
                  v-model="composerTo"
                  @input="handleAutoSaveDraft"
                  class="flex-1 bg-transparent text-white border-b border-white/[0.08] pb-0.5 focus:outline-none focus:border-[#FFD700] text-sm"
                />
              </div>

              <div class="flex items-center gap-2">
                <span class="text-neutral-500 w-14 shrink-0 font-medium text-xs">Subject:</span>
                <input
                  type="text"
                  v-model="composerSubject"
                  @input="handleAutoSaveDraft"
                  class="flex-1 bg-transparent text-white font-semibold border-b border-white/[0.08] pb-0.5 focus:outline-none focus:border-[#FFD700] text-sm"
                />
              </div>
            </div>

            <!-- Email Message Body (WYSIWYG Rich Text) -->
            <div class="flex-1 flex flex-col min-h-[180px] relative">
              <div
                ref="editorRef"
                contenteditable="true"
                @input="onEditorInput"
                @blur="handleAutoSaveDraft"
                data-placeholder="Write your email reply..."
                class="w-full flex-1 p-4 pb-14 rounded-xl bg-black/40 border border-white/[0.06] text-white text-sm sm:text-[14.5px] leading-relaxed focus:outline-none focus:border-white/20 transition overflow-y-auto select-text font-sans empty:before:content-[attr(data-placeholder)] empty:before:text-neutral-500 empty:before:pointer-events-none [&_p]:mb-3.5 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3.5 [&_li]:mb-1.5 [&_a]:text-[#FFD700] [&_a]:underline [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic [&_u]:underline outline-none"
              ></div>

              <!-- Floating Formatting Toolbar (Floats ON TOP of text editor at the bottom) -->
              <transition
                enter-active-class="transition duration-150 ease-out"
                enter-from-class="opacity-0 translate-y-2 scale-95"
                enter-to-class="opacity-100 translate-y-0 scale-100"
                leave-active-class="transition duration-100 ease-in"
                leave-from-class="opacity-100 translate-y-0 scale-100"
                leave-to-class="opacity-0 translate-y-2 scale-95"
              >
                <div
                  v-if="showFormattingToolbar"
                  class="absolute bottom-3 left-3 z-10 flex items-center gap-0.5 bg-[#202020]/95 backdrop-blur-md p-1 rounded-xl border border-white/15 shadow-2xl text-neutral-300"
                >
                  <button
                    type="button"
                    @mousedown.prevent="applyFormatting('bold')"
                    class="cursor-pointer p-1.5 rounded-lg hover:text-white hover:bg-white/10 transition font-bold"
                    title="Bold"
                  >
                    <Bold class="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    @mousedown.prevent="applyFormatting('italic')"
                    class="cursor-pointer p-1.5 rounded-lg hover:text-white hover:bg-white/10 transition italic"
                    title="Italic"
                  >
                    <Italic class="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    @mousedown.prevent="applyFormatting('underline')"
                    class="cursor-pointer p-1.5 rounded-lg hover:text-white hover:bg-white/10 transition underline"
                    title="Underline"
                  >
                    <Underline class="w-3.5 h-3.5" />
                  </button>

                  <div class="w-px h-3.5 bg-white/15 mx-1"></div>

                  <button
                    type="button"
                    @mousedown.prevent="applyFormatting('insertUnorderedList')"
                    class="cursor-pointer p-1.5 rounded-lg hover:text-white hover:bg-white/10 transition"
                    title="Bullet List"
                  >
                    <List class="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    @mousedown.prevent="applyFormatting('insertOrderedList')"
                    class="cursor-pointer p-1.5 rounded-lg hover:text-white hover:bg-white/10 transition"
                    title="Numbered List"
                  >
                    <ListOrdered class="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    @mousedown.prevent="applyFormatting('link')"
                    class="cursor-pointer p-1.5 rounded-lg hover:text-white hover:bg-white/10 transition"
                    title="Insert Link"
                  >
                    <Link2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </transition>
            </div>

            <!-- Attached Files Tray (When files are attached) -->
            <div v-if="composerAttachments.length > 0" class="space-y-1.5 pt-2 border-t border-white/[0.06]">
              <div class="flex items-center justify-between text-[10px] uppercase font-bold text-neutral-400">
                <span class="flex items-center gap-1 text-neutral-400">
                  <Paperclip class="w-3 h-3 text-neutral-400" />
                  <span>Attached ({{ composerAttachments.length }}) &bull; In-Memory</span>
                </span>
                <button
                  @click="composerAttachments = []; handleAutoSaveDraft()"
                  type="button"
                  class="text-neutral-500 hover:text-red-400 cursor-pointer lowercase"
                >
                  clear all
                </button>
              </div>

              <div class="flex flex-wrap gap-2 max-h-24 overflow-y-auto pr-1">
                <div
                  v-for="(att, idx) in composerAttachments"
                  :key="att.id || idx"
                  class="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-black/60 border border-white/10 text-xs group"
                >
                  <img
                    v-if="att.isImage && att.previewUrl"
                    :src="att.previewUrl"
                    alt="preview"
                    class="w-5 h-5 rounded object-cover border border-white/10"
                  />
                  <ImageIcon v-else-if="att.isImage" class="w-3.5 h-3.5 text-neutral-300 shrink-0" />
                  <FileText v-else class="w-3.5 h-3.5 text-neutral-300 shrink-0" />

                  <span class="text-neutral-200 text-[11px] font-semibold truncate max-w-[130px]">{{ att.name }}</span>
                  <span class="text-[10px] text-neutral-500 font-mono">{{ att.size }}</span>

                  <button
                    type="button"
                    @click="removeAttachment(idx)"
                    class="cursor-pointer text-neutral-500 hover:text-red-400 transition ml-1 p-0.5 rounded"
                    title="Remove attachment"
                  >
                    <X class="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Bottom Toolbar -->
            <div class="flex items-center justify-between pt-2.5 border-t border-white/[0.06] shrink-0">
              <div class="flex items-center gap-1">
                <button
                  @click="handleDiscardDraft"
                  type="button"
                  class="cursor-pointer p-2 rounded-xl text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition"
                  title="Discard Draft"
                >
                  <Trash2 class="w-4 h-4" />
                </button>

                <!-- Save Draft (Icon Only, Neutral) -->
                <button
                  @click="handleAutoSaveDraft"
                  type="button"
                  class="cursor-pointer p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition"
                  title="Save draft"
                >
                  <Save class="w-4 h-4" />
                </button>

                <!-- Format Toggle (Icon Only, Neutral) -->
                <button
                  type="button"
                  @click="showFormattingToolbar = !showFormattingToolbar"
                  class="cursor-pointer p-2 rounded-xl transition"
                  :class="[
                    showFormattingToolbar
                      ? 'bg-white/20 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white hover:bg-white/10'
                  ]"
                  title="Formatting options"
                >
                  <Type class="w-4 h-4" />
                </button>

                <!-- Attach Files (Icon Only, Neutral) -->
                <input
                  type="file"
                  ref="fileInputRef"
                  multiple
                  @change="handleFileUpload"
                  class="hidden"
                />
                <button
                  type="button"
                  @click="fileInputRef && fileInputRef.click()"
                  class="cursor-pointer p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition"
                  title="Attach files or images"
                >
                  <Paperclip class="w-4 h-4" />
                </button>
              </div>

              <!-- Send Action -->
              <button
                @click="handleSendReply"
                :disabled="(!composerBody.trim() && composerAttachments.length === 0) || isSending"
                class="cursor-pointer px-5 py-2 rounded-full bg-[#FFD700] text-[#121212] font-bold text-xs uppercase tracking-wider hover:bg-yellow-400 transition shadow-md shadow-yellow-500/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <Loader2 v-if="isSending" class="w-3.5 h-3.5 animate-spin" />
                <Send v-else class="w-3 h-3" />
                <span>{{ isSending ? 'Sending...' : 'Send Reply' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ========================================================= -->
    <!-- VISUAL TOAST FEEDBACK NOTIFICATION                        -->
    <!-- ========================================================= -->
    <Teleport to="body">
      <transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-6 scale-95"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0 scale-100"
        leave-to-class="opacity-0 translate-y-6 scale-95"
      >
        <div
          v-if="toast.visible"
          class="fixed bottom-6 left-6 z-[10001] max-w-md w-[calc(100vw-3rem)] sm:w-auto bg-[#1a1a1a]/95 backdrop-blur-md border border-white/15 text-white px-4 py-3 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.8)] flex items-center justify-between gap-3.5 font-manrope select-none"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div
              class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              :class="[
                toast.type === 'success'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : toast.type === 'danger'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-white/10 text-neutral-300 border border-white/15'
              ]"
            >
              <CheckCircle2 v-if="toast.type === 'success'" class="w-4 h-4" />
              <AlertTriangle v-else-if="toast.type === 'danger'" class="w-4 h-4" />
              <Trash2 v-else class="w-4 h-4" />
            </div>

            <div class="min-w-0">
              <p class="text-xs font-bold text-white truncate">{{ toast.title }}</p>
              <p v-if="toast.subtitle" class="text-[11px] text-neutral-400 truncate mt-0.5">{{ toast.subtitle }}</p>
            </div>
          </div>

          <button
            @click="dismissToast"
            type="button"
            class="cursor-pointer p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition shrink-0 ml-2"
            title="Dismiss"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </transition>
    </Teleport>

    <!-- ========================================================= -->
    <!-- DELETE INQUIRY CONFIRMATION MODAL                         -->
    <!-- ========================================================= -->
    <Teleport to="body">
      <div v-if="showDeleteConfirmModal && inquiryToDelete" class="font-manrope select-none">
        <!-- Backdrop -->
        <div
          class="fixed inset-0 z-[10002] bg-black/80 backdrop-blur-sm transition-opacity"
          @click="cancelDeleteInquiry"
        ></div>

        <!-- Modal Card -->
        <div
          class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[10003] w-[90vw] max-w-md bg-[#161616] border border-white/15 rounded-2xl shadow-2xl p-6 space-y-5"
        >
          <div class="flex items-start gap-4">
            <div class="w-10 h-10 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
              <Trash2 class="w-5 h-5" />
            </div>

            <div class="space-y-1.5 flex-1 min-w-0">
              <h3 class="text-base font-bold text-white">Delete Inquiry?</h3>
              <p class="text-xs text-neutral-300 leading-relaxed">
                Are you sure you want to delete the inquiry from
                <span class="font-semibold text-white">{{ inquiryToDelete.name }}</span>
                <span class="text-neutral-400"> ({{ inquiryToDelete.email }})</span>?
              </p>
              <p class="text-[11px] text-neutral-500">
                This inquiry and its conversation history will be permanently removed.
              </p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center justify-end gap-2.5 pt-2 border-t border-white/[0.08]">
            <button
              type="button"
              @click="cancelDeleteInquiry"
              class="cursor-pointer px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/10 text-neutral-300 hover:text-white text-xs font-semibold transition"
            >
              Cancel
            </button>

            <button
              type="button"
              @click="confirmDeleteInquiry"
              class="cursor-pointer px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition shadow-lg shadow-red-500/20 flex items-center gap-1.5"
            >
              <Trash2 class="w-3.5 h-3.5" />
              <span>Delete Inquiry</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

