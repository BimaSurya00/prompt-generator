<template>
  <div class="space-y-8">
    <div class="text-center py-8">
      <h1 class="font-display text-3xl sm:text-4xl font-bold tracking-tight mb-2">History</h1>
      <p class="text-soft">Ide dan prompt yang pernah dibuat</p>
    </div>

    <div v-if="loading" class="flex items-center justify-center gap-3 text-soft py-16">
      <span class="spinner"></span>
      <span class="text-sm">Memuat...</span>
    </div>

    <div v-else-if="!topics.length" class="glass p-14 text-center">
      <div class="w-14 h-14 mx-auto rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-5">
        <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      </div>
      <p class="text-soft">Belum ada history. Mulai generate di halaman Generate.</p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="topic in topics"
        :key="topic.id"
        class="glass overflow-hidden transition-colors"
        :class="expanded === topic.id ? 'border-edge-hover' : ''"
      >
        <button
          class="w-full px-5 sm:px-6 py-4 flex items-center justify-between hover:bg-surface-hover transition-colors text-left"
          @click="toggleTopic(topic.id)"
        >
          <div class="min-w-0 pr-4">
            <h3 class="font-display font-semibold truncate">{{ topic.name }}</h3>
            <p class="text-xs text-soft mt-1">
              {{ formatDate(topic.created_at) }} · {{ topic.idea_count }} ide · {{ topic.selected_count }} ber-prompt
            </p>
          </div>
          <div class="flex items-center gap-3 flex-shrink-0">
            <svg class="w-3.5 h-3.5 text-faint transition-transform" :class="expanded === topic.id ? 'rotate-90' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <button
              class="text-danger text-xs font-semibold px-2.5 py-1 rounded-lg hover:bg-danger/10 transition-colors"
              @click.stop="handleDelete(topic.id)"
            >Hapus</button>
          </div>
        </button>

        <div v-if="expanded === topic.id" class="border-t border-edge px-5 sm:px-6 py-5 space-y-3">
          <div v-if="detailLoading === topic.id" class="flex items-center gap-2 text-soft py-4">
            <span class="spinner-sm"></span>
            <span class="text-sm">Memuat...</span>
          </div>
          <template v-else-if="detail">
            <div v-for="idea in detail.ideas" :key="idea.id" class="bg-surface rounded-xl p-4">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span
                      v-if="idea.angle_category"
                      class="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 font-semibold"
                    >{{ idea.angle_category }}</span>
                    <span
                      v-if="idea.total_score"
                      class="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-strong text-soft border border-edge font-mono"
                    >{{ Number(idea.total_score).toFixed(1) }}</span>
                  </div>
                  <p v-if="idea.hook_line" class="text-sm font-semibold text-text mt-1">{{ idea.hook_line }}</p>
                  <p class="text-sm text-soft leading-relaxed">{{ idea.one_line_concept || idea.content }}</p>
                </div>
                <span
                  class="text-[11px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
                  :class="idea.prompts?.length
                    ? 'bg-success/10 text-success border border-success/25'
                    : 'bg-surface-strong text-faint border border-edge'"
                >{{ idea.prompts?.length ? '✓ Prompt' : 'No prompt' }}</span>
              </div>
              <div v-if="idea.prompts?.length" class="space-y-2 mt-3">
                <div v-for="p in idea.prompts" :key="p.id" class="glass-strong rounded-xl p-3.5 text-sm">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-[11px] font-display font-bold uppercase tracking-wider"
                      :class="p.variant === 'A' ? 'text-variant-a' : 'text-variant-b'">
                      Varian {{ p.variant }}
                    </span>
                    <span
                      v-if="p.template_used"
                      class="text-[10px] px-2 py-0.5 rounded-full bg-surface-strong text-soft border border-edge font-semibold"
                    >{{ templateName(p.template_used) }}</span>
                  </div>
                  <p class="text-text mt-1.5 leading-relaxed line-clamp-3">{{ p.content }}</p>
                  <button class="mt-2 text-xs font-semibold text-soft hover:text-accent transition-colors" @click="copyText(p.content)">Copy</button>
                </div>
              </div>
              <button
                v-else
                class="mt-3 text-xs font-semibold bg-accent/10 hover:bg-accent/20 text-accent border border-accent/25 px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-2"
                :disabled="generating[idea.id]"
                @click.stop="generateForIdea(topic.id, idea.id, idea.content)"
              >
                <span v-if="generating[idea.id]" class="spinner-sm"></span>
                {{ generating[idea.id] ? 'Generating...' : 'Generate Prompts' }}
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>

  <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" @click.self="showDeleteConfirm = null">
    <div class="glass-strong p-6 max-w-sm w-full shadow-2xl">
      <div class="flex items-center gap-3 mb-4">
        <span class="w-10 h-10 rounded-xl bg-danger/12 text-danger flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </span>
        <p class="font-display font-bold text-sm">Hapus topik ini?</p>
      </div>
      <p class="text-sm text-soft mb-6">Semua ide & prompt di dalamnya ikut terhapus. Tidak bisa dibatalkan.</p>
      <div class="flex gap-3 justify-end">
        <button class="text-sm font-semibold text-soft hover:text-text px-4 py-2 rounded-lg glass glass-hover transition-colors" @click="showDeleteConfirm = null">Batal</button>
        <button class="text-sm font-semibold bg-danger hover:opacity-90 px-4 py-2 rounded-lg text-white transition-colors" @click="confirmDelete">Hapus</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, inject } from 'vue'

