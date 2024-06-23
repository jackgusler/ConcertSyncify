<script setup lang="ts">
import { type Genre, getTopGenres } from '@/model/spotify';
import { onMounted, ref, nextTick } from 'vue';
const genres = ref<Genre[]>([]);

onMounted(async () => {
    const topGenres = await getTopGenres();
    genres.value = topGenres;
});
</script>

<template>
    <div class="genre-container">
        <div v-for="genre in genres" :key="genre.genre" class="genre-card">
            <img :src="genre.image" :alt="`Genre: ${genre.genre}`" class="genre-image"/>
            <div class="genre-name">{{ genre.genre }}</div>
        </div>
    </div>
</template>

<style scoped>

</style>