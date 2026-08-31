<template>
  <div class="glass p-6 sm:p-8">
    <div class="flex items-center gap-3 mb-6">
      <span class="w-8 h-8 rounded-lg bg-accent/15 text-accent font-display font-bold text-sm flex items-center justify-center">3</span>
      <h2 class="font-display text-lg font-bold">Prompt Storyboard A/B</h2>
    </div>

    <div class="space-y-6">
      <div v-for="item in results" :key="item.ideaId" class="glass-strong overflow-hidden">
        <div class="px-4 sm:px-6 py-3.5 text-sm font-semibold text-text border-b border-edge flex items-center gap-2">
          <span class="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0"></span>
          <span class="truncate">{{ item.idea }}</span>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 lg:divide-x lg:divide-edge divide-y lg:divide-y-0">
          <div v-for="(variant, vi) in item.prompts" :key="variant.variant" class="p-4 sm:p-6">
            <div class="flex items-center justify-between mb-5">
<span class="inline-flex items-center gap-2.5">
                  <span
                    v-if="!single"
                    class="px-2.5 py-1 rounded-full text-xs font-display font-bold tracking-wide"
                    :class="variant.variant === 'A'
                      ? 'bg-variant-a/12 text-variant-a border border-variant-a/25'
                      : 'bg-variant-b/12 text-variant-b border border-variant-b/25'">
                    VARIAN {{ variant.variant }}
                  </span>
                  <span v-if="!single" class="text-xs text-faint">{{ variant.variant === 'A' ? 'Form-Fill' : 'Prose/Narrative' }}</span>
                  <span
                    v-if="variant.template_used"
                    class="text-[10px] px-2 py-0.5 rounded-full bg-surface-strong text-soft border border-edge font-semibold"
                  >{{ templateName(variant.template_used) }}</span>
                  <span
                    v-if="totalDuration(variant.content)"
                    class="text-[10px] px-2 py-0.5 rounded-full bg-surface-strong text-soft border border-edge font-mono"
                  >{{ totalDuration(variant.content) }}s total</span>
                </span>
              <button
                class="text-xs font-semibold text-soft hover:text-accent transition-colors px-3 py-1.5 rounded-lg glass glass-hover"
                @click="copyFull(variant.content)"
              >
                {{ showCopied ? 'Tersalin!' : 'Copy all' }}
              </button>
            </div>

            <div v-if="!parseSections(variant.content).length" class="bg-surface rounded-xl p-4">
              <p class="text-xs text-faint mb-2">Tidak bisa parse section — output mentah:</p>
              <p class="text-sm text-text leading-relaxed whitespace-pre-wrap">{{ variant.content }}</p>
            </div>
            <div v-else class="space-y-2">
              <div
                v-for="(section, si) in parseSections(variant.content)"
                :key="si"
                class="border border-edge rounded-xl overflow-hidden transition-colors hover:border-edge-hover"
              >
                <button
                  class="w-full flex items-center justify-between px-4 py-2.5 text-left"
                  @click="toggleSection(`${item.ideaId}-${vi}-${si}`)"
                >
                  <span class="flex items-center gap-2 min-w-0">
                    <span class="text-xs font-display font-semibold text-soft uppercase tracking-wider truncate">
                      {{ section.title }}
                    </span>
                    <span
                      v-if="sectionDuration(section)"
                      class="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-strong text-soft border border-edge font-mono flex-shrink-0"
                    >{{ sectionDuration(section) }}s</span>
                  </span>
                  <svg class="w-3.5 h-3.5 text-faint flex-shrink-0 transition-transform"
                    :class="sectionsOpen[`${item.ideaId}-${vi}-${si}`] ? 'rotate-90' : ''"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <div v-if="sectionsOpen[`${item.ideaId}-${vi}-${si}`]" class="px-4 pb-4">
                  <p class="text-sm text-text leading-relaxed whitespace-pre-wrap">{{ section.body }}</p>
                  <button
                    class="mt-2.5 text-xs font-semibold text-soft hover:text-accent transition-colors"
                    @click="copyFull(section.body)"
                  >Copy</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  results: { type: Array, required: true },
  single: { type: Boolean, default: false },
})

