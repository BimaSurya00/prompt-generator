<template>
  <div class="space-y-8">
    <div class="border border-edge rounded overflow-hidden">
      <div class="px-4 py-2.5 border-b border-edge bg-surface-strong">
        <span class="font-display font-bold text-sm text-faint uppercase">Activity Prompt</span>
      </div>

      <div class="p-4 sm:p-6 space-y-4">
        <div>
          <label class="text-xs text-soft block mb-1.5" for="act-char">Deskripsi karakter (wajib)</label>
          <textarea
            id="act-char"
            v-model="character"
            rows="3"
            placeholder="Contoh: Pria 22 tahun, badan kurus, rambut pendek hitam, wajah tirus, kaos putih oversized, celana training abu-abu"
            class="w-full bg-surface border border-edge rounded px-4 py-3 text-sm text-text placeholder-faint focus:outline-none focus:border-accent resize-none"
          ></textarea>
        </div>

        <div>
          <label class="text-xs text-soft block mb-1.5" for="act-list">Daftar kegiatan (satu per baris)</label>
          <textarea
            id="act-list"
            v-model="activitiesText"
            rows="5"
            placeholder="Makan nasi + lauk&#10;Ngegym angkat beban&#10;Minum susu GainMax"
            class="w-full bg-surface border border-edge rounded px-4 py-3 text-sm text-text placeholder-faint focus:outline-none focus:border-accent resize-none"
          ></textarea>
        </div>

        <div>
          <label class="text-xs text-soft block mb-1.5" for="act-instr">Instruksi tambahan (opsional — produk, gaya, dll)</label>
          <input
            id="act-instr"
            v-model="instructions"
            type="text"
            placeholder="Contoh: produk muncul di adegan minum susu, gaya sinematik realistis"
            class="w-full bg-surface border border-edge rounded px-4 py-3 text-sm text-text placeholder-faint focus:outline-none focus:border-accent"
          />
        </div>

        <div class="flex items-center gap-3">
          <label for="act-maxclip" class="text-xs text-soft">Max durasi/clip (detik)</label>
          <input
            id="act-maxclip"
            type="number"
            v-model.number="maxClipDuration"
            min="5"
            max="30"
            class="w-20 px-2.5 py-1.5 rounded bg-surface border border-edge text-sm text-text focus:outline-none focus:border-accent"
          />
          <label class="text-xs text-soft" for="act-model">Target model</label>
          <select
            id="act-model"
            v-model="model"
            class="ml-auto px-3 py-1.5 rounded bg-surface border border-edge text-sm text-text focus:outline-none focus:border-accent"
          >
            <option value="seedance">Seedance</option>
            <option value="kling">Kling</option>
            <option value="veo">Veo</option>
            <option value="wan">Wan</option>
            <option value="minimax">MiniMax</option>
            <option value="ltx">LTX</option>
            <option value="generic">Generic</option>
          </select>
        </div>

        <button
          class="w-full bg-accent text-accent-contrast hover:bg-accent-strong disabled:opacity-40 disabled:cursor-not-allowed py-3.5 rounded font-display font-bold text-sm transition-colors flex items-center justify-center gap-2"
          :disabled="loading || !character.trim() || !activitiesText.trim()"
          @click="generate"
        >
          <span v-if="loading" class="spinner"></span>
          {{ loading ? 'GENERATING...' : 'GENERATE PROMPT AKTIVITAS' }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex items-center gap-2.5 py-2">
      <span class="rec-dot"></span>
      <p class="font-mono text-xs tracking-widest text-accent uppercase">Membuat prompt aktivitas...</p>
      <div class="flex-1 h-px bg-surface-strong overflow-hidden">
        <div class="h-full loading-bar tape-stripe"></div>
      </div>
    </div>

    <p v-if="error" class="text-danger text-sm bg-danger/10 border border-danger/25 rounded px-4 py-3">{{ error }}</p>

    <PromptViewer
      v-if="result"
      :results="[{ ideaId: 'activity', idea: 'Prompt Aktivitas', prompts: [{ variant: 'A', content: result }] }]"
      single
      show-language-toggle
      :current-lang="resultLang"
      :translating="translating"
      @translate="onTranslate"
    />

    <div v-if="history.length" class="border border-edge rounded overflow-hidden">
      <div class="px-4 py-2.5 border-b border-edge bg-surface-strong">
        <span class="font-display font-bold text-sm text-faint uppercase">History Prompt Aktivitas</span>
      </div>
      <div class="divide-y divide-edge">
        <div
          v-for="item in history"
          :key="item.id"
          class="px-4 py-3 flex items-center justify-between gap-3 hover:bg-surface-hover transition-colors"
        >
          <button class="min-w-0 flex-1 text-left" @click="loadFromHistory(item)">
            <p class="text-sm text-text truncate">{{ item.character }}</p>
            <p class="text-xs text-soft mt-0.5">
              {{ item.model }} · {{ item.activities.split('\n').length }} kegiatan · {{ formatDate(item.created_at) }}
            </p>
          </button>
          <button
            class="text-danger text-xs font-semibold px-2.5 py-1 rounded hover:bg-danger/10 transition-colors flex-shrink-0"
            @click="removeHistory(item.id)"
          >Hapus</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { generateActivity, translateActivity, getActivityHistory, deleteActivityHistory } from '../api/index.js'
import PromptViewer from './PromptViewer.vue'

const character = ref('')
const activitiesText = ref('')
const instructions = ref('')
const model = ref('seedance')
const maxClipDuration = ref(10)

const loading = ref(false)
const error = ref('')
const result = ref('')
const resultLang = ref('en')
const translating = ref(false)
const history = ref([])

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso.replace(' ', 'T') + 'Z')
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) + ', ' +
    d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

async function loadHistory() {
  try {
    history.value = await getActivityHistory()
  } catch {}
}

onMounted(loadHistory)

function loadFromHistory(item) {
  character.value = item.character
  activitiesText.value = item.activities
  result.value = item.content
  resultLang.value = 'en'
  model.value = item.model === 'generic' ? 'generic' : item.model
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function removeHistory(id) {
  await deleteActivityHistory(id)
  await loadHistory()
  if (result.value && history.value.length === 0) result.value = ''
}

async function generate() {
  const activities = activitiesText.value.split('\n').map(a => a.trim()).filter(Boolean)
  if (!character.value.trim() || !activities.length) return
  loading.value = true
  error.value = ''
  result.value = ''
  try {
    const data = await generateActivity({
      character: character.value.trim(),
      activities,
      instructions: instructions.value.trim(),
      model: model.value,
      maxClipDuration: maxClipDuration.value,
    })
    result.value = data.content
    resultLang.value = 'en'
    await loadHistory()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function onTranslate(targetLang) {
  if (!result.value || resultLang.value === targetLang || translating.value) return
  translating.value = true
  error.value = ''
  try {
    const data = await translateActivity(result.value, targetLang)
    result.value = data.results[0].prompts[0].content
    resultLang.value = targetLang
  } catch (e) {
    error.value = e.message
  } finally {
    translating.value = false
  }
}
</script>