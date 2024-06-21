<script setup lang="ts">
import { ref } from 'vue'
import { login, logout } from '../model/spotify'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

// Function to handle login
const handleLogin = () => {
  login().then(() => {
    // Assuming login function updates the authStore with the accessToken
  })
}

// Function to handle logout
const handleLogout = () => {
  logout().then(() => {
    // Assuming logout function clears the accessToken from the authStore
  })
}

</script>

<template>
    <div>
        <h1>Spotify Authentication</h1>
        <!-- Show login button if accessToken is not present -->
        <button v-if="!authStore.accessToken" @click="handleLogin">Login with Spotify</button>
        <!-- Show logout button if accessToken is present -->
        <button v-else @click="handleLogout">Logout</button>
    </div>
</template>

<style scoped></style>