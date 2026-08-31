<template>
  <div class="min-h-screen">
    <nav class="glass-nav sticky top-0 z-40">
      <div class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        <router-link to="/" class="flex items-center gap-2.5 group">
          <span class="w-8 h-8 rounded overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
            <svg viewBox="0 0 32 32" class="w-full h-full block">
              <defs>
                <pattern id="clapper-stripes" width="8" height="32" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
                  <rect width="4" height="32" fill="var(--bg)" />
                  <rect x="4" width="4" height="32" fill="var(--accent)" />
                </pattern>
              </defs>
              <rect width="32" height="32" fill="var(--accent)" />
              <rect width="32" height="10" fill="url(#clapper-stripes)" />
              <rect y="10" width="32" height="1.5" fill="var(--bg)" />
            </svg>
          </span>
          <span class="font-display text-sm font-bold uppercase">Prompt<span class="text-accent">Generator</span></span>
        </router-link>

        <div class="flex items-center gap-4">
          <div class="hidden md:flex items-center gap-1.5 font-mono text-[11px] text-faint tabular-nums">
            <span>{{ String(usage.requests || 0).padStart(3, '0') }} REQ</span>
            <span class="text-edge-hover">·</span>
            <span>{{ formatTokens(usage.total_tokens) }} TOK</span>
          </div>

          <nav class="flex items-center gap-1 rounded glass p-1 text-sm">
            <router-link to="/"
              class="px-3.5 py-1.5 rounded transition-colors"
              :class="$route.name === 'generate'
                ? 'bg-accent text-accent-contrast font-semibold'
                : 'text-soft hover:text-text'">
              Generate
            </router-link>
            <router-link to="/history"
              class="px-3.5 py-1.5 rounded transition-colors"
              :class="$route.name === 'history'
                ? 'bg-accent text-accent-contrast font-semibold'
                : 'text-soft hover:text-text'">
              History
            </router-link>
          </nav>

          <button
            class="w-9 h-9 rounded-full glass glass-hover flex items-center justify-center text-soft hover:text-accent transition-colors"
            @click="toggleTheme"
            :title="isLight ? 'Switch to dark mode' : 'Switch to light mode'"
          >
            <svg v-if="isLight" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
            </svg>
            <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
            </svg>
          </button>
        </div>
      </div>
    </nav>

    <main class="max-w-6xl mx-auto px-6 py-10">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, provide } from 'vue'
import { getUsage } from './api/index.js'

const usage = ref({ requests: 0, total_tokens: 0 })
const isLight = ref(false)

function formatTokens(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return n.toString()
}

function toggleTheme() {
  isLight.value = !isLight.value
  document.documentElement.classList.toggle('light', isLight.value)
  try {
    localStorage.setItem('theme', isLight.value ? 'light' : 'dark')
  } catch {}
}

async function refreshUsage() {
  try {
    usage.value = await getUsage()
  } catch {}
}

provide('refreshUsage', refreshUsage)
onMounted(() => {
  isLight.value = document.documentElement.classList.contains('light')
  refreshUsage()
})
</script>
