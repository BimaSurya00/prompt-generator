<template>
  <div class="space-y-8">
    <div class="flex justify-center">
      <div class="flex rounded-xl overflow-hidden border border-edge text-sm font-semibold">
        <button
          class="px-5 py-2.5 transition-colors"
          :class="mode === 'ideation' ? 'bg-accent text-accent-contrast' : 'text-soft hover:text-accent'"
          @click="mode = 'ideation'"
        >Mode Ideation</button>
        <button
          class="px-5 py-2.5 transition-colors"
          :class="mode === 'activity' ? 'bg-accent text-accent-contrast' : 'text-soft hover:text-accent'"
          @click="mode = 'activity'"
        >Mode Aktivitas</button>
      </div>
    </div>

    <template v-if="mode === 'ideation'">
      <TopicInput :disabled="state.loading" @submit="onTopicSubmit" />

      <div v-if="state.loading" class="glass p-8 text-center">
        <div class="flex items-center justify-center gap-3">
          <span class="spinner"></span>
          <p class="text-sm font-semibold text-accent">Membuat 15 ide...</p>
        </div>
        <div class="h-1 bg-surface-strong rounded-full overflow-hidden mt-5 max-w-md mx-auto">
          <div class="h-full loading-bar"></div>
        </div>
      </div>

      <p v-if="state.error" class="text-danger text-sm bg-danger/10 border border-danger/25 rounded-xl px-4 py-3">{{ state.error }}</p>

      <div v-if="state.ideas.length && !state.loading && !state.results.length" class="flex justify-end">
        <button
          class="text-xs font-semibold text-soft hover:text-accent transition-colors px-3.5 py-1.5 rounded-lg glass glass-hover"
          @click="resetAll"
        >Mulai Ulang</button>
      </div>

      <div v-if="state.ideas.length" class="flex items-center justify-end gap-2">
        <label for="maxClip" class="text-xs text-soft">Max durasi/clip (detik)</label>
        <input
          id="maxClip"
          type="number"
          v-model.number="maxClipDuration"
          min="5"
          max="60"
          class="w-20 px-2.5 py-1.5 rounded-lg bg-surface border border-edge text-sm text-text focus:outline-none focus:border-accent"
        />
        <label for="ideationModel" class="text-xs text-soft">Target model</label>
        <select
          id="ideationModel"
          v-model="model"
          class="px-3 py-1.5 rounded-lg bg-surface border border-edge text-sm text-text focus:outline-none focus:border-accent"
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
const { state, resetAll, generateIdeasAction, generatePromptsAction } = useGenerateStore()

const mode = ref('ideation')
const maxClipDuration = ref(15)
const model = ref('generic')

async function onTopicSubmit(topic) {
  await generateIdeasAction(topic, refreshUsage)
}

async function onGeneratePrompts(selectedIds, lang) {
  await generatePromptsAction(selectedIds, refreshUsage, lang, maxClipDuration.value, model.value)
}
</script>
