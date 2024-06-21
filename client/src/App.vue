<script setup lang="ts">
import 'bootstrap/dist/js/bootstrap.bundle'
import NavBar from './components/NavBar.vue'
// import { RouterLink, RouterView } from 'vue-router'

</script>

<template>
  <nav class="mb-2">
    <NavBar />
  </nav>
  <div class="container">
    <RouterView />
  </div>
</template>

<style scoped></style>
