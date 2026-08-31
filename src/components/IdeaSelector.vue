<template>
  <div class="border border-edge rounded overflow-hidden">
    <div class="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-edge bg-surface-strong">
      <div class="flex items-center gap-2">
        <span class="font-display font-bold text-sm text-faint uppercase">Shot List</span>
        <span class="font-mono text-xs text-faint">·</span>
        <span class="font-mono text-xs text-faint">{{ selected.length }}/{{ ideas.length }} dipilih</span>
      </div>
      <div class="flex items-center gap-3">
        <div class="flex rounded overflow-hidden border border-edge text-xs font-semibold">
          <button
            class="px-2.5 py-1 transition-colors"
            :class="lang === 'id' ? 'bg-accent text-accent-contrast' : 'text-soft hover:text-accent'"
            @click="lang = 'id'"
          >ID</button>
          <button
            class="px-2.5 py-1 transition-colors"
            :class="lang === 'en' ? 'bg-accent text-accent-contrast' : 'text-soft hover:text-accent'"
            @click="lang = 'en'"
          >EN</button>
        </div>
        <button
          class="text-xs font-semibold text-soft hover:text-accent transition-colors whitespace-nowrap"
          @click="selected = selected.length === ideas.length ? [] : ideas.map(i => i.id)"
        >
          {{ selected.length === ideas.length ? 'Deselect All' : 'Select All' }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="p-4 space-y-3">
      <div class="flex items-center gap-3">
        <span class="spinner"></span>
        <div>
          <p class="text-sm text-text">Membuat prompt A/B untuk {{ selected.length }} ide...</p>
          <p class="text-xs text-soft mt-1">Beberapa ide bisa memakan waktu</p>
        </div>
      </div>
      <div class="h-1 bg-surface-strong overflow-hidden">
        <div class="h-full loading-bar tape-stripe"></div>
      </div>
    </div>

    <div v-else class="max-h-[28rem] overflow-y-auto">
      <label
        v-for="(idea, i) in ideas"
        :key="idea.id"
        class="grid grid-cols-[2rem_1fr_auto] sm:grid-cols-[2.5rem_7rem_1fr_3rem] items-start gap-x-3 gap-y-1 px-4 py-3 border-b border-edge last:border-b-0 cursor-pointer transition-colors"
        :class="selected.includes(idea.id) ? 'bg-accent/8' : 'hover:bg-surface-hover'"
      >
        <span class="font-mono text-xs text-faint pt-0.5">{{ String(i + 1).padStart(2, '0') }}</span>

        <span
          v-if="idea.angle_category"
          class="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent border border-accent/20 font-semibold slate-tag uppercase self-start"
        >{{ idea.angle_category }}</span>
        <span v-else class="hidden sm:block"></span>

        <div class="min-w-0">
          <span
            v-if="idea.angle_category"
            class="sm:hidden inline-block text-[10px] px-1.5 py-0.5 mb-1 rounded bg-accent/10 text-accent border border-accent/20 font-semibold slate-tag uppercase"
          >{{ idea.angle_category }}</span>
          <p v-if="idea.hook_line" class="text-sm font-semibold text-text">{{ idea.hook_line }}</p>
          <p class="text-sm text-soft leading-relaxed">{{ idea.one_line_concept || idea.content }}</p>
        </div>

        <div class="flex items-center justify-end gap-2.5 pt-0.5">
          <span v-if="idea.total_score" class="font-mono text-xs text-faint">{{ Number(idea.total_score).toFixed(1) }}</span>
          <input
            type="checkbox"
            :value="idea.id"
            v-model="selected"
            class="w-4 h-4 rounded accent-[var(--accent)]"
            :disabled="loading"
          />
        </div>
      </label>
    </div>

    <button
      class="w-full bg-accent text-accent-contrast hover:bg-accent-strong disabled:opacity-40 disabled:cursor-not-allowed py-3 font-display font-bold text-sm transition-colors flex items-center justify-center gap-2"
      :disabled="loading || selected.length === 0"
      @click="$emit('generate', selected, lang)"
    >
      <span v-if="loading" class="spinner"></span>
      {{ loading ? 'GENERATING...' : `GENERATE PROMPTS (${selected.length} IDE)` }}
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  ideas: { type: Array, required: true },
  topicId: { type: String, required: true },
  loading: { type: Boolean, default: false },
})

defineEmits(['generate'])

const selected = ref([])
const lang = ref('id')
</script>
