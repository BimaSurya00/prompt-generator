<template>
  <div class="glass p-6 sm:p-8">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <span class="w-8 h-8 rounded-lg bg-accent/15 text-accent font-display font-bold text-sm flex items-center justify-center">2</span>
        <h2 class="font-display text-lg font-bold">Pilih Ide</h2>
      </div>
      <div class="flex items-center gap-3">
        <div class="flex rounded-lg overflow-hidden border border-edge text-xs font-semibold">
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
          class="text-xs font-semibold text-soft hover:text-accent transition-colors"
          @click="selected = selected.length === ideas.length ? [] : ideas.map(i => i.id)"
        >
          {{ selected.length === ideas.length ? 'Deselect All' : 'Select All' }}
        </button>
        <span class="font-mono text-xs text-faint">{{ selected.length }}/{{ ideas.length }}</span>
      </div>
    </div>

    <div v-if="loading" class="space-y-3 mb-4">
      <div class="flex items-center gap-3 p-3">
        <span class="spinner"></span>
        <div>
          <p class="text-sm text-text">Membuat prompt A/B untuk {{ selected.length }} ide...</p>
          <p class="text-xs text-soft mt-1">Beberapa ide bisa memakan waktu</p>
        </div>
      </div>
      <div class="h-1 bg-surface-strong rounded-full overflow-hidden">
        <div class="h-full loading-bar"></div>
      </div>
    </div>

    <div v-else class="max-h-96 overflow-y-auto space-y-1.5 pr-1">
      <label
        v-for="(idea, i) in ideas"
        :key="idea.id"
        class="flex items-start gap-3 p-3.5 rounded-xl transition-colors cursor-pointer"
        :class="selected.includes(idea.id)
          ? 'bg-accent/8 border border-accent/25'
          : 'border border-transparent hover:bg-surface-hover'"
      >
        <input
          type="checkbox"
          :value="idea.id"
          v-model="selected"
          class="mt-0.5 w-4 h-4 rounded accent-[var(--accent)]"
          :disabled="loading"
        />
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-mono text-xs text-faint">{{ String(i + 1).padStart(2, '0') }}</span>
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
      </label>
    </div>

    <button
      class="mt-6 w-full bg-accent text-accent-contrast hover:bg-accent-strong disabled:opacity-40 disabled:cursor-not-allowed py-3.5 rounded-xl font-display font-bold text-sm tracking-wide transition-colors flex items-center justify-center gap-2"
      :disabled="loading || selected.length === 0"
      @click="$emit('generate', selected, lang)"
    >
      <span v-if="loading" class="spinner"></span>
      {{ loading ? 'Generating...' : `Generate Prompts (${selected.length} ide)` }}
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
