import './assets/main.css'
import '@fortawesome/fontawesome-free/css/all.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'floating-vue/dist/style.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import FloatingVue from 'floating-vue'

const app = createApp(App)

app.use(createPinia())
app.use(router)
// Configure FloatingVue with your custom theme
app.use(FloatingVue, {
  themes: {
    'tooltip-top': {
      '$extend': 'tooltip', // Extend the default tooltip theme
      triggers: ['hover'], // Trigger the tooltip on hover
      autoHide: true, // Automatically hide the tooltip
      placement: 'top', // Place the tooltip at the top
    },
  },
})

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