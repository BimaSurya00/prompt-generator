<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between border-b border-edge">
      <div class="flex items-center gap-1">
        <button
          class="px-4 py-2 font-display font-bold text-base uppercase border-b-[3px] -mb-px transition-colors"
          :class="mode === 'ideation' ? 'border-accent text-accent' : 'border-transparent text-faint hover:text-soft'"
          @click="mode = 'ideation'"
        >Ideation</button>
        <button
          class="px-4 py-2 font-display font-bold text-base uppercase border-b-[3px] -mb-px transition-colors"
          :class="mode === 'activity' ? 'border-accent text-accent' : 'border-transparent text-faint hover:text-soft'"
          @click="mode = 'activity'"
        >Aktivitas</button>
      </div>
      <p class="hidden sm:block text-xs text-faint pr-1">
        {{ mode === 'ideation' ? '1 topik → 15 ide → storyboard A/B' : 'Karakter + daftar aktivitas → 1 naskah 30 detik' }}
      </p>
    </div>

    <template v-if="mode === 'ideation'">
      <TopicInput :disabled="state.loading" @submit="onTopicSubmit" />

      <div v-if="state.loading" class="flex items-center gap-2.5 py-2">
        <span class="rec-dot"></span>
        <p class="font-mono text-xs tracking-widest text-accent uppercase">Membuat 15 ide...</p>
        <div class="flex-1 h-px bg-surface-strong overflow-hidden">
          <div class="h-full loading-bar tape-stripe"></div>
        </div>
      </div>

      <p v-if="state.error" class="text-danger text-sm bg-danger/10 border border-danger/25 rounded px-4 py-3">{{ state.error }}</p>

      <div v-if="state.ideas.length" class="flex items-center justify-between gap-2 flex-wrap">
        <button
          v-if="!state.loading && !state.results.length"
          class="text-xs font-semibold text-soft hover:text-accent transition-colors px-3 py-1.5 rounded glass glass-hover"
          @click="resetAll"
        >Mulai Ulang</button>
        <span v-else></span>

        <div class="flex items-center gap-2">
          <label for="maxClip" class="text-xs text-soft">Max durasi/clip (detik)</label>
          <input
            id="maxClip"
            type="number"
            v-model.number="maxClipDuration"
            min="5"
            max="60"
            class="w-20 px-2.5 py-1.5 rounded bg-surface border border-edge text-sm text-text focus:outline-none focus:border-accent"
          />
          <label for="ideationModel" class="text-xs text-soft">Target model</label>
          <select
            id="ideationModel"
            v-model="model"
            class="px-3 py-1.5 rounded bg-surface border border-edge text-sm text-text focus:outline-none focus:border-accent"
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
      </div>

      <IdeaSelector
        v-if="state.ideas.length"
        :ideas="state.ideas"
        :topic-id="state.topicId"
        :loading="state.generatingPrompts"
        @generate="onGeneratePrompts"
      />
      <PromptViewer
        v-if="state.results.length"
        :results="state.results"
        show-language-toggle
        :current-lang="state.resultsLang"
        :translating="state.translating"
        @translate="onTranslate"
      />
      <p v-if="state.results.length && state.lastUsage?.total_tokens" class="font-mono text-xs text-faint text-center">
        Generasi ini memakai {{ state.lastUsage.total_tokens.toLocaleString() }} token
        ({{ state.lastUsage.prompt_tokens?.toLocaleString() }} prompt + {{ state.lastUsage.completion_tokens?.toLocaleString() }} completion)
      </p>
    </template>

    <ActivityPrompt v-else />
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'
import { useGenerateStore } from '../stores/generate.js'
import TopicInput from '../components/TopicInput.vue'
import IdeaSelector from '../components/IdeaSelector.vue'
import PromptViewer from '../components/PromptViewer.vue'
import ActivityPrompt from '../components/ActivityPrompt.vue'

const refreshUsage = inject('refreshUsage', () => {})
const { state, resetAll, generateIdeasAction, generatePromptsAction, translateResultsAction } = useGenerateStore()

const mode = ref('ideation')
const maxClipDuration = ref(15)
const model = ref('generic')

async function onTopicSubmit(topic) {
  await generateIdeasAction(topic, refreshUsage)
}

async function onGeneratePrompts(selectedIds, lang) {
  await generatePromptsAction(selectedIds, refreshUsage, lang, maxClipDuration.value, model.value)
}

async function onTranslate(targetLang) {
  await translateResultsAction(targetLang, refreshUsage)
}
</script>
