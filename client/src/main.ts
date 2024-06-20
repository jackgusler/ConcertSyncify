import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()

authStore.loadTokensFromLocalStorage()

router.beforeEach((to, from, next) => {
  const urlParams = new URLSearchParams(window.location.search)
  const accessToken = urlParams.get('access_token')
  const refreshToken = urlParams.get('refresh_token')

  if (accessToken) {
    authStore.setAccessToken(accessToken)
  }
  if (refreshToken) {
    authStore.setRefreshToken(refreshToken)
  }

  next()
})