const showCopied = ref(false)
const sectionsOpen = ref({})

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

function parseSections(text) {
  const sections = []
  // Storyboard format: blok METADATA di awal + blok === ADEGAN n — judul ===
  const parts = text.split(/^=== ADEGAN \d+/gm)
  if (parts.length > 1) {
    const meta = parts[0].trim()
    if (meta) sections.push({ title: 'METADATA CAMPAIGN', body: meta })
    for (let i = 1; i < parts.length; i++) {
      const lines = parts[i].split('\n')
      const title = 'ADEGAN ' + lines[0].trim().replace(/^=+\s*|\s*=+$/g, '').trim()
      const body = lines.slice(1).join('\n').trim()
      if (body) sections.push({ title, body })
    }
    return sections
  }
  // Variant B prose format: SHOT n — timestamp — title
  const shotParts = text.split(/^SHOT \d+/gm)
  if (shotParts.length > 1) {
    const meta = shotParts[0].trim()
    if (meta) sections.push({ title: 'OPENING', body: meta })
    for (let i = 1; i < shotParts.length; i++) {
      const lines = shotParts[i].split('\n')
      const title = 'SHOT ' + lines[0].trim().replace(/^—+\s*|\s*—+$/g, '').trim()
      const body = lines.slice(1).join('\n').trim()
      if (body) sections.push({ title, body })
    }
    return sections
  }
  // Activity mode format: opening paragraph + SCENE n — TITLE (x–ys) + CONTINUITY: + NEGATIVE:
  const sceneParts = text.split(/^(?=SCENE \d+ |CONTINUITY:|NEGATIVE:)/gm)
  if (sceneParts.length > 1) {
    const meta = sceneParts[0].trim()
    if (meta) sections.push({ title: 'DESKRIPSI VIDEO', body: meta })
    for (let i = 1; i < sceneParts.length; i++) {
      const lines = sceneParts[i].split('\n')
      const title = lines[0].trim().replace(/:$/, '')
      const body = lines.slice(1).join('\n').trim()
      if (title && body) sections.push({ title, body })
    }
    return sections
  }
  // Master video spec (Mode Aktivitas): # MASTER VIDEO SPEC / # CHARACTER BIBLE / # SCENE n / # GLOBAL NEGATIVE CONSTRAINTS
  const masterParts = text.split(/^# /gm)
  if (masterParts.length > 1) {
    for (let i = 1; i < masterParts.length; i++) {
      const lines = masterParts[i].split('\n')
      const title = lines[0].trim()
      const body = lines.slice(1).join('\n').trim()
      if (title && body) sections.push({ title, body })
    }
    return sections
  }
  // Legacy ## format (prompt lama di history)
  const legacy = text.split(/^## /gm)
  for (let i = 1; i < legacy.length; i++) {
    const lines = legacy[i].split('\n')
    const title = lines[0].trim()
    const body = lines.slice(1).join('\n').trim()
    if (body) sections.push({ title, body })
  }
  return sections
}

function toggleSection(key) {
  sectionsOpen.value = { ...sectionsOpen.value, [key]: !sectionsOpen.value[key] }
}

function sectionDuration(section) {
  const m = section.body.match(/DURASI:\s*(\d+)\s*detik/i)
  if (m) return Number(m[1])
  const t = section.title.match(/(\d+)\s*[-–]\s*(\d+)\s*(?:s|sec)/i)
  if (t) return Number(t[2]) - Number(t[1])
  const time = section.body.match(/TIME:\s*(\d+)\s*[-–]\s*(\d+)\s*seconds?/i)
  if (time) return Number(time[2]) - Number(time[1])
  return null
}

function totalDuration(content) {
  const secs = parseSections(content).map(s => sectionDuration(s)).filter(d => d !== null)
  if (!secs.length) return null
  return secs.reduce((a, b) => a + b, 0)
}

async function copyFull(text) {
  await navigator.clipboard.writeText(text)
  showCopied.value = true
  setTimeout(() => { showCopied.value = false }, 1500)
}
</script>
