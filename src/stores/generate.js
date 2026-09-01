import { reactive } from 'vue'
import { generateIdeas, generatePrompts, translateStoryboards } from '../api/index.js'

// Store module-level: state hidup di luar komponen, jadi pindah route
// tidak menghancurkan hasil generate yang sedang berjalan / sudah selesai.
const state = reactive({
  ideas: [],
  topicId: null,
  results: [],
  resultsLang: 'id',
  loading: false,
  generatingPrompts: false,
  translating: false,
  error: '',
  lastUsage: null,
})

let abortCtrl = null

export function useGenerateStore() {
  function resetAll() {
    abortCtrl?.abort()
    state.ideas = []
    state.topicId = null
    state.results = []
    state.resultsLang = 'id'
    state.error = ''
    state.lastUsage = null
  }

  async function generateIdeasAction(topic, refreshUsage) {
    abortCtrl?.abort()
    abortCtrl = new AbortController()
    state.loading = true
    state.error = ''
    state.ideas = []
    state.results = []
    try {
      const data = await generateIdeas(topic, abortCtrl.signal)
      state.ideas = data.ideas
      state.topicId = data.topicId
      refreshUsage()
    } catch (e) {
      if (e.name !== 'AbortError') state.error = e.message
    } finally {
      state.loading = false
    }
  }

  async function generatePromptsAction(selectedIds, refreshUsage, language = 'id', maxClipDuration = 15, model = 'generic') {
    abortCtrl?.abort()
    abortCtrl = new AbortController()
    state.generatingPrompts = true
    state.error = ''
    try {
      const data = await generatePrompts(selectedIds, abortCtrl.signal, language, maxClipDuration, model)
      state.results = data.results
      state.resultsLang = language
      state.lastUsage = data.usage
      refreshUsage()
    } catch (e) {
      if (e.name !== 'AbortError') state.error = e.message
    } finally {
      state.generatingPrompts = false
    }
  }

  async function translateResultsAction(targetLang, refreshUsage) {
    if (!state.results.length || state.resultsLang === targetLang || state.translating) return
    state.translating = true
    state.error = ''
    try {
      const data = await translateStoryboards(state.results, targetLang)
      state.results = data.results
      state.resultsLang = targetLang
      if (data.usage) {
        state.lastUsage = {
          prompt_tokens: (state.lastUsage?.prompt_tokens || 0) + (data.usage.prompt_tokens || 0),
          completion_tokens: (state.lastUsage?.completion_tokens || 0) + (data.usage.completion_tokens || 0),
          total_tokens: (state.lastUsage?.total_tokens || 0) + (data.usage.total_tokens || 0),
        }
      }
      refreshUsage()
    } catch (e) {
      state.error = e.message
    } finally {
      state.translating = false
    }
  }

  return { state, resetAll, generateIdeasAction, generatePromptsAction, translateResultsAction }
}
