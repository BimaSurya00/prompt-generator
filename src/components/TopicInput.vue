<template>
  <section class="text-center py-14">
    <div class="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-xs font-semibold text-soft mb-8">
      <span class="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
      AI STORYBOARD GENERATOR
    </div>
    <h1 class="font-display text-4xl sm:text-6xl font-bold tracking-tight leading-[1.1] mb-5">
      Satu topik.
      <br class="hidden sm:block" />
      <span class="text-accent">15 ide iklan</span> siap pakai.
    </h1>
    <p class="text-soft max-w-xl mx-auto text-base sm:text-lg mb-10">
      Generate storyboard prompt A/B untuk iklan video pendek 30–40 detik — dari ide sampai naskah adegan, dalam hitungan menit.
    </p>

    <div class="glass p-2 max-w-2xl mx-auto flex flex-col sm:flex-row gap-2 shadow-2xl shadow-black/20">
      <input
        v-model="topic"
        type="text"
        placeholder="Topikmu, misal: bisnis online, AI tools, crypto trading..."
        class="flex-1 bg-transparent border-0 px-4 py-3.5 text-text placeholder-faint focus:outline-none rounded-xl text-base sm:text-lg"
        :disabled="disabled"
        @keydown.enter="submit"
      />
      <button
        :disabled="disabled || !topic.trim()"
        class="bg-accent text-accent-contrast hover:bg-accent-strong disabled:opacity-40 disabled:cursor-not-allowed px-7 py-3.5 rounded-xl font-display font-bold text-sm tracking-wide transition-colors whitespace-nowrap flex items-center justify-center gap-2"
        @click="submit"
      >
        Generate 15 Ideas
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
        </svg>
      </button>
    </div>
  </section>
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
