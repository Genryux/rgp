<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useEmailDrafts, EMAIL_TEMPLATES } from '../../../composables/useEmailDrafts';
import { useModalState } from '../../../composables/useModalState';
import {
  Send,
  Save,
  Trash2,
  X,
  Sparkles,
  Mail,
  User,
  Clock,
  CheckCircle2,
  Calendar,
  MessageSquare,
  FileText,
  Check,
  History,
  CornerDownRight,
  Loader2,
} from '@lucide/vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  inquiry: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['close', 'reply-sent']);

const {
  getThreadMessages,
  getDraft,
  hasDraft,
  saveDraft,
  discardDraft,
  renderTemplate,
  sendReply,
} = useEmailDrafts();

const { openModal, closeModal } = useModalState();

const recipientEmail = ref('');
const subject = ref('');
const body = ref('');
const selectedTemplateId = ref('');
const isSending = ref(false);
const draftSavedNotice = ref(false);
const activeView = ref('composer'); // 'composer' | 'thread'

// Watch modal open/close and inquiry changes for dock taskbar management & initialization
watch(
  [() => props.isOpen, () => props.inquiry],
  ([open, inq]) => {
    if (open && inq) {
      openModal();
      activeView.value = 'composer';
      initComposer();
    } else if (!open) {
      closeModal();
    }
  },
  { immediate: true }
);

// Get all thread messages for this inquiry
const threadMessages = computed(() => {
  if (!props.inquiry) return [];
  return getThreadMessages(props.inquiry.id);
});

function initComposer() {
  if (!props.inquiry) return;
  recipientEmail.value = props.inquiry.email || '';

  const existingDraft = getDraft(props.inquiry.id);
  if (existingDraft) {
    subject.value = existingDraft.subject || '';
    body.value = existingDraft.body || '';
    selectedTemplateId.value = existingDraft.templateId || '';
  } else {
    subject.value = `Re: ${props.inquiry.event_type || 'Photography'} Inquiry — RGP Films & Studio`;
    body.value = `Hi ${props.inquiry.name || 'there'},\n\nThank you for reaching out to RGP Films & Studio!\n\n`;
    selectedTemplateId.value = '';
  }
}

function applyTemplate(tpl) {
  if (!props.inquiry) return;
  selectedTemplateId.value = tpl.id;
  const rendered = renderTemplate(tpl, props.inquiry);
  subject.value = rendered.subject;
  body.value = rendered.body;
  handleAutoSaveDraft();
}

function handleAutoSaveDraft() {
  if (!props.inquiry) return;
  saveDraft(props.inquiry.id, {
    to: recipientEmail.value,
    subject: subject.value,
    body: body.value,
    templateId: selectedTemplateId.value,
  });
  draftSavedNotice.value = true;
  setTimeout(() => {
    draftSavedNotice.value = false;
  }, 2500);
}

function handleDiscard() {
  if (!props.inquiry) return;
  discardDraft(props.inquiry.id);
  initComposer();
  draftSavedNotice.value = false;
}

