<script setup lang="ts">
import 'bootstrap/dist/js/bootstrap.bundle'
import NavBar from './components/NavBar.vue'
// import { RouterLink, RouterView } from 'vue-router'

</script>

<template>
  <nav>
    <NavBar />
  </nav>
  <div>
    <RouterView />
  </div>
</template>

<style scoped></style>
