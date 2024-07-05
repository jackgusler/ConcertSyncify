import './assets/main.css'
import '@fortawesome/fontawesome-free/css/all.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'floating-vue/dist/style.css'

import { createApp } from 'vue'

import App from './App.vue'
import router from './router'
import FloatingVue from 'floating-vue'

const app = createApp(App)

app.use(router)

app.use(FloatingVue, {
  themes: {
    'tooltip-top': {
      $extend: 'tooltip',
      triggers: ['hover'],
      autoHide: true,
      placement: 'top'
    }
  }
})

app.mount('#app')