const refreshUsage = inject('refreshUsage', () => {})
import { getTopics, getTopicHistory, deleteTopic, generatePrompts } from '../api/index.js'

const topics = ref([])
const loading = ref(true)
const expanded = ref(null)
const detail = ref(null)
const detailLoading = ref(null)
const generating = reactive({})
const detailsCache = reactive({})

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso.replace(' ', 'T') + 'Z')
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' +
    d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

onMounted(async () => {
  topics.value = await getTopics()
  loading.value = false
})

async function toggleTopic(topicId) {
  if (expanded.value === topicId) {
    expanded.value = null
    detail.value = null
    return
  }
  expanded.value = topicId
  if (detailsCache[topicId]) {
    detail.value = detailsCache[topicId]
    return
  }
  detailLoading.value = topicId
  detail.value = null
  try {
    const data = await getTopicHistory(topicId)
    detailsCache[topicId] = data
    detail.value = data
  } finally {
    detailLoading.value = null
  }
}

async function generateForIdea(topicId, ideaId, ideaContent) {
  generating[ideaId] = true
  try {
    await generatePrompts([ideaId])
    refreshUsage()
    delete detailsCache[topicId]
    const data = await getTopicHistory(topicId)
    detailsCache[topicId] = data
    detail.value = data
  } catch (e) {
    console.error(e)
  } finally {
    delete generating[ideaId]
  }
}

const showDeleteConfirm = ref(null)

async function handleDelete(topicId) {
  showDeleteConfirm.value = topicId
}

async function confirmDelete() {
  const topicId = showDeleteConfirm.value
  if (!topicId) return
  await deleteTopic(topicId)
  topics.value = topics.value.filter(t => t.id !== topicId)
  if (expanded.value === topicId) {
    expanded.value = null
    detail.value = null
  }
  delete detailsCache[topicId]
  showDeleteConfirm.value = null
}

async function copyText(text) {
  await navigator.clipboard.writeText(text)
}

const templateNames = {
  testimonial_expert: 'Testimoni Profesional',
  unboxing_reveal: 'Unboxing & Reveal',
  before_after_split: 'Before-After',
  myth_bust: 'Myth Busting',
  pov_roleplay: 'POV Roleplay',
  activity_sequence: 'Rutinitas Aktivitas',
}

function templateName(id) {
  return templateNames[id] || id
}
</script>
