import { reactive } from 'vue'
import { generateIdeas, generatePrompts } from '../api/index.js'

// Store module-level: state hidup di luar komponen, jadi pindah route
// tidak menghancurkan hasil generate yang sedang berjalan / sudah selesai.
const state = reactive({
  ideas: [],
  topicId: null,
  results: [],
  loading: false,
  generatingPrompts: false,
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
      state.lastUsage = data.usage
      refreshUsage()
    } catch (e) {
      if (e.name !== 'AbortError') state.error = e.message
    } finally {
      state.generatingPrompts = false
    }
  }

  return { state, resetAll, generateIdeasAction, generatePromptsAction }
}
