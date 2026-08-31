import { createRouter, createWebHistory } from 'vue-router'
import GenerateView from '../views/GenerateView.vue'
import HistoryView from '../views/HistoryView.vue'

const routes = [
  { path: '/', name: 'generate', component: GenerateView },
  { path: '/history', name: 'history', component: HistoryView },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