async function handleSendReply() {
  if (!props.inquiry || !body.value.trim()) return;

  isSending.value = true;

  // Simulate realistic network latency for sending through Gmail sync engine
  setTimeout(() => {
    const sentMsg = sendReply(props.inquiry.id, {
      to: recipientEmail.value,
      subject: subject.value,
      body: body.value,
    });

    isSending.value = false;
    emit('reply-sent', { inquiryId: props.inquiry.id, message: sentMsg });
    emit('close');
  }, 700);
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
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen && inquiry"
      class="fixed inset-0 bg-black/85 backdrop-blur-md z-[10000] flex items-center justify-center p-3 sm:p-5 select-none font-manrope"
      @click.self="emit('close')"
    >
      <div class="bg-[#141414] border border-white/[0.12] rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        <!-- Header -->
        <div class="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between bg-black/40">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-9 h-9 rounded-2xl bg-[#FFD700]/10 border border-[#FFD700]/20 flex items-center justify-center text-[#FFD700] shrink-0">
              <Mail class="w-4 h-4" />
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <h3 class="text-base font-bold text-white truncate">
                  Draft Email to {{ inquiry.name }}
                </h3>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 text-neutral-300">
                  {{ inquiry.event_type }}
                </span>
                <span v-if="hasDraft(inquiry.id)" class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-300">
                  Draft Saved
                </span>
              </div>
              <p class="text-xs text-neutral-400 truncate">
                {{ inquiry.email }} &bull; Target: {{ inquiry.event_date ? new Date(inquiry.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Flexible / TBD' }}
              </p>
            </div>
          </div>

          <!-- Top View Toggle & Close -->
          <div class="flex items-center gap-2 shrink-0">
            <!-- View Mode Switcher -->
            <div class="bg-black/60 p-1 rounded-xl border border-white/10 flex items-center gap-1">
              <button
                @click="activeView = 'composer'"
                class="cursor-pointer px-3 py-1 rounded-lg text-xs font-semibold transition"
                :class="[
                  activeView === 'composer'
                    ? 'bg-white/15 text-white'
                    : 'text-neutral-400 hover:text-white'
                ]"
              >
                Compose
              </button>
              <button
                @click="activeView = 'thread'"
                class="cursor-pointer px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
                :class="[
                  activeView === 'thread'
                    ? 'bg-white/15 text-white'
                    : 'text-neutral-400 hover:text-white'
                ]"
              >
                <span>Thread History</span>
                <span class="px-1.5 py-0.2 rounded-full bg-white/10 text-[10px] font-mono">
                  {{ threadMessages.length }}
                </span>
              </button>
            </div>

            <button
              @click="emit('close')"
              class="cursor-pointer p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition ml-2"
              title="Close modal"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Body Area -->
        <div class="flex-1 overflow-y-auto p-6 space-y-5">
          
          <!-- ============================================== -->
          <!-- 1. COMPOSER VIEW -->
          <!-- ============================================== -->
          <div v-if="activeView === 'composer'" class="space-y-4">
            
            <!-- Quick Template Selector Carousel / Bar -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <label class="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <Sparkles class="w-3.5 h-3.5 text-[#FFD700]" />
                  <span>Insert Studio Quick Template:</span>
                </label>
                <span v-if="draftSavedNotice" class="text-[11px] text-emerald-400 flex items-center gap-1">
                  <Check class="w-3 h-3" />
                  <span>Draft auto-saved</span>
                </span>
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  v-for="tpl in EMAIL_TEMPLATES"
                  :key="tpl.id"
                  @click="applyTemplate(tpl)"
                  type="button"
                  class="cursor-pointer p-2.5 rounded-2xl border text-left transition group relative flex flex-col justify-between"
                  :class="[
                    selectedTemplateId === tpl.id
                      ? 'bg-white/10 border-white/30 text-white'
                      : 'bg-black/30 border-white/[0.08] text-neutral-300 hover:bg-white/[0.05] hover:border-white/20'
                  ]"
                >
                  <span class="text-xs font-bold block truncate group-hover:text-white">{{ tpl.title }}</span>
                  <span class="text-[10px] text-neutral-500 line-clamp-1 mt-0.5">{{ tpl.description }}</span>
                </button>
              </div>
            </div>

            <!-- Email Meta Fields -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-black/40 border border-white/[0.06]">
              <div>
                <span class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 block mb-1">To (Client):</span>
                <input
                  type="email"
                  v-model="recipientEmail"
                  @input="handleAutoSaveDraft"
                  class="w-full px-3 py-1.5 rounded-xl bg-black/50 border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[#FFD700]"
                />
              </div>

              <div>
                <span class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 block mb-1">From:</span>
                <div class="px-3 py-1.5 rounded-xl bg-black/30 border border-white/[0.06] text-neutral-400 text-xs truncate">
                  RGP Films & Studio &lt;studio@rgpfilms.com&gt;
                </div>
              </div>

              <div class="md:col-span-2">
                <span class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 block mb-1">Subject Line:</span>
                <input
                  type="text"
                  v-model="subject"
                  @input="handleAutoSaveDraft"
                  placeholder="Subject line..."
                  class="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/[0.08] text-white text-xs font-semibold focus:outline-none focus:border-[#FFD700]"
                />
              </div>
            </div>

            <!-- Email Body Editor -->
            <div class="space-y-1.5">
              <label class="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block">
                Email Message Body:
              </label>
              <textarea
                rows="10"
                v-model="body"
                @input="handleAutoSaveDraft"
                placeholder="Write your email response to the client..."
                class="w-full p-4 rounded-2xl bg-black/50 border border-white/[0.08] text-white text-xs leading-relaxed focus:outline-none focus:border-[#FFD700] transition resize-y font-mono"
              ></textarea>
            </div>
          </div>

          <!-- ============================================== -->
          <!-- 2. THREAD CONVERSATION HISTORY VIEW -->
          <!-- ============================================== -->
          <div v-else class="space-y-4">
            <div class="p-3.5 rounded-2xl bg-black/40 border border-white/[0.06] flex items-center justify-between text-xs">
              <span class="text-neutral-400">
                Thread: <strong class="text-white">{{ inquiry.event_type }} Inquiry</strong>
              </span>
              <span class="text-neutral-500 font-mono text-[11px]">ID: {{ inquiry.id }}</span>
            </div>

            <!-- Messages Timeline -->
            <div class="space-y-3">
              <div
                v-for="msg in threadMessages"
                :key="msg.id"
                class="p-4 rounded-2xl border transition"
                :class="[
                  msg.sender === 'client'
                    ? 'bg-black/30 border-white/[0.08] ml-0 mr-6'
                    : 'bg-white/[0.05] border-white/20 ml-6 mr-0'
                ]"
              >
                <div class="flex items-center justify-between border-b border-white/[0.06] pb-2 mb-2">
                  <div class="flex items-center gap-2">
                    <span
                      class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider"
                      :class="[
                        msg.sender === 'client'
                          ? 'bg-blue-500/15 text-blue-300'
                          : 'bg-[#FFD700]/15 text-[#FFD700]'
                      ]"
                    >
                      {{ msg.sender === 'client' ? 'Client' : 'Studio Reply' }}
                    </span>
                    <strong class="text-xs text-white">{{ msg.sender_name }}</strong>
                    <span class="text-[11px] text-neutral-500">&lt;{{ msg.sender_email }}&gt;</span>
                  </div>
                  <span class="text-[11px] text-neutral-500">{{ formatMsgDate(msg.created_at) }}</span>
                </div>

                <p class="text-xs text-neutral-200 whitespace-pre-line leading-relaxed">
                  {{ msg.body }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Actions Bar -->
        <div class="px-6 py-4 border-t border-white/[0.08] bg-black/40 flex flex-wrap items-center justify-between gap-3">
          <!-- Discard / Save status -->
          <div class="flex items-center gap-2">
            <button
              @click="handleDiscard"
              type="button"
              class="cursor-pointer px-4 py-2 rounded-full border border-white/[0.08] text-neutral-400 hover:text-red-400 hover:border-red-500/30 text-xs font-semibold transition flex items-center gap-1.5"
              title="Discard current draft"
            >
              <Trash2 class="w-3.5 h-3.5" />
              <span>Discard Draft</span>
            </button>

            <button
              @click="handleAutoSaveDraft"
              type="button"
              class="cursor-pointer px-4 py-2 rounded-full bg-white/[0.05] hover:bg-white/10 text-neutral-300 hover:text-white text-xs font-semibold transition flex items-center gap-1.5"
            >
              <Save class="w-3.5 h-3.5" />
              <span>Save Draft</span>
            </button>
          </div>

          <!-- Send Action Button -->
          <div class="flex items-center gap-2">
            <button
              @click="emit('close')"
              class="cursor-pointer px-5 py-2 rounded-full border border-white/[0.08] text-neutral-400 hover:text-white text-xs font-medium"
            >
              Cancel
            </button>

            <button
              @click="handleSendReply"
              :disabled="!body.trim() || isSending"
              class="cursor-pointer px-6 py-2.5 rounded-full bg-[#FFD700] text-[#121212] font-bold text-xs uppercase tracking-wider hover:bg-yellow-400 transition shadow-lg shadow-yellow-500/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Loader2 v-if="isSending" class="w-4 h-4 animate-spin" />
              <Send v-else class="w-3.5 h-3.5" />
              <span>{{ isSending ? 'Sending via Sync...' : 'Send Email Reply' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
