import { createRouter, createWebHistory } from 'vue-router'
import MainView from '../views/MainView.vue'
import DashboardView from '../views/DashboardView.vue'
import ErrorView from '@/views/ErrorView.vue'
import { isLoggedInSpotify } from '@/model/spotify'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: MainView
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }
    },
    {
      path: '/error',
      name: 'error',
      component: ErrorView
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const isLogged = await isLoggedInSpotify()

  if (requiresAuth && !isLogged) {
    next('/')
  } else {
    next()
  }
})

export default router
