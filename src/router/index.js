import { createRouter, createWebHistory } from 'vue-router'
import MapPage from '@/views/MapPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: MapPage,
    },
  ],
})

export default router
