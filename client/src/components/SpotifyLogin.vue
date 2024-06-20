<script setup lang="ts">
import { ref } from 'vue'
import { login } from '../model/spotify'

</script>

<template>
    <div>
        <h1>Spotify Login</h1>
        <button @click="login">Login with Spotify</button>
    </div>
</template>

<style scoped></style>