<script setup lang="ts">
import { ref } from 'vue'
import { getConcerts, getConcertById } from '../model/concerts'

const concerts = ref(null)
const concertById = ref(null)

const fetchConcerts = async () => {
  concerts.value = await getConcerts()
}

const fetchConcertById = async (id: any) => {
  concertById.value = await getConcertById(id)
}
</script>

<template>
  <div>
    <h1>Concert Data</h1>
    <button @click="fetchConcerts">Get Concert Data</button>
    <div v-if="concerts">
      <pre>{{ concerts }}</pre>
    </div>
    <button @click="fetchConcertById(1)">Get Concert By Id</button>
    <div v-if="concertById">
      <pre>{{ concertById }}</pre>
    </div>
  </div>
</template>

<style scoped></style>