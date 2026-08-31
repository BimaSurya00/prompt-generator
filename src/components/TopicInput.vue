<template>
  <div class="flex flex-col sm:flex-row sm:items-center gap-2 border border-edge rounded px-3 py-2.5 bg-surface">
    <label for="topic-field" class="font-mono text-[11px] tracking-[0.15em] text-faint uppercase shrink-0 sm:pl-1">
      Topic
    </label>
    <input
      id="topic-field"
      v-model="topic"
      type="text"
      placeholder="bisnis online, AI tools, crypto trading..."
      class="flex-1 bg-transparent border-0 px-1 py-1 text-text placeholder-faint focus:outline-none text-sm"
      :disabled="disabled"
      @keydown.enter="submit"
    />
    <button
      :disabled="disabled || !topic.trim()"
      class="bg-accent text-accent-contrast hover:bg-accent-strong disabled:opacity-40 disabled:cursor-not-allowed px-5 py-2 rounded font-display font-bold text-xs transition-colors whitespace-nowrap flex items-center justify-center gap-2 shrink-0"
      @click="submit"
    >
      GENERATE 15 IDEAS
      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({ disabled: Boolean })
const emit = defineEmits(['submit'])

const topic = ref('')

function submit() {
  const val = topic.value.trim()
  if (!val || props.disabled) return
  emit('submit', val)
  topic.value = ''
}
</script>
